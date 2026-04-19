# 🚀 ResumeAI — AI Resume Analyzer & Job Matcher

Full-stack AI resume analyzer: **Flask** backend + **React + Tailwind + Framer Motion** frontend.

---

## ⚡ Quick Start

### 1. Backend (Flask) — Terminal 1

```bash
cd backend
pip install -r requirements.txt
python app.py
```
→ Runs on **http://localhost:5000**

---

### 2. Frontend (React + Vite) — Terminal 2

```bash
cd frontend
npm install
npm start
```
→ Opens **http://localhost:3000** automatically

---

## 🎯 How to Use

1. Open **http://localhost:3000** in your browser
2. Click **"Analyze My Resume"**
3. Upload your PDF or TXT resume (`sample_resume.txt` is included for testing)
4. Get instant **ATS Score**, **Skills Breakdown**, **Suggestions**, and **Job Matches**

---

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── app.py                  # Flask API (all logic included)
│   ├── requirements.txt
│   └── uploads/                # Auto-created on first upload
├── frontend/
│   ├── index.html              # Vite entry point
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── src/
│       ├── index.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── Landing.jsx     # Hero + features
│       │   ├── Upload.jsx      # Drag & drop upload
│       │   ├── Dashboard.jsx   # ATS score + skill breakdown
│       │   └── Jobs.jsx        # Job match browser
│       ├── components/
│       │   └── Navbar.jsx
│       └── utils/
│           └── api.js          # Pre-configured to localhost:5000
└── sample_resume.txt           # Test resume
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload_resume` | Upload resume file |
| POST | `/analyze` | Analyze uploaded resume |
| GET | `/results/<session_id>` | Cached results |
| GET | `/jobs` | All job listings |

---

## 🛠 Tech Stack

- **Backend**: Python 3, Flask, Flask-CORS, pdfplumber
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, Framer Motion, Axios
