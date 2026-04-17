import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import {
  Clock, CheckCircle2, XCircle, ChevronRight, Inbox,
  Rocket, Trophy, Users, Briefcase, Calendar, ArrowUpRight
} from "lucide-react";

const TYPE_META = {
  capstone:    { label: "Capstone",    color: "bg-violet-100 text-violet-700 border-violet-200",   badge: "🎓" },
  hackathon:   { label: "Hackathon",   color: "bg-orange-100 text-orange-700 border-orange-200",   badge: "⚡" },
  group:       { label: "Group",       color: "bg-sky-100 text-sky-700 border-sky-200",            badge: "👥" },
  freelancing: { label: "Freelancing", color: "bg-emerald-100 text-emerald-700 border-emerald-200", badge: "💼" },
};

const STATUS_META = {
  pending:  { label: "Pending",  color: "bg-amber-50 text-amber-700 border-amber-200",    icon: Clock,         dotColor: "bg-amber-400" },
  selected: { label: "selected", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, dotColor: "bg-emerald-500" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600 border-red-200",          icon: XCircle,       dotColor: "bg-red-400" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/projects/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setApplications(res.data.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

      
    };
    fetchApplications();
  }, []);

  const filtered = applications.filter(
    (a) => filter === "all" || a.status === filter
  );

  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => a.status === "pending").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const tabs = [
    { key: "all",      label: `All (${counts.all})` },
    { key: "pending",  label: `Pending (${counts.pending})` },
    { key: "selected", label: `selected (${counts.selected})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-500 text-sm mt-1">Track all your project applications in one place.</p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { label: "Total", val: counts.all,      color: "bg-slate-900 text-white" },
                { label: "Pending", val: counts.pending, color: "bg-amber-100 text-amber-700" },
                { label: "selected", val: counts.selected, color: "bg-emerald-100 text-emerald-700" },
                { label: "Rejected", val: counts.rejected, color: "bg-red-100 text-red-600" },
              ].map((s) => (
                <div key={s.label} className={`px-4 py-2 rounded-xl flex items-center gap-2 ${s.color}`}>
                  <span className="text-lg font-extrabold leading-none">{s.val}</span>
                  <span className="text-xs font-semibold opacity-80">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filter === tab.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="w-20 h-6 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                {filter === "all" ? "No applications yet" : `No ${filter} applications`}
              </h3>
              <p className="text-sm text-slate-400 max-w-xs mb-5">
                {filter === "all"
                  ? "Start browsing projects and apply to teams that match your skills."
                  : `You don't have any ${filter} applications right now.`}
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors"
              >
                Browse Projects <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => {
                const typeMeta   = TYPE_META[app.project?.type] || TYPE_META.group;
                const statusMeta = STATUS_META[app.status] || STATUS_META.pending;
                const StatusIcon = statusMeta.icon;

                return (
                  <Link
                    key={app._id}
                    to={`/projects/${app.project?._id}`}
                    className="block bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Type indicator */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50 border border-slate-100 shrink-0">
                        {typeMeta.badge}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {app.project?.title || "Project"}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Applied for: <span className="font-semibold text-slate-600">{app.roleName}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusMeta.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>

                        {/* Host (project creator) avatar + name */}
                        {app.project?.createdBy && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {app.project.createdBy.profilePic &&
                            !app.project.createdBy.profilePic.includes("via.placeholder.com") ? (
                              <img
                                src={app.project.createdBy.profilePic}
                                alt={app.project.createdBy.name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                {app.project.createdBy.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="text-[11px] text-slate-400 truncate">
                              by <span className="font-semibold text-slate-600">{app.project.createdBy.name}</span>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeMeta.color}`}>
                            {typeMeta.label}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {timeAgo(app.createdAt)}
                          </span>
                        </div>

                        {app.coverLetter && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">
                            &ldquo;{app.coverLetter}&rdquo;
                          </p>
                        )}
                      </div>

                      <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyApplications;
