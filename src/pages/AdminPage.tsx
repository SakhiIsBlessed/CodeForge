import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FolderCode,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Loader2,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { fetchAllReports, updateReportStatus, deleteReport } from '../services/reportService';
import { Report, ReportStatus } from '../types';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { currentUser, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    userCount: 0,
    projectCount: 0,
    reportCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reps, usersSnap, projectsSnap] = await Promise.all([
        fetchAllReports(),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'projects')),
      ]);

      setReports(reps);
      setStats({
        userCount: usersSnap.size,
        projectCount: projectsSnap.size,
        reportCount: reps.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    try {
      await updateReportStatus(reportId, status);
      setReports(reports.map((r) => (r.reportId === reportId ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReportItem = async (reportId: string) => {
    if (!confirm('Remove this moderation report?')) return;
    try {
      await deleteReport(reportId);
      setReports(reports.filter((r) => r.reportId !== reportId));
    } catch (err) {
      console.error(err);
    }
  };

  // If not admin, block view
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-red-900/60 bg-red-950/20 text-center">
        <Shield className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-slate-100">Access Denied</h2>
        <p className="mt-1 text-xs text-slate-400 mb-6">
          This area is restricted to authorized platform administrators.
        </p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Console</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              System monitoring, content moderation, and access governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-xs font-medium">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Cloud Services Operational</span>
          </span>
        </div>
      </div>

      {/* Real Platform Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Registered Developers</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.userCount}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Total Projects</span>
            <FolderCode className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.projectCount}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Moderation Queue</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.reportCount}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Security Rules</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-2">v2 Strict Hardened</div>
        </div>
      </div>

      {/* Moderation Queue Section */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Community Moderation Reports ({reports.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Review reported projects, shared links, and user profiles</p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'open', 'reviewing', 'resolved', 'dismissed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-2.5 py-1 text-xs capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-400" />
            <span>Fetching moderation queue...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
            <p>Moderation queue is clean. No matching reports.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredReports.map((r) => (
              <div
                key={r.reportId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 uppercase bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                      {r.targetType}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-xs">
                      Target ID: {r.targetId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                        r.status === 'Open'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : r.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">{r.reason}</p>
                  <p className="text-[10px] text-slate-500">
                    Reported on {new Date(r.createdAt).toLocaleString()} by {r.reporterId}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={r.status}
                    onChange={(e) => handleUpdateStatus(r.reportId, e.target.value as ReportStatus)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteReportItem(r.reportId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
