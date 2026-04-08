import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft, Plus, X, Rocket, Trophy, Users, Briefcase,
  Calendar, Clock, Tag as TagIcon, Code2, Loader2, ChevronDown, Info
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "capstone",    label: "Capstone Project", icon: "🎓", desc: "Academic capstone or final year project" },
  { value: "hackathon",   label: "Hackathon",        icon: "⚡", desc: "Time-bound competition or hackathon" },
  { value: "group",       label: "Group Project",    icon: "👥", desc: "Collaborative class or personal project" },
  { value: "freelancing", label: "Freelancing",      icon: "💼", desc: "Paid freelance work or client project" },
];

const emptyRole = () => ({
  roleName: "",
  description: "",
  skillsRequired: [],
  membersNeeded: 1,
  _tempSkill: "",
});

const CreateProject = () => {
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title:       "",
    description: "",
    type:        "",
    deadline:    "",
    duration:    "",
    techStack:   [],
    tags:        [],
    _tempTag:    "",
    _tempTech:   "",
  });
  const [roles, setRoles] = useState([emptyRole()]);

  // ── Form field helpers ─────────────────────────────────────────────────────
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addTag = (key, tempKey) => {
    const val = form[tempKey]?.trim();
    if (!val) return;
    if (!form[key].includes(val)) setField(key, [...form[key], val]);
    setField(tempKey, "");
  };

  const removeTag = (key, val) =>
    setField(key, form[key].filter((t) => t !== val));

  // ── Role helpers ───────────────────────────────────────────────────────────
  const updateRole = (idx, key, val) =>
    setRoles((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));

  const addRoleSkill = (idx) => {
    const skill = roles[idx]._tempSkill?.trim();
    if (!skill) return;
    if (!roles[idx].skillsRequired.includes(skill))
      updateRole(idx, "skillsRequired", [...roles[idx].skillsRequired, skill]);
    updateRole(idx, "_tempSkill", "");
  };

  const removeRoleSkill = (idx, skill) =>
    updateRole(idx, "skillsRequired", roles[idx].skillsRequired.filter((s) => s !== skill));

  const addRole = () => setRoles((prev) => [...prev, emptyRole()]);

  const removeRole = (idx) =>
    setRoles((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return toast.error("Please select a project type");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");

    const validRoles = roles.filter((r) => r.roleName.trim());
    if (validRoles.length === 0) return toast.error("Add at least one role");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");

    const cleanedRoles = validRoles.map(({ _tempSkill, ...rest }) => rest);

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_URL}/projects`,
        {
          title:       form.title.trim(),
          description: form.description.trim(),
          type:        form.type,
          deadline:    form.deadline || undefined,
          duration:    form.duration.trim(),
          techStack:   form.techStack,
          tags:        form.tags,
          roles:       cleanedRoles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Project posted! 🚀");
        navigate(`/projects/${res.data.project._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium group transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post a New Project</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details and start finding your team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Project Type ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-violet-500" />
                Project Type *
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setField("type", t.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      form.type === t.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <p className="text-sm font-bold">{t.label}</p>
                    <p className={`text-xs mt-0.5 ${form.type === t.value ? "text-slate-300" : "text-slate-400"}`}>
                      {t.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Basic Info ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-blue-500" />
                Basic Information
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. AI-powered study planner"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the project, its goals, and what you're building..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setField("deadline", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    placeholder="e.g. 3 months"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* ── Roles ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-emerald-500" />
                  Team Roles *
                </h2>
                <button
                  type="button"
                  onClick={addRole}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Role
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((role, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 relative group">
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Role Name *
                        </label>
                        <input
                          type="text"
                          value={role.roleName}
                          onChange={(e) => updateRole(idx, "roleName", e.target.value)}
                          placeholder="e.g. Frontend Dev"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Members Needed *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={role.membersNeeded}
                          onChange={(e) => updateRole(idx, "membersNeeded", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Role Description
                      </label>
                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => updateRole(idx, "description", e.target.value)}
                        placeholder="What will this person work on?"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder-slate-300"
                      />
                    </div>

                    {/* Skills for this role */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Skills Required
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {role.skillsRequired.map((s, si) => (
                          <span key={si} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                            {s}
                            <button type="button" onClick={() => removeRoleSkill(idx, s)} className="hover:text-red-500">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role._tempSkill}
                          onChange={(e) => updateRole(idx, "_tempSkill", e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRoleSkill(idx); } }}
                          placeholder="Add skill + Enter"
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400 transition-all placeholder-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => addRoleSkill(idx)}
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tech Stack + Tags ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-sky-500" />
                Tech Stack & Tags
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Tech Stack
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.techStack.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-900 text-white rounded-xl font-medium">
                      {t}
                      <button type="button" onClick={() => removeTag("techStack", t)} className="hover:text-red-300">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form._tempTech}
                    onChange={(e) => setField("_tempTech", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("techStack", "_tempTech"); } }}
                    placeholder="React, Node.js, MongoDB..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
                  />
                  <button type="button" onClick={() => addTag("techStack", "_tempTech")}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors">
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Project Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl font-medium">
                      #{t}
                      <button type="button" onClick={() => removeTag("tags", t)} className="hover:text-red-500">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form._tempTag}
                    onChange={(e) => setField("_tempTag", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag("tags", "_tempTag"); } }}
                    placeholder="AI, mobile, blockchain..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-300"
                  />
                  <button type="button" onClick={() => addTag("tags", "_tempTag")}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="flex gap-3 pb-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Rocket className="w-4 h-4" /> Post Project</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
