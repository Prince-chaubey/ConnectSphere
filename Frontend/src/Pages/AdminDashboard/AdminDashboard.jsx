import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users, Briefcase, Trophy, Rocket, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Clock, LayoutGrid, ArrowUpRight,
  BarChart3, FolderOpen, UserCheck, TrendingUp, Loader2, Shield
} from "lucide-react";

const TYPE_META = {
  capstone:    { label: "Capstone",    color: "bg-violet-100 text-violet-700", bar: "from-violet-500 to-purple-600", badge: "🎓" },
  hackathon:   { label: "Hackathon",   color: "bg-orange-100 text-orange-700", bar: "from-orange-500 to-red-500",   badge: "⚡" },
  group:       { label: "Group",       color: "bg-sky-100 text-sky-700",       bar: "from-sky-500 to-blue-600",     badge: "👥" },
  freelancing: { label: "Freelancing", color: "bg-emerald-100 text-emerald-700",bar:"from-emerald-500 to-teal-600",badge: "💼" },
};

const STATUS_DOT = {
  pending:  "bg-amber-400",
  accepted: "bg-emerald-500",
  rejected: "bg-red-400",
};

const ApplicationRow = ({ app, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
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

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50 rounded-xl transition-colors">
      {/* Avatar */}
      <div className="shrink-0">
        {applicant.profilePic ? (
          <img src={applicant.profilePic} className="w-9 h-9 rounded-full object-cover border border-slate-100" alt={applicant.name} />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {applicant.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{applicant.name || "Unknown"}</p>
        <p className="text-xs text-slate-400">Role: <span className="font-medium text-slate-600">{app.roleName}</span></p>
      </div>

      {/* Skills preview */}
      <div className="hidden sm:flex gap-1 flex-wrap max-w-[160px]">
        {applicant.skills?.slice(0, 2).map((s, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{s}</span>
        ))}
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {app.status === "pending" ? (
          updating ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <>
              <button
                onClick={() => handleStatus("accepted")}
                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Accept"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatus("rejected")}
                className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )
        ) : (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            app.status === "accepted"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[app.status]}`} />
            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Project Card with expandable applicants ───────────────────────────────────
const ProjectCard = ({ project: initialProject }) => {
  const [project, setProject] = useState(initialProject);
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[project.type] || TYPE_META.group;

  const handleStatusChange = (appId, newStatus) => {
    setProject((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a._id === appId ? { ...a, status: newStatus } : a
      ),
    }));
  };

  const pending  = project.applications?.filter((a) => a.status === "pending").length || 0;
  const accepted = project.applications?.filter((a) => a.status === "accepted").length || 0;
  const slots    = (project.totalMembers || 0) - (project.membersFilled || 0);
  const pct      = Math.min(((project.membersFilled / Math.max(project.totalMembers, 1)) * 100), 100);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${meta.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{meta.badge}</span>
            <div>
              <Link to={`/projects/${project._id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 group">
                {project.title}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${meta.color}`}>{meta.label}</span>
            </div>
          </div>

          {/* Applicant count badge */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{project.applicantCount || 0}</span>
            <span className="text-[10px] text-slate-400 font-medium">applicant{project.applicantCount !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> {pending} pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {accepted} accepted
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {slots} slots left
          </span>
        </div>

        {/* Slot bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full bg-gradient-to-r ${meta.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : "View"} applicants
        </button>
      </div>

      {/* Applicants list */}
      {expanded && (
        <div className="border-t border-slate-100 px-2 py-2">
          {project.applications?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No applicants yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {project.applications.map((app) => (
                <ApplicationRow key={app._id} app={app} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const role    = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin" && role !== "creator") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Admin sees all; creator sees only their projects
        if (role === "admin") {
          const res = await axios.get(`${API_URL}/projects/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) setData(res.data);
        } else {
          // Creator: use my-projects
          const res = await axios.get(`${API_URL}/projects/my-projects`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            const totalApps = res.data.projects.reduce((s, p) => s + p.applicantCount, 0);
            setData({
              overview: {
                totalProjects:      res.data.projects.length,
                totalApplications:  totalApps,
              },
              projects: res.data.projects,
            });
          }
        }
      } catch (err) {
        if (err.response?.status === 403) {
          toast?.error?.("Access denied");
          navigate("/");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f8fafc] max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  const overview = data?.overview || {};

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-7">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {role === "admin" ? "Admin Dashboard" : "Project Dashboard"}
              </h1>
            </div>
            <p className="text-slate-500 text-sm ml-11">
              {role === "admin"
                ? "Overview of all platform projects and applicant activity."
                : "Manage your posted projects and review applicants."}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 space-y-6">
          {/* ── Overview stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Projects",
                value: overview.totalProjects ?? data?.projects?.length ?? 0,
                icon:  FolderOpen,
                accent: "from-blue-500 to-indigo-500",
              },
              {
                label: "Total Applications",
                value: overview.totalApplications ?? 0,
                icon:  UserCheck,
                accent: "from-violet-500 to-purple-600",
              },
              ...(role === "admin" ? [{
                label: "Total Users",
                value: overview.totalUsers ?? 0,
                icon:  Users,
                accent: "from-emerald-500 to-teal-500",
              }] : [{
                label: "Open Slots",
                value: (data?.projects || []).reduce((s, p) => s + Math.max((p.totalMembers - p.membersFilled), 0), 0),
                icon:  TrendingUp,
                accent: "from-emerald-500 to-teal-500",
              }]),
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center shrink-0 shadow-sm`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Projects list ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Projects ({data?.projects?.length || 0})
              </h2>
              <Link
                to="/create-project"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                + Post New
              </Link>
            </div>

            {!data?.projects?.length ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
                <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">No projects yet.</p>
                <Link to="/create-project" className="mt-3 inline-block text-sm text-blue-600 font-bold hover:underline">
                  Post your first project →
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {data.projects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
