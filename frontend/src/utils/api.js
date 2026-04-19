import axios from "axios";

const API_BASE = "https://resume-analyser-0xu2.onrender.com";

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

export const uploadResume = (file, onProgress) => {
  const form = new FormData();
  form.append("resume", file);
  return api.post("/upload_resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const analyzeResume = (sessionId) =>
  api.post("/analyze", { session_id: sessionId });

export const getResults = (sessionId) => api.get(`/results/${sessionId}`);

export const getJobs = () => api.get("/jobs");

export const checkHealth = () => api.get("/health");
