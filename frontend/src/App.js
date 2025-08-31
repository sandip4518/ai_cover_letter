// frontend/src/App.js

import React, { useState } from "react";
import "./App.css";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    setSkills([]);
    if (!file) return;
    setExtractingSkills(true);
    setActiveStep(2);
    
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/extract-skills", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Failed to extract skills:", error);
      setSkills([]);
    } finally {
      setExtractingSkills(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description");
      return;
    }
    
    setIsLoading(true);
    setCoverLetter("");
    setActiveStep(3);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_text: skills.join(", "),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCoverLetter(data.cover_letter);
    } catch (error) {
      console.error("Failed to generate cover letter:", error);
      setCoverLetter(
        "An error occurred while generating your cover letter. Please check that your backend server is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  const resetForm = () => {
    setJobDescription("");
    setResumeFile(null);
    setSkills([]);
    setCoverLetter("");
    setActiveStep(1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📝</div>
            <h1 className="logo-text">AI Cover Letter Generator</h1>
          </div>
          <p className="header-subtitle">
            Create professional cover letters in seconds with AI-powered precision
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Job Description Section */}
          <div className="section compact-section">
            <h2 className="section-title">
              <span className="section-icon">💼</span>
              Job Description
            </h2>
            <textarea
              className="job-description-input compact-input"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
            <div className="input-footer">
              <span className="char-count">{jobDescription.length} characters</span>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="section compact-section">
            <h2 className="section-title">
              <span className="section-icon">📄</span>
              Upload Your Resume
            </h2>
            <div className="upload-area compact-upload">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="file-input"
              />
              <label htmlFor="resume-upload" className="upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <strong>Choose a file</strong> or drag it here
                </div>
                <div className="upload-hint">PDF, DOC, or DOCX files only</div>
              </label>
              {resumeFile && (
                <div className="file-info">
                  <span className="file-name">✓ {resumeFile.name}</span>
                </div>
              )}
            </div>
            
            {extractingSkills && (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Extracting skills...</span>
              </div>
            )}
            
            {skills.length > 0 && (
              <div className="skills-section">
                <h3 className="skills-title">Extracted Skills:</h3>
                <div className="skills-grid">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="section compact-section">
            <button
              className="generate-btn"
              onClick={handleGenerateClick}
              disabled={isLoading || extractingSkills || !skills.length || !jobDescription.trim()}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Generating your cover letter...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Cover Letter Output */}
          <div className="section compact-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📝</span>
                Your Cover Letter
              </h2>
              {coverLetter && (
                <button className="copy-btn" onClick={copyToClipboard}>
                  <span className="copy-icon">📋</span>
                  Copy
                </button>
              )}
            </div>
            
            <div className="cover-letter-container compact-output">
              {coverLetter ? (
                <div className="cover-letter-content">
                  {coverLetter.split('\n').map((paragraph, index) => (
                    <p key={index} className="paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="placeholder">
                  <div className="placeholder-icon">📄</div>
                  <p>Your AI-generated cover letter will appear here</p>
                  <small>Upload your resume and add a job description to get started</small>
                </div>
              )}
            </div>
            
            {coverLetter && (
              <div className="action-buttons">
                <button className="secondary-btn" onClick={copyToClipboard}>
                  <span className="btn-icon">📋</span>
                  Copy to Clipboard
                </button>
                <button className="secondary-btn" onClick={resetForm}>
                  <span className="btn-icon">🔄</span>
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Powered by Google Gemini AI • Built with React & Flask</p>
      </footer>
    </div>
  );
}

export default App;
