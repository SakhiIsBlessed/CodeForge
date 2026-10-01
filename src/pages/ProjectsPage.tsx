import React, { useState, useEffect } from 'react';
import {
  FolderCode,
  Search,
  Plus,
  Star,
  Lock,
  Globe,
  EyeOff,
  Trash2,
  Share2,
  Code2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchUserProjects, deleteProject, updateProject } from '../services/projectService';
import { Project } from '../types';
import { ShareModal } from '../components/ShareModal';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
  onOpenNewProject: () => void;
  initialFilter?: string;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onNavigate,
  onOpenNewProject,
  initialFilter,
}) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'public' | 'private'>(
    (initialFilter as any) || 'all'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await fetchUserProjects(currentUser.uid);
      setProjects(list);
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

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this project and all its files?')) {
      return;
    }
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.projectId !== projectId));
    } catch (err) {
      console.error(err);
      alert('Unable to delete project.');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'favorites' && !p.isFavorite) return false;
    if (selectedFilter === 'public' && p.visibility !== 'public') return false;
    if (selectedFilter === 'private' && p.visibility !== 'private') return false;
    if (selectedLanguage !== 'all' && p.language !== selectedLanguage) return false;

    return true;
  });

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>Workspaces</span>
            <span className="text-xs font-mono text-slate-500 font-normal">({projects.length})</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your persistent code projects and sharing settings
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 rounded-md bg-[#38bdf8] hover:bg-[#0284c7] px-3.5 py-1.5 text-xs font-semibold text-[#0c0d12] shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="my-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className={`w-full rounded-md border pl-8 pr-3 py-1.5 text-xs placeholder-slate-500 focus:border-[#38bdf8] focus:outline-none transition-colors ${
              isDark ? 'border-[#232733] bg-[#12151c] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'favorites', 'public', 'private'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`rounded px-2.5 py-1 text-xs capitalize transition-colors font-mono ${
                selectedFilter === filter
                  ? isDark
                    ? 'bg-[#1b202c] text-white font-medium border border-[#2d3444]'
                    : 'bg-white text-slate-900 font-medium border border-slate-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'favorites' ? '★ Starred' : filter}
            </button>
          ))}

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`rounded border px-2 py-1 text-xs focus:border-[#38bdf8] focus:outline-none font-mono ${
              isDark ? 'border-[#232733] bg-[#12151c] text-slate-300' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            <option value="all">All Languages</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">Web Sandbox</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs font-mono">
          <Loader2 className="h-4 w-4 animate-spin mb-2 text-[#38bdf8]" />
          <span>Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className={`my-10 rounded-lg border border-dashed p-12 text-center ${isDark ? 'border-[#232733] bg-[#0c0d12]' : 'border-slate-300 bg-white'}`}>
          <Code2 className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>No projects found</h2>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery ? 'No workspace matches the query.' : 'Initialize a project to start coding.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span className={`font-semibold capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.language}</span>
                    <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>
                    <span className="text-[11px] text-slate-500 capitalize">{p.visibility}</span>
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(p, e)}
                    className="text-slate-400 hover:text-amber-400 p-0.5 transition-colors"
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
                <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToShare(p);
                    }}
                    className="p-1 hover:text-slate-200 transition-colors"
                    title="Share Workspace"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.projectId, e)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Delete Workspace"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {projectToShare && (
        <ShareModal
          project={projectToShare}
          isOpen={true}
          onClose={() => setProjectToShare(null)}
        />
      )}
    </div>
  );
};
