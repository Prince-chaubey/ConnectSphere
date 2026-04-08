import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import {
  Search, Filter, Users, Calendar, ChevronRight,
  Rocket, Code2, Trophy, Briefcase, Clock, Tag, ArrowUpRight, SlidersHorizontal, X
} from "lucide-react";

const TYPE_META = {
  capstone:   { label: "Capstone",    color: "bg-violet-100 text-violet-700 border-violet-200",   dot: "bg-violet-500",  accent: "from-violet-500 to-purple-600" },
  hackathon:  { label: "Hackathon",   color: "bg-orange-100 text-orange-700 border-orange-200",   dot: "bg-orange-500",  accent: "from-orange-500 to-red-500" },
  group:      { label: "Group Project",color: "bg-sky-100 text-sky-700 border-sky-200",           dot: "bg-sky-500",     accent: "from-sky-500 to-blue-600" },
  freelancing:{ label: "Freelancing",  color: "bg-emerald-100 text-emerald-700 border-emerald-200",dot: "bg-emerald-500", accent: "from-emerald-500 to-teal-600" },
};

const TYPE_ICON = {
  capstone:    Rocket,
  hackathon:   Trophy,
  group:       Users,
  freelancing: Briefcase,
};

const slotsLeft = (project) =>
  (project.totalMembers || 0) - (project.membersFilled || 0);

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project }) => {
  const meta  = TYPE_META[project.type] || TYPE_META.group;
  const Icon  = TYPE_ICON[project.type] || Users;
  const slots = slotsLeft(project);
  const filled = (project.membersFilled / Math.max(project.totalMembers, 1)) * 100;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
    >
      {/* Top accent line */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.accent}`} />

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${meta.accent} shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color} shrink-0`}>
            {meta.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100 font-medium">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-slate-400">+{project.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Slots progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.membersFilled}/{project.totalMembers} members
            </span>
            <span className={`text-xs font-bold ${slots > 0 ? "text-emerald-600" : "text-red-500"}`}>
              {slots > 0 ? `${slots} slot${slots > 1 ? "s" : ""} left` : "Full"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${meta.accent} transition-all duration-500`}
              style={{ width: `${Math.min(filled, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {project.createdBy?.profilePic ? (
            <img src={project.createdBy.profilePic} className="w-6 h-6 rounded-full object-cover border border-slate-100" alt="creator" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              {project.createdBy?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className="text-xs text-slate-400 font-medium">{project.createdBy?.name || "Creator"}</span>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(project.createdAt)}
        </span>
      </div>

      {/* Hover arrow */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
    </Link>
  );
};

// ─── Main Explore Page ─────────────────────────────────────────────────────────
const Explore = () => {
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeType, setActiveType] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProjects();
  }, [activeType]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = { status: "open" };
      if (activeType !== "all") params.type = activeType;
      const res = await axios.get(`${API_URL}/projects`, { params });
      if (res.data.success) setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const tabs = [
    { key: "all",        label: "All Projects" },
    { key: "capstone",   label: "Capstone" },
    { key: "hackathon",  label: "Hackathon" },
    { key: "group",      label: "Group" },
    { key: "freelancing",label: "Freelancing" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Browse Opportunities</p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Find your next team
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Capstone projects, hackathons, freelancing gigs, and group collaborations — all in one place.
              </p>
            </div>

            {/* Search */}
            <div className="mt-6 flex items-center gap-3 max-w-xl">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, skill, or tag..."
                  className="bg-transparent text-sm flex-1 outline-none text-slate-700 placeholder-slate-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter tabs */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveType(tab.key)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    activeType === tab.key
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-1 bg-slate-100" />
                  <div className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100" />
                      <div className="flex-1 h-10 rounded-xl bg-slate-100" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-lg" />
                    <div className="h-3 bg-slate-100 rounded-lg w-5/6" />
                    <div className="h-2 bg-slate-100 rounded-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No projects found</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                {search ? `No results for "${search}". Try a different keyword.` : "No open projects right now. Check back soon!"}
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="mt-4 text-sm text-blue-600 font-semibold hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500">
                  <span className="font-bold text-slate-900">{filtered.length}</span> project{filtered.length !== 1 ? "s" : ""} found
                </p>
                <button
                  onClick={() => navigate("/create-project")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Rocket className="w-4 h-4" /> Post a Project
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
