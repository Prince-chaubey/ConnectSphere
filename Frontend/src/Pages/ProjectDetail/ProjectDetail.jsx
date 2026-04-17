import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Calendar, Clock, Tag, CheckCircle2,
  Rocket, Trophy, Briefcase, Code2, ChevronRight, X,
  MapPin, Send, Loader2, AlertCircle,
  UserCheck, Star, Layers
} from "lucide-react";

const TYPE_META = {
  capstone:    { label: "Capstone Project",  color: "bg-violet-100 text-violet-700 border-violet-200",   bar: "from-violet-500 to-purple-600",  icon: Rocket,    badge: "🎓" },
  hackathon:   { label: "Hackathon",         color: "bg-orange-100 text-orange-700 border-orange-200",   bar: "from-orange-500 to-red-500",     icon: Trophy,    badge: "⚡" },
  group:       { label: "Group Project",     color: "bg-sky-100 text-sky-700 border-sky-200",            bar: "from-sky-500 to-blue-600",       icon: Users,     badge: "👥" },
  freelancing: { label: "Freelancing",       color: "bg-emerald-100 text-emerald-700 border-emerald-200",bar: "from-emerald-500 to-teal-600",   icon: Briefcase, badge: "💼" },
};

const ApplyModal = ({ project, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole]     = useState("");
  const [coverLetter, setCoverLetter]       = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [profileResume, setProfileResume]   = useState(""); // resume from user profile
  const [resumeUrl, setResumeUrl]           = useState("");  // resume that will be submitted
  const [uploadingResume, setUploadingResume] = useState(false);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const API_URL  = import.meta.env.VITE_API_URL;
  const token    = localStorage.getItem("token");

  const availableRoles = project?.roles?.filter(
    (r) => r.membersFilled < r.membersNeeded
  ) || [];

  // Fetch user profile to get saved resume
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) { setFetchingProfile(false); return; }
      try {
        const res = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const savedResume = res.data.user?.resume || "";
          setProfileResume(savedResume);
          setResumeUrl(savedResume);
        }
      } catch (err) {
        console.error("Could not fetch profile resume", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // When toggling between profile resume and custom upload
  const handleToggleResume = (useProfile) => {
    setUseProfileResume(useProfile);
    if (useProfile) {
      setResumeUrl(profileResume);
    } else {
      setResumeUrl(""); // clear until they upload
    }
  };

  // Upload a new resume file to cloudinary via backend
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF or DOC/DOCX files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("resume", file);
      const res = await axios.put(`${API_URL}/user/profile/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        const uploadedUrl = res.data.user?.resume || "";
        setResumeUrl(uploadedUrl);
        setProfileResume(uploadedUrl);
        toast.success("Resume uploaded!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole) return toast.error("Please select a role");
    if (!token) return toast.error("Please login to apply");

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_URL}/projects/${project._id}/apply`,
        { roleName: selectedRole, coverLetter, resumeUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Application submitted! Check your email ");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const getFileName = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1]).split("?")[0];
  };

 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900">Apply to this Project</h3>
            <p className="text-xs text-slate-400 mt-0.5">{project?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Role selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Role *
            </label>
            <div className="space-y-2">
              {availableRoles.length === 0 ? (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> All roles are currently filled.
                </div>
              ) : (
                availableRoles.map((role) => (
                  <button
                    key={role.roleName}
                    onClick={() => setSelectedRole(role.roleName)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.roleName
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{role.roleName}</span>
                      <span className="text-xs text-slate-400">
                        {role.membersNeeded - role.membersFilled} slot{role.membersNeeded - role.membersFilled !== 1 ? "s" : ""} left
                      </span>
                    </div>
                    {role.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {role.skillsRequired.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Resume Section ── */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Resume / CV
            </label>

            {fetchingProfile ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">Loading your resume…</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Toggle: use profile resume vs upload new */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleResume(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                      useProfileResume
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    Use Saved Resume
                  </button>
                  <button
                    onClick={() => handleToggleResume(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                      !useProfileResume
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    Upload Different
                  </button>
                </div>

                {/* Profile resume preview */}
                {useProfileResume && (
                  profileResume ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-800 truncate">Resume attached</p>
                        <p className="text-[11px] text-emerald-600 truncate">{getFileName(profileResume)}</p>
                      </div>
                      <a
                        href={profileResume}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        Preview
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        No resume saved on your profile. Upload one below or{" "}
                        <a href="/profile" target="_blank" className="font-bold underline">add it to your profile</a> first.
                      </p>
                    </div>
                  )
                )}

                {/* Upload a different resume */}
                {!useProfileResume && (
                  <div>
                    <label
                      htmlFor="apply-resume-upload"
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        uploadingResume
                          ? "border-blue-300 bg-blue-50"
                          : resumeUrl
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                      }`}
                    >
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">Uploading…</span>
                        </>
                      ) : resumeUrl ? (
                        <>
                            
                          <span className="text-xs font-bold text-emerald-700">Resume uploaded successfully</span>
                          <span className="text-[11px] text-emerald-600 truncate max-w-full px-2">{getFileName(resumeUrl)}</span>
                          <span className="text-[11px] text-slate-400">Click to replace</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">📎</span>
                          <span className="text-xs font-bold text-slate-600">Click to upload resume</span>
                          <span className="text-[11px] text-slate-400">PDF, DOC or DOCX · max 5MB</span>
                        </>
                      )}
                      <input
                        id="apply-resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={uploadingResume}
                      />
                    </label>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center text-xs font-bold text-blue-600 hover:text-blue-800 mt-2 underline"
                      >
                        Preview uploaded resume
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover message */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Why are you a good fit? <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Tell the creator about your relevant experience..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all placeholder-slate-300 text-slate-700"
            />
            <p className="text-right text-[11px] text-slate-300 mt-1">{coverLetter.length}/1000</p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 pb-5 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || availableRoles.length === 0 || uploadingResume}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Apply Now</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Project Detail ───────────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showApply, setShowApply]   = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const isLoggedIn = !!localStorage.getItem("token");
  
  let currentUserId = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) currentUserId = JSON.parse(userStr)._id;
  } catch (e) {}
  
  const isCreator = currentUserId && project?.createdBy?._id === currentUserId;

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data.success) {
        setProject(res.data.project);
        setHasApplied(res.data.project.hasApplied || false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Project not found");
      navigate("/explore");
    } finally {
      setLoading(false);
    }
  };

  const meta  = project ? (TYPE_META[project.type] || TYPE_META.group) : null;
  const Icon  = meta?.icon || Users;
  const slots = project ? (project.totalMembers || 0) - (project.membersFilled || 0) : 0;

  const formatDeadline = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f8fafc] max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  return (
    <Layout>
      {showApply && (
        <ApplyModal
          project={project}
          onClose={() => setShowApply(false)}
          onSuccess={() => { setHasApplied(true); fetchProject(); }}
        />
      )}

      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Explore
          </button>

          {/* ── Project Header Card ── */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            {/* Gradient bar */}
            <div className={`h-2 bg-gradient-to-r ${meta.bar}`} />

            <div className="p-6 sm:p-8">
              {/* Type badge — prominently placed */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                  {meta.badge} {meta.label}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  project.status === "open"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {project.status === "open" ? "● Open" : "● Closed"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3 leading-tight">
                {project.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {project.totalMembers} total members
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Deadline: {formatDeadline(project.deadline)}
                  </span>
                )}
                {project.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {project.duration}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  {project.applicantCount || 0} applicant{project.applicantCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Slots bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-slate-500 font-medium">Team slots filled</span>
                  <span className={`font-bold ${slots > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {slots > 0 ? `${slots} open slot${slots > 1 ? "s" : ""}` : "Team Full"}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${meta.bar} transition-all duration-700`}
                    style={{ width: `${Math.min((project.membersFilled / Math.max(project.totalMembers, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{project.membersFilled}/{project.totalMembers} members joined</p>
              </div>

              {/* Apply button */}
              {project.status === "open" && slots > 0 && !hasApplied && !isCreator && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {isLoggedIn ? (
                    <button
                      onClick={() => setShowApply(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Apply to Join
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Login to Apply <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}

              {/* Success Badge if applied */}
              {hasApplied && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Your application has been submitted
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* ── Left: Description + Roles ── */}
            <div className="sm:col-span-2 space-y-5">
              {/* Description */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
                  About this Project
                </h2>
                <p className="text-sm text-slate-600 leading-7 whitespace-pre-line">{project.description}</p>
              </div>

              {/* Roles Needed */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-violet-500 inline-block" />
                  Roles We're Looking For
                </h2>

                <div className="space-y-3">
                  {project.roles?.map((role, i) => {
                    const isFull = role.membersFilled >= role.membersNeeded;
                    const pct = (role.membersFilled / Math.max(role.membersNeeded, 1)) * 100;
                    return (
                      <div
                        key={i}
                        className={`border rounded-xl p-4 transition-all ${
                          isFull ? "border-slate-100 bg-slate-50 opacity-75" : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{role.roleName}</h3>
                            {role.description && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{role.description}</p>
                            )}
                          </div>
                          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                            isFull ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {isFull ? "Full" : `${role.membersNeeded - role.membersFilled} left`}
                          </span>
                        </div>

                        {/* Role slot progress */}
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{role.membersFilled}/{role.membersNeeded} filled</p>

                        {/* Skills */}
                        {role.skillsRequired?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {role.skillsRequired.map((s, si) => (
                              <span key={si} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack */}
              {project.techStack?.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6">
                  <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-sky-500 inline-block" />
                    Tech Stack
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((t, i) => (
                      <span key={i} className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded-xl font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Creator Info + Tags ── */}
            <div className="space-y-5">
              {/* Creator card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Posted by</p>
                <div className="flex items-center gap-3 mb-3">
                  {project.createdBy?.profilePic &&
                  !project.createdBy.profilePic.includes("via.placeholder.com") ? (
                    <img
                      src={project.createdBy.profilePic}
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                      alt={project.createdBy.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 items-center justify-center text-white text-lg font-bold border-2 border-slate-100"
                    style={{
                      display:
                        project.createdBy?.profilePic &&
                        !project.createdBy.profilePic.includes("via.placeholder.com")
                          ? "none"
                          : "flex",
                    }}
                  >
                    {project.createdBy?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{project.createdBy?.name}</p>
                    {project.createdBy?.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {project.createdBy.location}
                      </p>
                    )}
                  </div>
                </div>
                {project.createdBy?.bio && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{project.createdBy.bio}</p>
                )}
              </div>

              {/* Tags */}
              {project.tags?.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Info</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
                      {meta.badge} {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Team size</span>
                    <span className="font-semibold text-slate-800">{project.totalMembers} members</span>
                  </div>
                  {project.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-semibold text-slate-800">{project.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Applicants</span>
                    <span className="font-semibold text-slate-800">{project.applicantCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
