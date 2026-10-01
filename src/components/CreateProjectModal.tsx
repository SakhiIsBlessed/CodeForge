import React, { useState } from 'react';
import {
  X,
  Lock,
  Globe,
  EyeOff,
  CheckCircle2,
  Loader2,
  FileCode2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createProject, TEMPLATES } from '../services/projectService';
import { ProjectLanguage, ProjectVisibility } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

const LANGUAGES: { id: ProjectLanguage; name: string; desc: string; ext: string }[] = [
  { id: 'typescript', name: 'TypeScript', desc: 'Type-safe algorithm suite', ext: '.ts' },
  { id: 'javascript', name: 'JavaScript', desc: 'Node.js & ESModules', ext: '.js' },
  { id: 'python', name: 'Python', desc: 'Algorithm practice & scripts', ext: '.py' },
  { id: 'html', name: 'Web Sandbox', desc: 'HTML, CSS & JS DOM preview', ext: '.html' },
  { id: 'java', name: 'Java', desc: 'Calculator & OOP program', ext: '.java' },
  { id: 'cpp', name: 'C++', desc: 'High performance DSA engine', ext: '.cpp' },
  { id: 'rust', name: 'Rust', desc: 'CLI systems program', ext: '.rs' },
  { id: 'go', name: 'Go', desc: 'Concurrent microservice', ext: '.go' },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { currentUser, profile } = useAuth();
  const [selectedLang, setSelectedLang] = useState<ProjectLanguage>('typescript');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<ProjectVisibility>('private');

  const [step, setStep] = useState<'idle' | 'creating_project' | 'creating_files' | 'ready'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setErrorMsg(null);
    const chosenTemplate = TEMPLATES[selectedLang];
    const finalName = name.trim() || chosenTemplate.name;
    const finalDesc = description.trim() || chosenTemplate.description;

    try {
      setStep('creating_project');
      await new Promise((r) => setTimeout(r, 400));

      setStep('creating_files');
      const project = await createProject(
        currentUser.uid,
        profile?.fullName || 'Developer',
        profile?.username || 'dev',
        finalName,
        finalDesc,
        selectedLang,
        visibility
      );

      setStep('ready');
      await new Promise((r) => setTimeout(r, 400));

      onClose();
      setName('');
      setDescription('');
      setStep('idle');
      onProjectCreated(project.projectId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to create project. Please verify your connection.');
      setStep('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d12]/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-lg border border-[#232733] bg-[#12151c] p-6 shadow-2xl font-sans">
        <div className="flex items-center justify-between border-b border-[#232733] pb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Create Workspace</h2>
            <p className="text-xs text-slate-400">Initialize a cloud development environment</p>
          </div>
          {step === 'idle' && (
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-[#1b202c] hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded border border-rose-900/60 bg-rose-950/20 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {step !== 'idle' ? (
          <div className="my-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              {step === 'ready' ? (
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full border-2 border-[#38bdf8]/20 border-t-[#38bdf8] animate-spin" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-200 font-mono">
                {step === 'creating_project' && 'Provisioning project document...'}
                {step === 'creating_files' && 'Scaffolding workspace files...'}
                {step === 'ready' && 'Workspace ready. Opening editor...'}
              </h3>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
                Language &amp; Environment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLang(l.id);
                      if (!name) setName(TEMPLATES[l.id].name);
                    }}
                    className={`flex flex-col items-start p-2.5 rounded border text-left transition-all ${
                      selectedLang === l.id
                        ? 'border-[#38bdf8] bg-[#1b202c] text-white shadow-sm'
                        : 'border-[#232733] bg-[#0c0d12] hover:bg-[#161a22] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs font-semibold text-slate-200">{l.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{l.ext}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate w-full">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={TEMPLATES[selectedLang].name}
                  maxLength={100}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-2 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Visibility</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['private', 'unlisted', 'public'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-2 text-xs capitalize transition-colors ${
                        visibility === v
                          ? 'border-[#38bdf8] bg-[#1b202c] text-white font-medium'
                          : 'border-[#232733] bg-[#0c0d12] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {v === 'private' && <Lock className="h-3 w-3" />}
                      {v === 'unlisted' && <EyeOff className="h-3 w-3" />}
                      {v === 'public' && <Globe className="h-3 w-3" />}
                      <span>{v}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Workspace description..."
                rows={2}
                maxLength={500}
                className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-2 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#232733]">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded bg-[#38bdf8] hover:bg-[#0284c7] px-4 py-1.5 text-xs font-semibold text-[#0c0d12] shadow-sm transition-all"
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Initialize Workspace</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
