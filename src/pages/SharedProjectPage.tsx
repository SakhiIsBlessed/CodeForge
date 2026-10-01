import React, { useState, useEffect } from 'react';
import {
  Code2,
  GitFork,
  Play,
  FileCode,
  AlertCircle,
  Loader2,
  Terminal,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSharedProjectDetails } from '../services/shareService';
import { forkProject } from '../services/projectService';
import { executeCode } from '../services/executionService';
import { Project, ProjectFile, SharedProject } from '../types';
import { ReportModal } from '../components/ReportModal';

interface SharedProjectPageProps {
  shareId: string;
  onNavigate: (path: string) => void;
}

export const SharedProjectPage: React.FC<SharedProjectPageProps> = ({ shareId, onNavigate }) => {
  const { currentUser, profile } = useAuth();
  const [data, setData] = useState<{ share: SharedProject; project: Project; files: ProjectFile[] } | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('Click Run to test this project in sandbox.');
  const [isRunning, setIsRunning] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    loadShared();
  }, [shareId]);

  const loadShared = async () => {
    setLoading(true);
    try {
      const res = await getSharedProjectDetails(shareId);
      setData(res);
      if (res && res.files.length > 0) {
        setActiveFileId(res.files[0].fileId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFork = async () => {
    if (!currentUser) {
      onNavigate('/login');
      return;
    }
    if (!data) return;

    setForking(true);
    try {
      const forked = await forkProject(
        data.project.projectId,
        currentUser.uid,
        profile?.fullName || 'Developer',
        profile?.username || 'dev'
      );
      onNavigate(`/editor/${forked.projectId}`);
    } catch (e) {
      console.error(e);
      alert('Unable to fork project.');
    } finally {
      setForking(false);
    }
  };

  const handleRun = async () => {
    if (!data) return;
    setIsRunning(true);
    setConsoleOutput('Executing in safe isolated sandbox...\n');
    try {
      const activeFile = data.files.find((f) => f.fileId === activeFileId);
      const res = await executeCode(
        currentUser ? currentUser.uid : 'guest',
        data.project.projectId,
        data.project.name,
        data.project.language,
        data.files,
        activeFile
      );
      setConsoleOutput(res.output);
    } catch (err: any) {
      setConsoleOutput(`[Execution Error]\n${err?.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-400" />
        <span className="ml-2">Resolving secure project link...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-slate-800 bg-slate-900 text-center">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-slate-200">Shared link not found</h2>
        <p className="mt-1 text-xs text-slate-400 mb-6">
          This share link may have expired or been revoked by the owner.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow"
        >
          Return Home
        </button>
      </div>
    );
  }

  const { share, project, files } = data;
  const activeFile = files.find((f) => f.fileId === activeFileId);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950 font-sans">
      {/* Top Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-100">{project.name}</span>
            <span className="text-[10px] text-slate-500">by @{project.ownerUsername}</span>
            <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20 uppercase">
              {project.language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>Run Sandbox</span>
          </button>

          {share.permission === 'fork' && (
            <button
              onClick={handleFork}
              disabled={forking}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              {forking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitFork className="h-3.5 w-3.5" />}
              <span>Fork Workspace</span>
            </button>
          )}

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Report Content"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor & Console */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 border-r border-slate-800 bg-slate-900/60 p-3 flex flex-col shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Shared Files ({files.length})
          </div>
          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.fileId}
                onClick={() => setActiveFileId(file.fileId)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-colors ${
                  activeFileId === file.fileId
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Read-only Code View */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-auto bg-slate-900 p-4 font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="select-text whitespace-pre-wrap">{activeFile?.content || ''}</pre>
          </div>

          {/* Console */}
          <div className="h-48 border-t border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 flex flex-col shrink-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Terminal className="h-3 w-3" />
              <span>Sandbox Console</span>
            </div>
            <pre className="flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {consoleOutput}
            </pre>
          </div>
        </div>
      </div>

      {isReportOpen && (
        <ReportModal
          isOpen={true}
          onClose={() => setIsReportOpen(false)}
          targetId={share.shareId}
          targetType="shared"
        />
      )}
    </div>
  );
};
