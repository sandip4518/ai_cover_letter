# main.py

import os
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import tempfile
import pdfplumber
import docx
from flask_cors import CORS

# --- INITIAL SETUP ---
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")
genai.configure(api_key=api_key)

# --- FLASK APP CREATION ---
app = Flask(__name__)
CORS(app)  # Allow React frontend to talk to this server

# --- DEFAULT ROUTE ---
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🚀 Server is running! Use POST /api/generate to create a cover letter."
    })

# --- API ENDPOINT ---
@app.route("/api/generate", methods=["POST"])
def generate_cover_letter_api():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        resume_text = data.get("resume_text")
        job_description = data.get("job_description")

        if not resume_text or not job_description:
            return jsonify({"error": "Missing resume_text or job_description"}), 400

        prompt = f"""
        You are a professional career advisor. Based on the provided resume and job description, write a compelling, three-paragraph cover letter.
        The tone should be professional yet enthusiastic.
        Connect the skills from the resume directly to the requirements in the job description.

        ---
        RESUME:
        {resume_text}
        ---
        JOB DESCRIPTION:
        {job_description}
        ---
        """

        print("Generating cover letter... 🤖")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)

        cover_letter = response.candidates[0].content.parts[0].text

        return jsonify({"cover_letter": cover_letter})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": f"An error occurred: {e}"}), 500


# --- SKILL EXTRACTION ENDPOINT ---
@app.route("/api/extract-skills", methods=["POST"])
def extract_skills_api():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400
        file = request.files["resume"]
        filename = secure_filename(file.filename)
        ext = filename.split(".")[-1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix="."+ext) as tmp:
            file.save(tmp.name)
            resume_text = ""
            if ext == "pdf":
                with pdfplumber.open(tmp.name) as pdf:
                    for page in pdf.pages:
                        resume_text += page.extract_text() or ""
            elif ext in ["doc", "docx"]:
                doc = docx.Document(tmp.name)
                resume_text = "\n".join([p.text for p in doc.paragraphs])
            else:
                return jsonify({"error": "Unsupported file type"}), 400

        # Use Gemini to extract skills
        prompt = f"""
        Extract a concise list of relevant professional skills from the following resume text. Return only the skills as a comma-separated list.
        ---
        {resume_text}
        ---
        """
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        skills_text = response.candidates[0].content.parts[0].text
        # Split skills by comma and strip whitespace
        skills = [s.strip() for s in skills_text.split(",") if s.strip()]
        return jsonify({"skills": skills})
    except Exception as e:
        print(f"Skill extraction error: {e}")
        return jsonify({"error": f"Skill extraction error: {e}"}), 500

# --- RUN THE SERVER ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)
