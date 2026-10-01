import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Share2,
  FileCode,
  FilePlus,
  Trash2,
  Check,
  AlertCircle,
  Terminal,
  Eye,
  ArrowLeft,
  Loader2,
  Copy,
  RotateCw,
  GitBranch,
  Layers,
  ChevronRight,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getProject,
  getProjectFiles,
  saveProjectFile,
  createProjectFile,
  deleteProjectFile,
} from '../services/projectService';
import { executeCode } from '../services/executionService';
import { Project, ProjectFile, ExecutionRecord } from '../types';
import { ShareModal } from '../components/ShareModal';
import { ReportModal } from '../components/ReportModal';

interface EditorPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ projectId, onNavigate }) => {
  const { currentUser, isOnline } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [isTypingAnimated, setIsTypingAnimated] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('Ready. Click Run or press ⌘+Enter / Ctrl+Enter.');
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'preview'>('terminal');
  const [lastExecution, setLastExecution] = useState<ExecutionRecord | null>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  // Modals & Panels
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const proj = await getProject(projectId);
      if (!proj) {
        setProject(null);
        return;
      }
      setProject(proj);

      const fileList = await getProjectFiles(projectId);
      setFiles(fileList);
      if (fileList.length > 0) {
        setActiveFileId(fileList[0].fileId);
        setOpenFileIds([fileList[0].fileId]);
      }

