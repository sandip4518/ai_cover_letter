# AI Cover Letter Generator

Generate professional cover letters and extract skills from your resume using AI (Google Gemini). This project consists of a Flask backend and a React frontend.

## Features

- Upload your resume (PDF, DOC, DOCX)
- Extract relevant skills using AI
- Input job description
- Generate a tailored cover letter
- Modern, responsive UI

---

## Backend (Flask)

- **Location:** `backend/`
- **Main file:** `main.py`
- **API Endpoints:**
  - `GET /` — Health check
  - `POST /api/generate` — Generate cover letter (requires `resume_text` and `job_description`)
  - `POST /api/extract-skills` — Extract skills from uploaded resume file
- **Requirements:**
  - Python 3.12+
  - Install dependencies: `pip install -r requirements.txt`
  - Set up `.env` file with your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
- **Run:**
  ```bash
  python main.py
  ```

---

## Frontend (React)

- **Location:** `frontend/`
- **Main file:** `src/App.js`
- **Features:**
  - Upload resume
  - Input job description
  - View extracted skills
  - Generate and copy cover letter
- **Requirements:**
  - Node.js 18+
  - Install dependencies: `npm install`
- **Run:**
  ```bash
  npm start
  ```

---

## Usage

1. Start the backend server (`python main.py`).
2. Start the frontend (`npm start`).
3. Open the frontend in your browser.
4. Upload your resume, enter a job description, and generate your cover letter.

---

## Folder Structure

```
backend/
  main.py
  requirements.txt
frontend/
  package.json
  public/
  src/
```

---

## License

MIT (see individual package licenses for dependencies)

---

## Credits

- Google Gemini Generative AI
- Flask, React
- UI inspired by modern web apps
