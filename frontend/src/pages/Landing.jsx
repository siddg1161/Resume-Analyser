import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "⚡",
    title: "ATS Score",
    desc: "Instant Applicant Tracking System score with actionable tips to pass filters.",
    color: "#7c6af7",
  },
  {
    icon: "🎯",
    title: "Skill Extraction",
    desc: "Auto-detects 100+ technical and soft skills across 6 categories.",
    color: "#34d399",
  },
  {
    icon: "💼",
    title: "Job Matching",
    desc: "AI matches your profile to curated jobs with a compatibility score.",
    color: "#fb923c",
  },
  {
    icon: "📊",
    title: "Gap Analysis",
    desc: "Pinpoints missing skills and shows exactly what to learn next.",
    color: "#38bdf8",
  },
  {
    icon: "📝",
    title: "Smart Suggestions",
    desc: "Personalized recommendations to make your resume stand out.",
    color: "#f472b6",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Your resume is processed locally. Nothing stored permanently.",
    color: "#a3e635",
  },
];

const STATS = [
  { value: "98%", label: "ATS Pass Rate" },
  { value: "2s", label: "Analysis Time" },
  { value: "100+", label: "Skills Tracked" },
  { value: "6+", label: "Job Categories" },
];

function FloatingOrb({ x, y, size, color, delay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 6 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-void bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <FloatingOrb x={10} y={20} size={500} color="#7c6af7" delay={0} />
      <FloatingOrb x={70} y={60} size={400} color="#34d399" delay={2} />
      <FloatingOrb x={50} y={10} size={300} color="#fb923c" delay={4} />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          AI-Powered Resume Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-800 text-5xl md:text-7xl leading-tight mb-6 max-w-4xl"
        >
          Your resume,
          <br />
          <span className="text-gradient">brutally analyzed.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          Upload your resume and get an instant ATS score, skill breakdown,
          job matches, and personalized suggestions to land your next role faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/upload"
            className="group relative px-8 py-4 bg-accent text-white font-semibold rounded-xl text-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/30"
          >
            <span className="relative z-10 flex items-center gap-2">
              Analyze My Resume
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
          <Link
            to="/jobs"
            className="px-8 py-4 border border-border text-bright font-semibold rounded-xl text-lg hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            Browse Jobs
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-800 text-gradient">{s.value}</div>
              <div className="text-muted text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-800 text-bright mb-4">
              Everything you need to{" "}
              <span className="text-gradient">get hired</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Stop guessing. Get data-driven insights in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-border rounded-2xl p-6 hover:border-accent/30 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${f.color}15` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-700 text-bright text-lg mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-border rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
            <h2 className="font-display text-4xl font-800 text-bright mb-4 relative">
              Ready to stand out?
            </h2>
            <p className="text-muted text-lg mb-8 relative">
              Upload your resume now — it takes less than 5 seconds.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl text-lg hover:bg-accent-glow transition-colors relative"
            >
              Get Your Score Free
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-muted text-sm">
        © 2025 ResumeAI — Built with React + Flask
      </footer>
    </div>
  );
}
