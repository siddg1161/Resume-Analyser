import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getJobs } from "../utils/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Try to get matched jobs from session first
  const sessionResult = (() => {
    try {
      const raw = sessionStorage.getItem("resume_result");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    (async () => {
      try {
        const res = await getJobs();
        let list = res.data.jobs || [];
        // Merge match scores if available
        if (sessionResult?.jobs) {
          const scoreMap = Object.fromEntries(
            sessionResult.jobs.map((j) => [j.id, j])
          );
          list = list.map((j) => ({ ...j, ...(scoreMap[j.id] || {}) }));
          list.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        }
        setJobs(list);
        setSelected(list[0] || null);
      } catch (e) {
        setError("Could not load jobs. Make sure Flask is running on port 5000.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.required_skills || []).some((s) => s.includes(q));
    const matchFilter =
      filter === "all" ||
      (filter === "remote" && j.location.toLowerCase().includes("remote")) ||
      (filter === "hybrid" && j.location.toLowerCase().includes("hybrid")) ||
      (filter === "onsite" && j.location.toLowerCase().includes("on-site"));
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-800 text-bright">
                {sessionResult ? "Your Job Matches" : "Browse Jobs"}
              </h1>
              {sessionResult && (
                <p className="text-muted text-sm mt-1">
                  Ranked by compatibility with your resume
                </p>
              )}
            </div>
            {!sessionResult && (
              <Link
                to="/upload"
                className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-glow transition-colors"
              >
                Analyze Resume for Match Scores
              </Link>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            type="text"
            placeholder="Search by role, company, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-bright text-sm placeholder:text-muted focus:outline-none focus:border-accent/50"
          />
          <div className="flex gap-2">
            {["all", "remote", "hybrid", "onsite"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-accent text-white"
                    : "border border-border text-muted hover:text-bright"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-20 text-muted">
            <div className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Loading jobs…
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex gap-6 h-[calc(100vh-260px)] min-h-[500px]">
            {/* List */}
            <div className="w-full md:w-2/5 overflow-y-auto space-y-3 pr-2">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-muted">No jobs found for this search.</div>
                ) : (
                  filtered.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelected(job)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        selected?.id === job.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card hover:border-accent/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm font-mono flex-shrink-0"
                          style={{ background: job.color }}
                        >
                          {job.logo}
                        </div>
                        <div className="min-w-0">
                          <p className="text-bright text-sm font-semibold truncate">{job.title}</p>
                          <p className="text-muted text-xs">{job.company}</p>
                        </div>
                        {job.match_score !== undefined && (
                          <span
                            className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              background: job.match_score >= 70 ? "#34d39920" : job.match_score >= 40 ? "#fb923c20" : "#6b728020",
                              color: job.match_score >= 70 ? "#34d399" : job.match_score >= 40 ? "#fb923c" : "#9ca3af",
                            }}
                          >
                            {job.match_score}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-muted text-xs bg-surface px-2 py-0.5 rounded">{job.location.split("(")[0].trim()}</span>
                        <span className="text-muted text-xs bg-surface px-2 py-0.5 rounded">{job.salary.split("–")[0].trim()}+</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Detail */}
            <div className="hidden md:block flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="card-border rounded-2xl p-8 h-full"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg font-mono"
                        style={{ background: selected.color }}
                      >
                        {selected.logo}
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-800 text-bright">{selected.title}</h2>
                        <p className="text-muted">{selected.company} · {selected.location}</p>
                      </div>
                      {selected.match_score !== undefined && (
                        <div className="ml-auto text-center">
                          <div
                            className="text-2xl font-bold font-mono"
                            style={{ color: selected.match_score >= 70 ? "#34d399" : selected.match_score >= 40 ? "#fb923c" : "#9ca3af" }}
                          >
                            {selected.match_score}%
                          </div>
                          <div className="text-muted text-xs">Match</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mb-6">
                      <Badge label={selected.salary} color="#7c6af7" />
                      <Badge label={selected.type} color="#34d399" />
                      <Badge label={selected.posted} color="#6b7280" />
                    </div>

                    <p className="text-muted leading-relaxed mb-6">{selected.description}</p>

                    <div className="mb-6">
                      <h3 className="font-display font-700 text-bright mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selected.required_skills || []).map((s) => {
                          const matched = (selected.matched_skills || []).includes(s);
                          return (
                            <span
                              key={s}
                              className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                matched
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {matched ? "✓" : "✗"} {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {(selected.nice_to_have || []).length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-display font-700 text-bright mb-3">Nice to Have</h3>
                        <div className="flex flex-wrap gap-2">
                          {selected.nice_to_have.map((s) => {
                            const matched = (selected.matched_skills || []).includes(s);
                            return (
                              <span
                                key={s}
                                className={`px-3 py-1 rounded-lg text-sm capitalize ${
                                  matched
                                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                    : "bg-surface text-muted border border-border"
                                }`}
                              >
                                {matched ? "✓ " : ""}{s}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-glow transition-colors">
                      Apply Now →
                    </button>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted">
                    Select a job to view details
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span
      className="px-3 py-1 rounded-lg text-xs font-medium"
      style={{ background: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
