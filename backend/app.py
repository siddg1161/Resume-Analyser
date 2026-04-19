from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
import uuid
import pdfplumber
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── In-memory store ──────────────────────────────────────────────────────────
sessions = {}

# ── Skill taxonomy ───────────────────────────────────────────────────────────
SKILL_CATEGORIES = {
    "Languages": [
        "python","java","javascript","typescript","c++","c#","go","rust","swift",
        "kotlin","ruby","php","scala","r","matlab","dart","perl","bash","shell",
        "html","css","sql","graphql","solidity",
    ],
    "Frameworks": [
        "react","angular","vue","next.js","nuxt","svelte","django","flask","fastapi",
        "spring","express","nestjs","laravel","rails","asp.net","tensorflow",
        "pytorch","keras","scikit-learn","pandas","numpy","opencv",
    ],
    "Cloud & DevOps": [
        "aws","azure","gcp","docker","kubernetes","terraform","ansible","jenkins",
        "github actions","gitlab ci","circleci","helm","prometheus","grafana",
        "nginx","apache","linux","ubuntu",
    ],
    "Databases": [
        "mysql","postgresql","mongodb","redis","elasticsearch","sqlite","cassandra",
        "dynamodb","firebase","supabase","neo4j","bigquery","snowflake",
    ],
    "Tools": [
        "git","github","gitlab","jira","confluence","figma","postman","swagger",
        "vs code","intellij","xcode","android studio","tableau","power bi",
    ],
    "Soft Skills": [
        "leadership","communication","teamwork","problem solving","agile","scrum",
        "project management","critical thinking","mentoring","collaboration",
    ],
}

ALL_SKILLS = {s: cat for cat, skills in SKILL_CATEGORIES.items() for s in skills}

ATS_KEYWORDS = [
    "experience","education","skills","projects","achievements","certifications",
    "summary","objective","responsibilities","accomplishments",
]

# ── Dummy job dataset ─────────────────────────────────────────────────────────
JOBS = [
    {
        "id": "j1",
        "title": "Senior Full-Stack Engineer",
        "company": "TechNova Inc.",
        "location": "San Francisco, CA (Remote)",
        "salary": "$140,000 – $180,000",
        "type": "Full-time",
        "posted": "2 days ago",
        "description": "Build scalable web applications using React, Node.js, and AWS. Lead architecture decisions and mentor junior engineers.",
        "required_skills": ["react","javascript","node.js","aws","postgresql","docker","git"],
        "nice_to_have": ["typescript","kubernetes","graphql"],
        "logo": "TN",
        "color": "#6366f1",
    },
    {
        "id": "j2",
        "title": "Machine Learning Engineer",
        "company": "DataMind AI",
        "location": "New York, NY (Hybrid)",
        "salary": "$130,000 – $170,000",
        "type": "Full-time",
        "posted": "1 day ago",
        "description": "Design and deploy ML models at scale. Work with large datasets and cutting-edge LLMs to solve real business problems.",
        "required_skills": ["python","tensorflow","pytorch","scikit-learn","sql","docker","git"],
        "nice_to_have": ["aws","kubernetes","spark"],
        "logo": "DM",
        "color": "#8b5cf6",
    },
    {
        "id": "j3",
        "title": "DevOps / Platform Engineer",
        "company": "CloudSphere",
        "location": "Austin, TX (Remote)",
        "salary": "$120,000 – $155,000",
        "type": "Full-time",
        "posted": "3 days ago",
        "description": "Manage cloud infrastructure, CI/CD pipelines, and reliability engineering for a high-traffic SaaS platform.",
        "required_skills": ["aws","docker","kubernetes","terraform","linux","bash","git"],
        "nice_to_have": ["ansible","prometheus","grafana"],
        "logo": "CS",
        "color": "#06b6d4",
    },
    {
        "id": "j4",
        "title": "Frontend Engineer",
        "company": "PixelCraft Studio",
        "location": "Los Angeles, CA (On-site)",
        "salary": "$100,000 – $135,000",
        "type": "Full-time",
        "posted": "5 days ago",
        "description": "Craft pixel-perfect, performant UIs for consumer-facing products with millions of users.",
        "required_skills": ["react","typescript","css","html","javascript","figma","git"],
        "nice_to_have": ["vue","next.js","graphql"],
        "logo": "PC",
        "color": "#f59e0b",
    },
    {
        "id": "j5",
        "title": "Backend Engineer (Python)",
        "company": "Finova Systems",
        "location": "Chicago, IL (Remote)",
        "salary": "$115,000 – $150,000",
        "type": "Full-time",
        "posted": "1 week ago",
        "description": "Build high-performance APIs and microservices for a fintech platform processing millions of transactions daily.",
        "required_skills": ["python","django","fastapi","postgresql","redis","docker","aws"],
        "nice_to_have": ["kafka","elasticsearch","kubernetes"],
        "logo": "FV",
        "color": "#10b981",
    },
    {
        "id": "j6",
        "title": "Data Engineer",
        "company": "Prism Analytics",
        "location": "Seattle, WA (Hybrid)",
        "salary": "$125,000 – $160,000",
        "type": "Full-time",
        "posted": "4 days ago",
        "description": "Design data pipelines, warehouses, and ETL processes to power company-wide analytics.",
        "required_skills": ["python","sql","spark","bigquery","airflow","git"],
        "nice_to_have": ["snowflake","dbt","kafka"],
        "logo": "PA",
        "color": "#ef4444",
    },
]


# ── Helpers ──────────────────────────────────────────────────────────────────
def extract_text_from_pdf(path):
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
    except Exception as e:
        text = f"[PDF parse error: {e}]"
    return text


def extract_skills(text):
    text_lower = text.lower()
    found = {}
    for skill, category in ALL_SKILLS.items():
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found[skill] = category
    return found


