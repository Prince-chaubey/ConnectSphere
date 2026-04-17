import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const DURATION = 15 * 60; // 15 minutes in seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─── Stages ───────────────────────────────────────────────────────────────────
const STAGE = { VERIFYING: "verifying", LOGIN: "login", BRIEFING: "briefing", TEST: "test", RESULT: "result", ERROR: "error" };

// ─── Components ───────────────────────────────────────────────────────────────
const GradientCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>{children}</div>
);

const Header = () => (
  <div style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 60%,#a21caf 100%)" }} className="px-8 py-6 text-center">
    <span className="text-3xl font-extrabold text-white tracking-tight">Connect<span style={{ color: "#c4b5fd" }}>Sphere</span></span>
    <p className="text-blue-200 text-sm mt-1 font-medium">Online Assessment Portal</p>
  </div>
);

// ─── Main Assessment Page ──────────────────────────────────────────────────────
const Assessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [stage, setStage]           = useState(STAGE.VERIFYING);
  const [info, setInfo]             = useState(null);        // { applicantName, projectTitle, roleName, skillMatch }
  const [authToken, setAuthToken]   = useState(() => localStorage.getItem("token"));
  const [loginForm, setLoginForm]   = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState([]);
  const [timeLeft, setTimeLeft]     = useState(DURATION);
  const [result, setResult]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const timerRef = useRef(null);

  // ── Step 1: Verify the assessment token ─────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg("No assessment token found in the link. Please use the link from your email.");
      setStage(STAGE.ERROR);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects/assessment/verify?token=${token}`);
        if (res.data.success) {
          setInfo(res.data.info);
          // If user is already logged in, go to briefing
          if (authToken) {
            setStage(STAGE.BRIEFING);
          } else {
            setStage(STAGE.LOGIN);
          }
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || "This assessment link is invalid or has expired.");
        setStage(STAGE.ERROR);
      }
    };
    verify();
  }, [token]);

  // ── Step 2: Login ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);
      const t = res.data.token;
      localStorage.setItem("token", t);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("username", res.data.user.name);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuthToken(t);
      toast.success("Logged in! Loading your assessment...");
      setStage(STAGE.BRIEFING);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Step 3: Generate questions ───────────────────────────────────────────────
  const startTest = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(
        `${API_URL}/projects/assessment/generate`,
        { token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (res.data.success) {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(null));
        setStage(STAGE.TEST);
        setTimeLeft(DURATION);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate questions.");
      if (err.response?.status === 403) setStage(STAGE.LOGIN);
    } finally {
      setGenerating(false);
    }
  };

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== STAGE.TEST) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // auto-submit on time up
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  // ── Step 4: Submit ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      clearInterval(timerRef.current);
      setSubmitting(true);
      if (auto) toast("Time's up! Auto-submitting...");

      try {
        const res = await axios.post(
          `${API_URL}/projects/assessment/submit`,
          { token, answers },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (res.data.success) {
          setResult(res.data);
          setStage(STAGE.RESULT);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Submission failed.");
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, token, answers, authToken]
  );

  const answered = answers.filter((a) => a !== null).length;
  const timerDanger = timeLeft <= 5 * 60;
  const timerWarning = timeLeft <= 10 * 60 && !timerDanger;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#eff6ff 0%,#f5f3ff 50%,#fdf4ff 100%)" }}
         className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* ── VERIFYING ── */}
        {stage === STAGE.VERIFYING && (
          <GradientCard>
            <Header />
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                   style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Verifying Your Link…</h2>
              <p className="text-slate-500 text-sm">Please wait while we validate your assessment invitation.</p>
            </div>
          </GradientCard>
        )}

        {/* ── ERROR ── */}
        {stage === STAGE.ERROR && (
          <GradientCard>
            <Header />
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-100">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-3">Link Invalid or Expired</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{errorMsg}</p>
              <button onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                Go to Home
              </button>
            </div>
          </GradientCard>
        )}

        {/* ── LOGIN ── */}
        {stage === STAGE.LOGIN && (
          <GradientCard>
            <Header />
            {/* Info Banner */}
            <div style={{ background: "linear-gradient(90deg,#eff6ff,#f5f3ff)", borderBottom: "1px solid #e0e7ff" }}
                 className="px-8 py-4 text-center">
              <p className="text-sm font-semibold text-indigo-900">You have been shortlisted for <span className="font-extrabold">{info?.projectTitle}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Please log in to access your assessment for the <strong>{info?.roleName}</strong> role</p>
            </div>
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Sign In to Continue</h2>
              <p className="text-sm text-slate-500 mb-6">Use your ConnectSphere account credentials</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <input type="email" required value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": "#2563eb" }}
                      placeholder="you@example.com"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <input type="password" required value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Your password"/>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                  {loginLoading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
                  ) : "Sign In & Continue →"}
                </button>
              </form>
            </div>
          </GradientCard>
        )}

        {/* ── BRIEFING ── */}
        {stage === STAGE.BRIEFING && (
          <GradientCard>
            <Header />
            <div style={{ background: "linear-gradient(90deg,#eff6ff,#f5f3ff)", borderBottom: "1px solid #e0e7ff" }}
                 className="px-8 py-5 text-center">
              <p className="text-sm font-semibold text-slate-700">You have been shortlisted for <strong>{info?.roleName}</strong> on <strong className="text-indigo-900">{info?.projectTitle}</strong></p>
            </div>

            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Assessment Instructions</h2>
              <p className="text-sm text-slate-500 mb-6">Read carefully before you start</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: "❖", label: "Questions", val: "30 MCQs" },
                  { icon: "❖", label: "Duration", val: "15 Minutes" },
                  { icon: "❖", label: "Role", val: info?.roleName },
                  { icon: "❖", label: "Skills Based", val: "Auto-Graded" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
                      <p className="text-sm font-bold text-slate-800">{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">Important Guidelines</p>
                <ul className="space-y-1.5 text-sm text-amber-800">
                  <li>• The timer starts immediately when you click Start.</li>
                  <li>• The test will auto-submit when time runs out.</li>
                  <li>• You can only take this assessment once.</li>
                  <li>• Questions are based on skills required for your role.</li>
                </ul>
              </div>

              <button onClick={startTest} disabled={generating}
                className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" }}>
                {generating ? (
                  <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating Questions…</>
                ) : "Start Assessment →"}
              </button>
            </div>
          </GradientCard>
        )}

        {/* ── TEST ── */}
        {stage === STAGE.TEST && (
          <div className="space-y-4">
            {/* Sticky Timer Bar */}
            <div className="sticky top-4 z-50">
              <GradientCard>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                      <span className="text-white text-xs font-bold">CS</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Assessment in progress</p>
                      <p className="text-sm font-bold text-slate-800">{info?.roleName} · {info?.projectTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">{answered}/{questions.length} answered</span>
                    <div className={`px-4 py-2 rounded-xl font-mono font-extrabold text-lg ${
                      timerDanger ? "bg-red-500 text-white animate-pulse" :
                      timerWarning ? "bg-amber-400 text-white" :
                      "bg-slate-900 text-white"
                    }`}>
                      {fmt(timeLeft)}
                    </div>
                  </div>
                </div>
                {/* Progress */}
                <div className="h-1 bg-slate-100">
                  <div className="h-full transition-all duration-300"
                       style={{ width: `${(answered / questions.length) * 100}%`, background: "linear-gradient(90deg,#2563eb,#7c3aed)" }}/>
                </div>
              </GradientCard>
            </div>

            {/* Questions */}
            {questions.map((q, qi) => (
              <GradientCard key={q.id || qi}>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white"
                          style={{ background: answers[qi] !== null ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#cbd5e1" }}>
                      {qi + 1}
                    </span>
                    <div>
                      {q.skill && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                              style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5" }}>
                          {q.skill}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-10">
                    {q.options.map((opt, oi) => {
                      const selected = answers[qi] === oi;
                      return (
                        <button key={oi} onClick={() => setAnswers((prev) => { const a = [...prev]; a[qi] = oi; return a; })}
                          className="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                          style={{
                            background: selected ? "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))" : "#f8fafc",
                            borderColor: selected ? "#2563eb" : "#e2e8f0",
                            color: selected ? "#1e40af" : "#475569",
                          }}>
                          <span className="font-bold mr-2">{["A","B","C","D"][oi]}.</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </GradientCard>
            ))}

            {/* Submit Button */}
            <GradientCard>
              <div className="p-6 text-center">
                {answered < questions.length && (
                  <p className="text-sm text-amber-600 font-semibold mb-4">
                    {questions.length - answered} question{questions.length - answered > 1 ? "s" : ""} unanswered
                  </p>
                )}
                <button onClick={() => handleSubmit(false)} disabled={submitting}
                  className="px-10 py-3.5 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 flex items-center gap-2 mx-auto"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                  {submitting ? (
                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</>
                  ) : "Submit Assessment"}
                </button>
              </div>
            </GradientCard>
          </div>
        )}

        {/* ── RESULT ── */}
        {stage === STAGE.RESULT && (
          <GradientCard>
            <Header />
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                   style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                <span className="text-4xl text-white">✓</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                Assessment Submitted Successfully!
              </h2>
              <p className="text-slate-500 text-sm mb-8">Completed for <strong>{info?.roleName}</strong> on <strong>{info?.projectTitle}</strong></p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-8">
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                  Thank you for taking the assessment. Your results have been successfully securely transmitted to the project creator. 
                  They will review your performance and reach out to you with the next steps shortly.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate("/my-applications")}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                  View My Applications →
                </button>
                <button onClick={() => navigate("/")}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  Go Home
                </button>
              </div>
            </div>
          </GradientCard>
        )}
      </div>

      <style>{`
        input:focus { ring-color: #2563eb; border-color: #2563eb; outline: none; box-shadow: 0 0 0 2px rgba(37,99,235,0.2); }
      `}</style>
    </div>
  );
};

export default Assessment;
