import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CAT_COLORS = {
  Languages: "#7c6af7",
  Frameworks: "#34d399",
  "Cloud & DevOps": "#38bdf8",
  Databases: "#fb923c",
  Tools: "#f472b6",
  "Soft Skills": "#a3e635",
};

const TIP_ICONS = {
  success: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", icon: "✅" },
  warning: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", icon: "⚠️" },
  error: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", icon: "❌" },
  info: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", icon: "💡" },
};

function scoreColor(n) {
  if (n >= 75) return "#34d399";
  if (n >= 50) return "#fb923c";
  return "#ef4444";
}

function scoreLabel(n) {
  if (n >= 80) return "Excellent";
  if (n >= 65) return "Good";
  if (n >= 45) return "Fair";
  return "Needs Work";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("resume_result");
    if (!raw) return navigate("/upload");
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) return null;

  const { contact, ats_score, skills_by_category, suggestions, jobs, word_count } = data;
  const topJobs = (jobs || []).slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-accent text-sm font-medium mb-1">Analysis Complete</p>
            <h1 className="font-display text-3xl font-800 text-bright">
              {contact?.name || "Your Resume"}
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-muted text-sm">
              {contact?.email && <span>📧 {contact.email}</span>}
              {contact?.phone && <span>📱 {contact.phone}</span>}
              {contact?.linkedin && <span>🔗 {contact.linkedin}</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/jobs" className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-glow transition-colors">
              View Job Matches →
            </Link>
            <Link to="/upload" className="px-5 py-2.5 border border-border text-muted hover:text-bright rounded-xl text-sm font-semibold transition-colors">
              Re-upload
            </Link>
          </div>
        </motion.div>

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          {/* ATS Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-border rounded-2xl p-6 flex flex-col items-center"
          >
            <p className="text-muted text-sm mb-4 font-medium">ATS Score</p>
            <div className="w-36 h-36 score-ring">
              <CircularProgressbar
                value={ats_score}
                text={`${ats_score}`}
                styles={buildStyles({
                  pathColor: scoreColor(ats_score),
                  textColor: "#f0eeff",
                  trailColor: "#1e1e2e",
                  textSize: "22px",
                })}
              />
            </div>
            <span
              className="mt-4 text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: `${scoreColor(ats_score)}20`, color: scoreColor(ats_score) }}
            >
              {scoreLabel(ats_score)}
            </span>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-border rounded-2xl p-6 flex flex-col justify-between"
          >
            <p className="text-muted text-sm font-medium mb-4">Quick Stats</p>
            <div className="space-y-3">
              {[
                { label: "Skills Found", value: data.total_skills },
                { label: "Word Count", value: word_count },
                { label: "Top Job Match", value: `${topJobs[0]?.match_score ?? 0}%` },
                { label: "Skill Categories", value: Object.keys(skills_by_category).length },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-muted text-sm">{s.label}</span>
                  <span className="font-mono font-bold text-bright">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-border rounded-2xl p-6"
          >
            <p className="text-muted text-sm font-medium mb-4">Suggestions ({suggestions.length})</p>
            <div className="space-y-2 overflow-y-auto max-h-[180px]">
              {suggestions.map((tip, i) => {
                const style = TIP_ICONS[tip.type] || TIP_ICONS.info;
                return (
                  <div key={i} className={`p-3 rounded-xl border text-xs leading-relaxed ${style.bg} ${style.text}`}>
                    {style.icon} {tip.text}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-border rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display font-700 text-bright text-xl mb-6">Skills Detected</h2>
          {Object.keys(skills_by_category).length === 0 ? (
            <p className="text-muted">No skills detected. Try a different resume format.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(skills_by_category).map(([cat, skills]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: CAT_COLORS[cat] || "#7c6af7" }}
                    />
                    <span className="text-muted text-xs font-semibold uppercase tracking-wider">{cat}</span>
                    <span className="text-muted text-xs">({skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-lg text-sm font-medium capitalize"
                        style={{
                          background: `${CAT_COLORS[cat] || "#7c6af7"}15`,
                          color: CAT_COLORS[cat] || "#7c6af7",
                          border: `1px solid ${CAT_COLORS[cat] || "#7c6af7"}30`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top job matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-border rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-700 text-bright text-xl">Top Job Matches</h2>
            <Link to="/jobs" className="text-accent text-sm hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm font-mono"
          style={{ background: job.color }}
        >
          {job.logo}
        </div>
        <div>
          <p className="text-bright text-sm font-semibold leading-tight">{job.title}</p>
          <p className="text-muted text-xs">{job.company}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs">{job.location.split("(")[0].trim()}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: job.match_score >= 70 ? "#34d39920" : job.match_score >= 40 ? "#fb923c20" : "#ef444420",
            color: job.match_score >= 70 ? "#34d399" : job.match_score >= 40 ? "#fb923c" : "#ef4444",
          }}
        >
          {job.match_score}% match
        </span>
      </div>
    </div>
  );
}