def calculate_ats_score(text, skills):
    score = 0
    text_lower = text.lower()

    # Section keywords (30 pts)
    section_hits = sum(1 for kw in ATS_KEYWORDS if kw in text_lower)
    score += min(30, section_hits * 3)

    # Skill count (30 pts)
    score += min(30, len(skills) * 2)

    # Email present (5 pts)
    if re.search(r'[\w.+-]+@[\w-]+\.\w+', text):
        score += 5

    # Phone present (5 pts)
    if re.search(r'\+?\d[\d\s\-().]{7,}', text):
        score += 5

    # Length (10 pts)
    words = len(text.split())
    if words >= 300:
        score += 10
    elif words >= 150:
        score += 5

    # Bullet points / structure (10 pts)
    if text.count('•') + text.count('-') + text.count('*') > 5:
        score += 10

    # LinkedIn / GitHub (10 pts)
    if 'linkedin' in text_lower:
        score += 5
    if 'github' in text_lower:
        score += 5

    return min(100, score)


def extract_contact(text):
    email = re.findall(r'[\w.+-]+@[\w-]+\.\w+', text)
    phone = re.findall(r'\+?\d[\d\s\-().]{7,15}', text)
    linkedin = re.findall(r'linkedin\.com/in/[\w-]+', text, re.I)
    github = re.findall(r'github\.com/[\w-]+', text, re.I)
    lines = text.strip().split('\n')
    name = lines[0].strip() if lines else "Unknown"
    return {
        "name": name[:60],
        "email": email[0] if email else None,
        "phone": phone[0].strip() if phone else None,
        "linkedin": linkedin[0] if linkedin else None,
        "github": github[0] if github else None,
    }


def match_jobs(candidate_skills):
    candidate_set = set(candidate_skills.keys())
    results = []
    for job in JOBS:
        required = set(job["required_skills"])
        nice = set(job.get("nice_to_have", []))
        matched_req = candidate_set & required
        matched_nice = candidate_set & nice
        missing = required - candidate_set
        if not required:
            score = 0
        else:
            score = round(
                (len(matched_req) / len(required)) * 80
                + (len(matched_nice) / max(len(nice), 1)) * 20
            )
        results.append({
            **job,
            "match_score": min(score, 99),
            "matched_skills": sorted(matched_req | matched_nice),
            "missing_skills": sorted(missing),
        })
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def generate_suggestions(text, skills, ats_score):
    tips = []
    text_lower = text.lower()
    if "summary" not in text_lower and "objective" not in text_lower:
        tips.append({"type": "warning", "text": "Add a professional summary or objective at the top."})
    if len(skills) < 8:
        tips.append({"type": "warning", "text": "List more technical skills — aim for 10+ relevant skills."})
    if not re.search(r'[\w.+-]+@[\w-]+\.\w+', text):
        tips.append({"type": "error", "text": "No email detected. Add your contact email."})
    if "github" not in text_lower:
        tips.append({"type": "info", "text": "Include your GitHub profile link to showcase code."})
    if "linkedin" not in text_lower:
        tips.append({"type": "info", "text": "Add your LinkedIn URL for recruiter visibility."})
    if len(text.split()) < 300:
        tips.append({"type": "warning", "text": "Resume seems short. Aim for at least 400 words."})
    if text.count('•') + text.count('-') < 5:
        tips.append({"type": "info", "text": "Use bullet points to list responsibilities and achievements."})
    if ats_score >= 75:
        tips.append({"type": "success", "text": "Great ATS score! Your resume is well-optimized."})
    elif ats_score >= 50:
        tips.append({"type": "info", "text": "Moderate ATS score. Follow the tips above to improve."})
    else:
        tips.append({"type": "error", "text": "Low ATS score. Restructure your resume with clear sections."})
    return tips


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})


@app.route("/upload_resume", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["resume"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    session_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    save_path = os.path.join(UPLOAD_FOLDER, f"{session_id}{ext}")
    file.save(save_path)

    sessions[session_id] = {
        "filename": file.filename,
        "path": save_path,
        "ext": ext,
        "uploaded_at": datetime.utcnow().isoformat(),
    }
    return jsonify({"session_id": session_id, "filename": file.filename})


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session_id"}), 400

    info = sessions[session_id]
    path = info["path"]

    if info["ext"] == ".pdf":
        text = extract_text_from_pdf(path)
    else:
        # plain text / txt fallback
        try:
            with open(path, "r", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if not text.strip():
        return jsonify({"error": "Could not extract text from file"}), 422

    skills = extract_skills(text)
    ats_score = calculate_ats_score(text, skills)
    contact = extract_contact(text)
    suggestions = generate_suggestions(text, skills, ats_score)
    jobs = match_jobs(skills)

    # Group skills by category
    skill_by_cat = {}
    for s, cat in skills.items():
        skill_by_cat.setdefault(cat, []).append(s)

    result = {
        "session_id": session_id,
        "contact": contact,
        "ats_score": ats_score,
        "total_skills": len(skills),
        "skills": skills,
        "skills_by_category": skill_by_cat,
        "suggestions": suggestions,
        "jobs": jobs,
        "word_count": len(text.split()),
        "analyzed_at": datetime.utcnow().isoformat(),
    }
    sessions[session_id]["result"] = result
    return jsonify(result)


@app.route("/results/<session_id>", methods=["GET"])
def results(session_id):
    if session_id not in sessions or "result" not in sessions[session_id]:
        return jsonify({"error": "No results found"}), 404
    return jsonify(sessions[session_id]["result"])


@app.route("/jobs", methods=["GET"])
def get_jobs():
    return jsonify({"jobs": JOBS, "total": len(JOBS)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
