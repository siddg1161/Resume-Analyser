import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResume, analyzeResume } from "../utils/api";

const STEPS = ["Upload", "Parse", "Analyze", "Match"];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("idle"); // idle | uploading | analyzing | done | error
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setError("");
    try {
      setStage("uploading");
      setStep(0);
      const upRes = await uploadResume(file, (p) => setProgress(p));
      const { session_id } = upRes.data;

      setStage("analyzing");
      setStep(1);
      await delay(400);
      setStep(2);
      const anaRes = await analyzeResume(session_id);
      setStep(3);
      await delay(300);

      sessionStorage.setItem("resume_result", JSON.stringify(anaRes.data));
      sessionStorage.setItem("session_id", session_id);
      setStage("done");
      await delay(600);
      navigate("/dashboard");
    } catch (e) {
      setStage("error");
      setError(
        e?.response?.data?.error ||
          "Failed to connect to backend. Make sure Flask is running on port 5000."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      <div className="w-full max-w-2xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl font-800 text-bright mb-3">
            Upload Your Resume
          </h1>
          <p className="text-muted">PDF or TXT — max 5 MB</p>
        </motion.div>

        {/* Step progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    i <= step && stage !== "idle"
                      ? "bg-accent text-white"
                      : "bg-border text-muted"
                  }`}
                >
                  {i < step && stage !== "idle" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-sm ${i <= step && stage !== "idle" ? "text-bright" : "text-muted"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 transition-all duration-500 ${i < step && stage !== "idle" ? "bg-accent" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          {...getRootProps()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragActive
              ? "border-accent bg-accent/10"
              : file
              ? "border-accent-2/50 bg-accent-2/5"
              : "border-border hover:border-accent/50 hover:bg-accent/5"
          }`}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 bg-accent-2/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-display font-600 text-bright text-lg">{file.name}</p>
                <p className="text-muted text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-accent text-xs mt-3">Click to change file</p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="font-display font-600 text-bright text-lg mb-1">
                  {isDragActive ? "Drop it here!" : "Drag & drop your resume"}
                </p>
                <p className="text-muted text-sm">or click to browse — PDF / TXT</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress bar */}
        <AnimatePresence>
          {stage === "uploading" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
          {stage === "analyzing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-muted text-sm"
            >
              <div className="inline-flex items-center gap-2">
                <Spinner /> Analyzing your resume with AI…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleAnalyze}
          disabled={!file || stage === "uploading" || stage === "analyzing"}
          className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            file && stage === "idle"
              ? "bg-accent text-white hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/30"
              : "bg-border text-muted cursor-not-allowed"
          }`}
        >
          {stage === "uploading" || stage === "analyzing" ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Processing…
            </span>
          ) : (
            "Analyze Resume →"
          )}
        </motion.button>

        <p className="text-center text-muted text-xs mt-4">
          Your file is processed locally and never stored permanently.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