      if (proj.language === 'html') {
        setActiveBottomTab('preview');
      }
    } catch (err: any) {
      console.error(err);
      setLoadError(err?.message || 'Unable to load workspace files.');
    } finally {
      setLoading(false);
    }
  };

  const activeFile = files.find((f) => f.fileId === activeFileId);

  // Debounced auto-save (1.5 seconds)
  const handleCodeChange = (newContent: string) => {
    if (!activeFileId) return;

    setFiles((prev) =>
      prev.map((f) => (f.fileId === activeFileId ? { ...f, content: newContent, size: newContent.length } : f))
    );

    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveProjectFile(projectId, activeFileId, newContent);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('error');
      }
    }, 1500);
  };

  // Keyboard shortcut listener: Cmd/Ctrl+S to save, Cmd/Ctrl+Enter to run, Tab indentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) {
          setSaveStatus('saving');
          saveProjectFile(projectId, activeFile.fileId, activeFile.content)
            .then(() => setSaveStatus('saved'))
            .catch(() => setSaveStatus('error'));
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, files, project]);

  // Tab key handling inside textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const updateCursorPosition = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBefore.split('\n');
    setCursorLine(lines.length);
    setCursorCol(lines[lines.length - 1].length + 1);
  };

  const handleRun = async () => {
    if (!project || !currentUser) return;
    setIsRunning(true);
    setActiveBottomTab('terminal');
    setConsoleOutput('Executing program...\n');

    try {
      const res = await executeCode(
        currentUser.uid,
        project.projectId,
        project.name,
        project.language,
        files,
        activeFile
      );
      setLastExecution(res as any);
      setConsoleOutput(res.output);
    } catch (err: any) {
      setConsoleOutput(`[Execution Error]\n${err?.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Live coding animation inside the actual editor
  const triggerCodingAnimation = () => {
    if (!activeFile || isTypingAnimated) return;
    setIsTypingAnimated(true);

    const codeSnippet =
      project?.language === 'python'
        ? `\n\n# Dynamic Factorial Algorithm\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nfor i in range(1, 6):\n    print(f"{i}! = {factorial(i)}")\n`
        : project?.language === 'cpp'
        ? `\n\n// Matrix Computation\nvoid compute() {\n    std::cout << "Optimized matrix multiplication: OK" << std::endl;\n}\n`
        : `\n\n// Live Algorithm Benchmark\nfunction runBenchmark(cycles: number) {\n  const metrics = Array.from({ length: cycles }, (_, i) => Math.pow(i, 2));\n  console.log("Benchmark series generated:", metrics.slice(0, 5).join(", ") + "...");\n}\nrunBenchmark(10);\n`;

    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < codeSnippet.length) {
        const nextChar = codeSnippet[charIdx];
        activeFile.content += nextChar;
        handleCodeChange(activeFile.content);
        charIdx++;
      } else {
        clearInterval(interval);
        setIsTypingAnimated(false);
        handleRun();
      }
    }, 25);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const name = newFileName.trim();
    const ext = name.split('.').pop() || 'js';
    const newFile = await createProjectFile(projectId, name, `/${name}`, ext, '');

    setFiles([...files, newFile]);
    setOpenFileIds([...openFileIds, newFile.fileId]);
    setActiveFileId(newFile.fileId);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('Cannot delete the last file in the workspace.');
      return;
    }
    if (!confirm('Permanently delete this file?')) return;

    await deleteProjectFile(projectId, fileId);
    const updated = files.filter((f) => f.fileId !== fileId);
    setFiles(updated);
    setOpenFileIds(openFileIds.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(updated[0]?.fileId || null);
    }
  };

  const copyConsoleOutput = () => {
    navigator.clipboard.writeText(consoleOutput);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const generatePreviewSrcDoc = () => {
    const htmlFile = files.find((f) => f.name.endsWith('.html')) || activeFile;
    const cssFile = files.find((f) => f.name.endsWith('.css'));
    const jsFile = files.find((f) => f.name.endsWith('.js') && !f.name.endsWith('.html'));

    let html = htmlFile?.content || '<h1>Empty Web Project</h1>';
    const css = cssFile ? `<style>${cssFile.content}</style>` : '';
    const js = jsFile ? `<script>${jsFile.content}</script>` : '';

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${css}</head>`);
    } else {
      html = `${css}${html}`;
    }

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${js}</body>`);
    } else {
      html = `${html}${js}`;
    }

    return html;
  };

  const getFileBadgeColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
        return 'text-sky-400';
      case 'js':
        return 'text-amber-400';
      case 'py':
        return 'text-emerald-400';
      case 'java':
        return 'text-orange-400';
      case 'cpp':
      case 'c':
        return 'text-blue-400';
      case 'html':
        return 'text-rose-400';
      case 'css':
        return 'text-teal-400';
      case 'rs':
        return 'text-red-400';
      case 'go':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.25rem)] items-center justify-center bg-[#0c0d12] text-slate-500 text-xs font-mono">
        <Loader2 className="h-4 w-4 animate-spin text-[#38bdf8] mr-2" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-lg border border-[#232733] bg-[#12151c] text-center font-sans">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-slate-200">Unable to load project</h2>
        <p className="mt-1 text-xs text-slate-400 mb-5">
          {loadError.includes('Missing or insufficient')
            ? 'Permissions have been updated. Click Retry to reconnect.'
            : loadError}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadProjectData()}
            className="rounded bg-[#38bdf8] px-4 py-1.5 text-xs font-semibold text-[#0c0d12] hover:bg-[#0284c7] transition-colors"
          >
            Retry Loading
          </button>
          <button
            onClick={() => onNavigate('/projects')}
            className="rounded border border-[#2d3444] bg-[#1b202c] px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            Workspaces
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-lg border border-[#232733] bg-[#12151c] text-center">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-slate-200">Workspace not found</h2>
        <p className="mt-1 text-xs text-slate-400 mb-5">
          This project may have been deleted or access was restricted.
        </p>
        <button
          onClick={() => onNavigate('/projects')}
          className="rounded-md bg-[#1b202c] border border-[#2d3444] px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#232a3b]"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-[calc(100vh-3.25rem)] overflow-hidden font-sans select-none transition-colors ${
        isDark ? 'bg-[#0c0d12] text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Workbench Header */}
      <div
        className={`h-11 border-b px-3.5 flex items-center justify-between shrink-0 transition-colors ${
          isDark ? 'border-[#232733] bg-[#12151c]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/projects')}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            /
          </span>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {project.name}
            </span>
            <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
              ·
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{activeFile?.name || 'editor'}</span>
          </div>

          {/* Auto-Save & Sync status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pl-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="h-3 w-3" />
                <span>Save Error</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Coding Animation Button */}
          <button
            onClick={triggerCodingAnimation}
            disabled={isTypingAnimated}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border transition-colors ${
              isDark
                ? 'bg-[#1b202c] hover:bg-[#232a3b] border-[#2d3444] text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title="Simulate interactive live code typing animation"
          >
            {isTypingAnimated ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#38bdf8]" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">{isTypingAnimated ? 'Typing...' : 'Coding Animation'}</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || isTypingAnimated}
            className="flex items-center gap-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] text-xs font-semibold px-3 py-1.5 rounded transition-all active:scale-95 shadow-sm"
            title="Run Code (⌘+Enter / Ctrl+Enter)"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>Run</span>
            <span className="hidden md:inline text-[10px] opacity-75 font-mono">⌘↵</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className={`flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded transition-colors ${
              isDark
                ? 'bg-[#1b202c] hover:bg-[#232a3b] border-[#2d3444] text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Workbench Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity & File Tree */}
        <div
          className={`w-56 border-r flex flex-col shrink-0 transition-colors ${
            isDark ? 'border-[#232733] bg-[#0f1218]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div
            className={`h-9 px-3 border-b flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider font-mono ${
              isDark ? 'border-[#1e2330] text-slate-400' : 'border-slate-200 text-slate-600'
            }`}
          >
            <span>Explorer</span>
            <button
              onClick={() => setIsCreatingFile(true)}
              className="p-1 hover:text-[#38bdf8] rounded transition-colors"
              title="Add File"
            >
              <FilePlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* New file input form */}
          {isCreatingFile && (
            <form onSubmit={handleCreateFile} className={`p-2 border-b ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.ext"
                className={`w-full rounded border px-2 py-1 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-[#0c0d12] border-[#38bdf8] text-white' : 'bg-white border-sky-600 text-slate-900'
                }`}
                onBlur={() => {
                  if (!newFileName.trim()) setIsCreatingFile(false);
                }}
              />
            </form>
          )}

          {/* File list */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {files.map((file) => (
              <div
                key={file.fileId}
                onClick={() => {
                  setActiveFileId(file.fileId);
                  if (!openFileIds.includes(file.fileId)) {
                    setOpenFileIds([...openFileIds, file.fileId]);
                  }
                }}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                  activeFileId === file.fileId
                    ? isDark
                      ? 'bg-[#1b202c] text-white font-medium'
                      : 'bg-white text-slate-900 font-medium shadow-xs border border-slate-200'
                    : isDark
                    ? 'text-slate-400 hover:bg-[#141720] hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`h-3.5 w-3.5 shrink-0 ${getFileBadgeColor(file.name)}`} />
                  <span className="truncate font-mono text-[12px]">{file.name}</span>
                </div>
                {files.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteFile(file.fileId, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                    title="Delete File"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            className={`p-2 border-t text-[11px] font-mono flex items-center justify-between ${
              isDark ? 'border-[#1e2330] text-slate-500' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span>{files.length} files</span>
            <span>{project.language}</span>
          </div>
        </div>

        {/* Center: Tabs + Code Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs bar */}
          <div
            className={`h-9 border-b flex items-center overflow-x-auto px-2 gap-1 shrink-0 ${
              isDark ? 'bg-[#0c0d12] border-[#232733]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {openFileIds.map((id) => {
              const file = files.find((f) => f.fileId === id);
              if (!file) return null;
              const isActive = activeFileId === id;
              return (
                <div
                  key={id}
                  onClick={() => setActiveFileId(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border-b-2 cursor-pointer transition-colors ${
                    isActive
                      ? isDark
                        ? 'border-[#38bdf8] bg-[#141720] text-slate-100 font-medium'
                        : 'border-sky-600 bg-white text-slate-900 font-medium'
                      : isDark
                      ? 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#12151c]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className={getFileBadgeColor(file.name)}>•</span>
                  <span>{file.name}</span>
                  {openFileIds.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextIds = openFileIds.filter((x) => x !== id);
                        setOpenFileIds(nextIds);
                        if (activeFileId === id) {
                          setActiveFileId(nextIds[0] || null);
                        }
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Code Textarea with line numbers */}
          <div className={`flex flex-1 overflow-hidden ${isDark ? 'bg-[#0c0d12]' : 'bg-white'}`}>
            {activeFile ? (
              <div className="flex flex-1 h-full overflow-hidden">
                {/* Line numbers gutter */}
                <div
                  className={`w-12 border-r py-3 pr-2 text-right font-mono text-[12px] select-none overflow-hidden shrink-0 ${
                    isDark ? 'bg-[#090a0f] border-[#1e2330] text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {activeFile.content.split('\n').map((_, index) => (
                    <div
                      key={index}
                      className={`leading-6 ${
                        cursorLine === index + 1
                          ? isDark
                            ? 'text-slate-300 font-bold'
                            : 'text-slate-800 font-bold'
                          : ''
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Editor Textarea with live cursor animation */}
                <div className="relative flex-1 h-full">
                  <textarea
                    value={activeFile.content}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    onSelect={updateCursorPosition}
                    onClick={updateCursorPosition}
                    onKeyUp={updateCursorPosition}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    className={`w-full h-full resize-none p-3 font-mono text-[13px] focus:outline-none leading-6 select-text ${
                      isDark
                        ? 'bg-[#0c0d12] text-slate-100 placeholder-slate-700 selection:bg-[#0284c7]/40 selection:text-white'
                        : 'bg-white text-slate-900 placeholder-slate-400 selection:bg-sky-200 selection:text-slate-900'
                    }`}
                  />
                  {isTypingAnimated && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                      <span>Simulating Typing...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-slate-500 font-mono">
                Select a file from the explorer to view contents.
              </div>
            )}
          </div>

          {/* Bottom Terminal / Output Panel */}
          <div className={`h-56 border-t flex flex-col shrink-0 ${isDark ? 'border-[#232733] bg-[#0c0d12]' : 'border-slate-200 bg-[#0c0d12]'}`}>
            {/* Panel Tabs */}
            <div className={`h-8 border-b px-3.5 flex items-center justify-between text-xs font-mono ${isDark ? 'border-[#1e2330] bg-[#0f1218]' : 'border-[#1e2330] bg-[#090a0f]'}`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`flex items-center gap-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                    activeBottomTab === 'terminal'
                      ? 'border-[#38bdf8] text-[#38bdf8]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Terminal className="h-3 w-3" />
                  <span>Terminal</span>
                </button>

                {project.language === 'html' && (
                  <button
                    onClick={() => setActiveBottomTab('preview')}
                    className={`flex items-center gap-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                      activeBottomTab === 'preview'
                        ? 'border-[#38bdf8] text-[#38bdf8]'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Web Preview</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                {lastExecution && activeBottomTab === 'terminal' && (
                  <>
                    <span
                      className={`font-semibold ${
                        lastExecution.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {lastExecution.status}
                    </span>
                    <span className="tabular-nums">{lastExecution.executionTime}ms</span>
                    <span className="tabular-nums">Exit {lastExecution.exitCode}</span>
                  </>
                )}
                <button
                  onClick={copyConsoleOutput}
                  className="hover:text-slate-300 transition-colors p-1"
                  title="Copy Terminal Output"
                >
                  {copiedOutput ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden p-3 font-mono text-[12px] text-slate-300 bg-[#0c0d12]">
              {activeBottomTab === 'terminal' ? (
                <pre className="h-full overflow-y-auto whitespace-pre-wrap leading-relaxed select-text font-mono">
                  {consoleOutput}
                </pre>
              ) : (
                <iframe
                  title="Web Preview"
                  sandbox="allow-scripts allow-modals"
                  srcDoc={generatePreviewSrcDoc()}
                  className="w-full h-full rounded border border-[#232733] bg-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Status Bar */}
      <div
        className={`h-6 border-t px-3 flex items-center justify-between text-[11px] font-mono shrink-0 transition-colors ${
          isDark ? 'border-[#1e2330] bg-[#090a0f] text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>main</span>
          </span>
          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            ·
          </span>
          <span>0 errors</span>
          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            ·
          </span>
          <span>0 warnings</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            Ln {cursorLine}, Col {cursorCol}
          </span>
          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            ·
          </span>
          <span>Spaces: 2</span>
          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            ·
          </span>
          <span>UTF-8</span>
          <span aria-hidden="true" className={isDark ? 'text-slate-700' : 'text-slate-300'}>
            ·
          </span>
          <span className="capitalize">{project.language}</span>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          project={project}
          isOpen={true}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={true}
          onClose={() => setIsReportModalOpen(false)}
          targetId={project.projectId}
          targetType="project"
        />
      )}
    </div>
  );
};
