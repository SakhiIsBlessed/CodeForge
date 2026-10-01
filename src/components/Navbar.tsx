import React, { useState } from 'react';
import {
  Terminal,
  Plus,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  FolderCode,
  LayoutDashboard,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenNewProject }) => {
  const { currentUser, profile, isAdmin, logout, isOnline } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    onNavigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        isDark ? 'border-[#232733] bg-[#0c0d12]/95' : 'border-slate-200 bg-white/95 text-slate-800'
      }`}
    >
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <button
            onClick={() => onNavigate(currentUser ? '/dashboard' : '/')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-[#38bdf8] ${
                isDark ? 'bg-[#1b202c] border-[#2d3444]' : 'bg-slate-100 border-slate-300 text-sky-600'
              }`}
            >
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                CodeForge
              </span>
              <span className="text-[11px] text-slate-500 font-mono">cloud ide</span>
            </div>
          </button>

          {/* Navigation */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <button
                onClick={() => onNavigate('/dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/dashboard'
                    ? isDark
                      ? 'bg-[#1b202c] text-white font-semibold'
                      : 'bg-slate-100 text-slate-900 font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-[#141720]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('/projects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/projects'
                    ? isDark
                      ? 'bg-[#1b202c] text-white font-semibold'
                      : 'bg-slate-100 text-slate-900 font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-[#141720]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FolderCode className="h-3.5 w-3.5" />
                <span>Projects</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    currentPath.startsWith('/admin')
                      ? 'bg-[#2a1b38] text-purple-300 font-semibold border border-purple-800/40'
                      : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-[#20142b]'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-500">Firestore</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-md border transition-colors ${
              isDark
                ? 'border-[#232733] bg-[#12151c] text-slate-300 hover:text-white hover:bg-[#1b202c]'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
          </button>

          {currentUser ? (
            <>
              {/* New Project CTA */}
              <button
                onClick={onOpenNewProject}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] text-xs font-semibold px-3 py-1.5 rounded-md transition-all active:scale-95 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>New Project</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 p-1 rounded-md transition-colors focus:outline-none border ${
                    isDark
                      ? 'border-[#232733] hover:bg-[#1b202c]'
                      : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded flex items-center justify-center text-xs font-bold overflow-hidden ${
                      isDark ? 'bg-[#232733] text-slate-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>{profile?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span
                    className={`hidden md:inline text-xs font-mono max-w-[90px] truncate ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    @{profile?.username || 'user'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div
                      className={`absolute right-0 mt-2 w-52 rounded-lg border p-1.5 shadow-2xl z-50 text-xs ${
                        isDark ? 'border-[#2a3040] bg-[#12151c]' : 'border-slate-200 bg-white shadow-slate-300'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 border-b mb-1 ${
                          isDark ? 'border-[#232733]' : 'border-slate-100'
                        }`}
                      >
                        <div
                          className={`font-semibold truncate ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {profile?.fullName || 'User'}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] truncate">@{profile?.username}</div>
                      </div>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          if (profile?.username) onNavigate(`/@${profile.username}`);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-left ${
                          isDark ? 'text-slate-300 hover:bg-[#1b202c]' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>Public Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('/settings');
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-left ${
                          isDark ? 'text-slate-300 hover:bg-[#1b202c]' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('/admin');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-purple-400 hover:bg-purple-950/20 rounded transition-colors text-left"
                        >
                          <Shield className="h-3.5 w-3.5 text-purple-400" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <div className={`my-1 border-t ${isDark ? 'border-[#232733]' : 'border-slate-100'}`} />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-950/20 rounded transition-colors text-left"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-[#141720]' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/signup')}
                className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] text-xs font-semibold px-3 py-1.5 rounded transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
