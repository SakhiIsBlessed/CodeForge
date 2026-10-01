import React, { useState, useEffect } from 'react';
import {
  FolderCode,
  Star,
  Plus,
  Clock,
  Terminal,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchUserProjects, updateProject } from '../services/projectService';
import { fetchUserExecutions } from '../services/executionService';
import { Project, ExecutionRecord } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenNewProject: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenNewProject,
}) => {
  const { currentUser, profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [projects, setProjects] = useState<Project[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [projList, execList] = await Promise.all([
        fetchUserProjects(currentUser.uid),
        fetchUserExecutions(currentUser.uid, 6),
      ]);
      setProjects(projList);
      setExecutions(execList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !proj.isFavorite;
    try {
      await updateProject(proj.projectId, { isFavorite: newStatus });
      setProjects(projects.map((p) => (p.projectId === proj.projectId ? { ...p, isFavorite: newStatus } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const totalProjects = projects.length;
  const totalExecutions = executions.length;
  const favoriteProjects = projects.filter((p) => p.isFavorite);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {profile?.fullName || 'Developer'}
            </h1>
            {profile?.username && (
              <span className="text-xs font-mono text-slate-500">@{profile.username}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Workspace overview and recent execution records
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 rounded-md bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className={`p-4 rounded-lg border transition-colors ${isDark ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-white shadow-xs'}`}>
          <div className="text-xs text-slate-400 mb-1">Projects</div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalProjects}</div>
          <p className="text-[11px] text-slate-500 mt-1">Real Firestore documents</p>
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${isDark ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-white shadow-xs'}`}>
          <div className="text-xs text-slate-400 mb-1">Executions</div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalExecutions}</div>
          <p className="text-[11px] text-slate-500 mt-1">Sandbox runs recorded</p>
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${isDark ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-white shadow-xs'}`}>
          <div className="text-xs text-slate-400 mb-1">Favorites</div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{favoriteProjects.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Starred workspaces</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs font-mono">
          <Loader2 className="h-4 w-4 animate-spin mb-2 text-[#38bdf8]" />
          <span>Loading workspaces...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className={`my-10 rounded-lg border border-dashed p-12 text-center ${isDark ? 'border-[#232733] bg-[#0e1117]' : 'border-slate-300 bg-white'}`}>
          <FolderCode className="h-8 w-8 text-slate-500 mx-auto mb-3" />
          <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>No projects yet</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Initialize your first workspace from our development templates.
          </p>
          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#38bdf8] px-4 py-2 text-xs font-semibold text-[#0c0d12] shadow-sm hover:bg-[#0284c7] transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Create your first project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-[#1e2330]' : 'border-slate-200'}`}>
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-400">
                Recent Projects
              </h2>
              <button
                onClick={() => onNavigate('/projects')}
                className="text-xs text-[#38bdf8] hover:underline flex items-center gap-0.5"
              >
                <span>View all ({projects.length})</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentProjects.map((p) => (
                <div
                  key={p.projectId}
                  onClick={() => onNavigate(`/editor/${p.projectId}`)}
                  className={`group flex flex-col justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#232733] bg-[#12151c] hover:border-[#38bdf8]/40 hover:bg-[#161a23]'
                      : 'border-slate-200 bg-white hover:border-sky-500 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className={`font-semibold capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.language}</span>
                        <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>
                        <span className="text-[11px] text-slate-500 capitalize">{p.visibility}</span>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(p, e)}
                        className="text-slate-400 hover:text-amber-400 p-0.5 transition-colors"
                        title={p.isFavorite ? 'Remove from favorites' : 'Star project'}
                      >
                        <Star className={`h-3.5 w-3.5 ${p.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <h3 className={`text-sm font-semibold group-hover:text-[#38bdf8] transition-colors truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] text-slate-500 font-mono ${isDark ? 'border-[#1e2330]' : 'border-slate-100'}`}>
                    <span>{p.filesCount || 1} files</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Starter Scaffolds */}
            <div className="pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-400 mb-3">
                Quick Environments
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {[
                  { name: 'TypeScript', lang: 'typescript', desc: 'Typed algorithms' },
                  { name: 'Python', lang: 'python', desc: 'Data structures' },
                  { name: 'Java', lang: 'java', desc: 'OOP program' },
                  { name: 'C++', lang: 'cpp', desc: 'DSA engine' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={onOpenNewProject}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isDark
                        ? 'border-[#232733] bg-[#12151c] hover:bg-[#161a23] hover:border-slate-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Execution History */}
          <div className="space-y-4">
            <div className={`pb-2 border-b ${isDark ? 'border-[#1e2330]' : 'border-slate-200'}`}>
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-400">
                Execution History
              </h2>
            </div>

            <div className={`rounded-lg border p-3 font-mono ${isDark ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-white'}`}>
              {executions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <Terminal className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                  <p>No executions yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {executions.map((exec) => (
                    <div
                      key={exec.executionId}
                      className={`p-2.5 rounded border text-xs ${
                        isDark ? 'bg-[#0c0d12] border-[#1e2330]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold truncate max-w-[130px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {exec.projectName || 'Sandbox'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            exec.status === 'Success' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {exec.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{exec.language} · {exec.executionTime}ms</span>
                        <span>{new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
