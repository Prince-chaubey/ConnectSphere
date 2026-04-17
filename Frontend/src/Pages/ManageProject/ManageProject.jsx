import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ChevronLeft, Users, Trophy, ExternalLink, Loader2, Sparkles, CheckCircle2, XCircle
} from "lucide-react";

const ScoreBadge = ({ score }) => {
  const color =
    score >= 80 ? "bg-emerald-500" :
    score >= 60 ? "bg-blue-500" :
    score >= 40 ? "bg-amber-500" : "bg-red-500";
  const label =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Average" : "Poor";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${color}`}>
      {score}% · {label}
    </span>
  );
};

const ApplicationRow = ({ app, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(
    app.aiScore != null
      ? { score: app.aiScore, summary: app.aiSummary, strengths: app.aiStrengths || [], gaps: app.aiGaps || [] }
      : null
  );
  const [showAnalysis, setShowAnalysis] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const applicant = app.applicant || {};

  const handleStatus = async (status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/projects/applications/${app._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Application ${status}`);
        onStatusChange(app._id, status);
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!app.resumeUrl) return toast.error("Applicant has no resume uploaded");
    try {
      setAnalyzing(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/projects/applications/${app._id}/analyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setShowAnalysis(true);
        toast.success("CV analyzed successfully.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze CV");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInterview = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/projects/applications/${app._id}/interview`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Interview invitation sent.");
        onStatusChange(app._id, "interview_invited");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setUpdating(false);
    }
  };

  const handleSelect = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/projects/applications/${app._id}/select`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Candidate selected! 🎉");
        onStatusChange(app._id, "selected");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to select candidate");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
      {/* Profile Detail */}
      <div className="flex-1 flex gap-4 items-start">
        <Link to={`/profile/${applicant._id || ''}`} className="shrink-0">
           {applicant.profilePic && !applicant.profilePic.includes("via.placeholder.com") ? (
             <img src={applicant.profilePic} className="w-12 h-12 rounded-full border border-slate-100 object-cover" alt="Avatar"/>
           ) : (
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
               {applicant.name?.[0]?.toUpperCase() || "?"}
             </div>
           )}
        </Link>
        <div>
           <Link to={`/profile/${applicant._id || ''}`} className="font-bold text-slate-800 text-lg hover:text-blue-600 hover:underline">{applicant.name || "Unknown"}</Link>
           <p className="text-sm font-medium text-slate-500 mt-0.5">Role Applied: <span className="text-slate-800">{app.roleName}</span></p>
           {app.resumeUrl && (
             <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1.5">
               <ExternalLink className="w-3 h-3"/> View Resume
             </a>
           )}
        </div>
      </div>

      {/* Badges / Metrics */}
      <div className="flex-1 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
        {analysis ? (
           <button onClick={() => setShowAnalysis(!showAnalysis)} className="text-left group w-max">
             <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider group-hover:text-violet-500">AI CV Match</p>
             <ScoreBadge score={analysis.score} />
           </button>
        ) : (
           <div>
             <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">AI CV Match</p>
             <button
               onClick={handleAnalyze}
               disabled={analyzing}
               className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-1 w-max"
             >
               {analyzing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} Analyze CV
             </button>
           </div>
        )}

        {app.assessmentSubmitted && app.assessmentScore != null && (
           <div>
             <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Test Score</p>
             <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${app.assessmentScore >= 75 ? 'bg-emerald-500' : app.assessmentScore >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}>
               📝 {app.assessmentScore}%
             </span>
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0 md:w-48 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 justify-center">
          {app.status === "pending" && (
            <div className="flex gap-2 w-full">
              {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400"/> : (
                <>
                  <button onClick={() => handleStatus("accepted")} className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">Shortlist Test</button>
                  <button onClick={() => handleStatus("rejected")} className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1">Reject</button>
                </>
              )}
            </div>
          )}

          {app.status === "accepted" && (
            <div className="text-center w-full space-y-2">
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs px-3 py-1 font-bold rounded-full w-full">Shortlisted for Test</span>
              {app.assessmentSubmitted && (
                <button
                  onClick={handleInterview}
                  disabled={updating || app.assessmentScore < 60}
                  className={`w-full text-xs px-3 py-1.5 font-bold rounded-lg transition-colors ${
                    app.assessmentScore >= 60 
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  title={app.assessmentScore < 60 ? "Score below 60% threshold" : "Invite to Interview"}
                >
                  Invite to Interview
                </button>
              )}
            </div>
          )}

          {app.status === "interview_invited" && (
            <div className="text-center w-full space-y-2">
              <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 font-bold rounded-full w-full">Shortlisted for Interview</span>
              <button
                onClick={handleSelect}
                disabled={updating}
                className="w-full bg-emerald-500 text-white text-xs px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
              >
                Select Candidate
              </button>
            </div>
          )}

          {app.status === "selected" && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="inline-block border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs px-4 py-2 font-bold rounded-xl shadow-sm w-full text-center">Selected</span>
            </div>
          )}

          {app.status === "rejected" && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="inline-block bg-red-100 text-red-600 text-xs px-4 py-2 font-bold rounded-xl w-full text-center">Rejected</span>
            </div>
          )}
      </div>

      {/* Expanded AI Panel via Absolute/Relative or inline accordion */}
      {analysis && showAnalysis && (
        <div className="col-span-full md:w-full w-full mt-3 bg-slate-50 border border-slate-100 rounded-xl p-4 order-last md:ml-0 md:mr-0">
          <p className="text-xs text-slate-600 leading-relaxed mb-3">{analysis.summary}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.strengths?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">✅ Strengths</p>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600 flex items-start gap-1"><span className="text-emerald-500">•</span>{s}</li>)}
                </ul>
              </div>
            )}
            {analysis.gaps?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">⚠️ Gaps</p>
                <ul className="space-y-1">
                  {analysis.gaps.map((g, i) => <li key={i} className="text-xs text-slate-600 flex items-start gap-1"><span className="text-amber-500">•</span>{g}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ManageProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      
      const endpoint = role === "admin" ? `${API_URL}/projects/admin/stats` : `${API_URL}/projects/my-projects`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // filter the exact project out of the returned array
        const p = res.data.projects.find((pr) => pr._id === id);
        if (p) setProject(p);
        else {
          toast.error("Project not found");
          navigate("/admin-dashboard");
        }
      }
    } catch (err) {
      toast.error("Failed to load project details");
      navigate("/admin-dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  const handleStatusChange = (appId, newStatus) => {
    setProject((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a._id === appId ? { ...a, status: newStatus } : a
      ),
    }));
  };

  const tabs = [
    { id: "all", label: "All Applicants" },
    { id: "pending", label: "Pending Review" },
    { id: "accepted", label: "Shortlisted for Test" },
    { id: "interview_invited", label: "Shortlisted for Interview" },
    { id: "selected", label: "Selected" },
    { id: "rejected", label: "Rejected" },
  ];

  const filteredApps = project.applications?.filter(a => activeTab === "all" || a.status === activeTab) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Header Ribbon */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <Link to="/admin-dashboard" className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-800 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4"/> Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{project.title}</h1>
                <p className="text-slate-500 font-medium mt-1">Manage Candidates & Recruitment Workflow</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-slate-50 border border-slate-100 rounded-xl py-2 px-6">
                  <p className="text-xl font-extrabold text-slate-800">{project.applicantCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicants</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {tabs.map((t) => {
              const count = t.id === "all" ? project.applications?.length : project.applications?.filter(a => a.status === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                    activeTab === t.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {t.label} 
                  <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${activeTab === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="mt-6 space-y-4">
            {filteredApps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No applicants found</h3>
                <p className="text-slate-400 text-sm mt-1">There are no applications matching this status.</p>
              </div>
            ) : (
              filteredApps.map((app) => (
                <ApplicationRow key={app._id} app={app} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ManageProject;
