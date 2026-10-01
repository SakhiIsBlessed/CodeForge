import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Globe,
  Github,
  Linkedin,
  FolderCode,
  Edit3,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Project } from '../types';
import { ReportModal } from '../components/ReportModal';

interface ProfilePageProps {
  usernameParam?: string;
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ usernameParam, onNavigate }) => {
  const { currentUser, profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const targetUsername = usernameParam?.replace(/^@/, '') || currentProfile?.username;
  const isSelf = currentProfile && currentProfile.username.toLowerCase() === targetUsername?.toLowerCase();

  useEffect(() => {
    loadProfileAndProjects();
  }, [targetUsername]);

  const loadProfileAndProjects = async () => {
    if (!targetUsername) return;
    setLoading(true);
    try {
      // Find user doc by username query
      const userQ = query(collection(db, 'users'), where('username', '==', targetUsername));
      const userSnap = await getDocs(userQ);

      if (!userSnap.empty) {
        const uData = userSnap.docs[0].data() as UserProfile;
        setProfile(uData);

        // Fetch user's public projects
        const projQ = query(
          collection(db, 'projects'),
          where('ownerId', '==', uData.uid),
          where('visibility', '==', 'public')
        );
        const projSnap = await getDocs(projQ);
        setPublicProjects(projSnap.docs.map((d) => d.data() as Project));
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-400" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-slate-800 bg-slate-900 text-center">
        <User className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-slate-200">Developer profile not found</h2>
        <p className="mt-1 text-xs text-slate-400 mb-6">
          No developer account is currently registered under @{targetUsername}.
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-600/20 overflow-hidden ring-2 ring-white/10">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <span>{profile.fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{profile.fullName}</h1>
                {profile.emailVerified && (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-indigo-400">@{profile.username}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span>•</span>
                <span>{publicProjects.length} Public Projects</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSelf ? (
              <button
                onClick={() => onNavigate('/settings/profile')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Report Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio & Socials */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">About</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.bio || 'This developer has not provided a biography yet.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Links</h3>
            <div className="flex flex-col gap-1.5 text-xs">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors truncate"
                >
                  <Github className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{profile.githubUrl}</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors truncate"
                >
                  <Linkedin className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{profile.linkedinUrl}</span>
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors truncate"
                >
                  <Globe className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{profile.websiteUrl}</span>
                </a>
              )}
              {!profile.githubUrl && !profile.linkedinUrl && !profile.websiteUrl && (
                <p className="text-xs text-slate-500 italic">No social links configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Public Projects Section */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <FolderCode className="h-4 w-4 text-indigo-400" />
          <span>Public Projects ({publicProjects.length})</span>
        </h2>

        {publicProjects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
            <FolderCode className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No public projects published yet.</p>
            {isSelf && (
              <p className="text-[11px] text-slate-500 mt-1">
                You can change a project's visibility to Public in its settings.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicProjects.map((p) => (
              <div
                key={p.projectId}
                onClick={() => onNavigate(`/editor/${p.projectId}`)}
                className="group flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {p.language}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{p.filesCount || 1} files</span>
                  <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Workspace</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReportOpen && (
        <ReportModal
          isOpen={true}
          onClose={() => setIsReportOpen(false)}
          targetId={profile.uid}
          targetType="profile"
        />
      )}
    </div>
  );
};
