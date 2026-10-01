import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CreateProjectModal } from './components/CreateProjectModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { EditorPage } from './pages/EditorPage';
import { SharedProjectPage } from './pages/SharedProjectPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route protection
  const isPublicRoute = (path: string) => {
    if (path === '/' || path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/terms' || path === '/privacy') {
      return true;
    }
    if (path.startsWith('/shared/')) return true;
    if (path.startsWith('/@')) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center text-white font-bold">
            CF
          </div>
          <span>Initializing CodeForge session...</span>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users from protected routes
  if (!currentUser && !isPublicRoute(currentPath)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar
          currentPath="/login"
          onNavigate={navigate}
          onOpenNewProject={() => navigate('/login')}
        />
        <main className="flex-1">
          <LoginPage onNavigate={navigate} />
        </main>
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  // Parse dynamic routes
  const renderRoute = () => {
    // Shared route: /shared/:shareId
    if (currentPath.startsWith('/shared/')) {
      const shareId = currentPath.replace('/shared/', '');
      return <SharedProjectPage shareId={shareId} onNavigate={navigate} />;
    }

    // Editor route: /editor/:projectId
    if (currentPath.startsWith('/editor/')) {
      const projectId = currentPath.replace('/editor/', '');
      return <EditorPage projectId={projectId} onNavigate={navigate} />;
    }

    // Public Profile route: /@username
    if (currentPath.startsWith('/@')) {
      const username = currentPath.replace('/@', '');
      return <ProfilePage usernameParam={username} onNavigate={navigate} />;
    }

    // Settings routes: /settings, /settings/profile, /settings/security, /settings/editor, /settings/privacy
    if (currentPath.startsWith('/settings')) {
      let tab = 'profile';
      if (currentPath.includes('/security')) tab = 'security';
      else if (currentPath.includes('/editor') || currentPath.includes('/preferences')) tab = 'editor';
      else if (currentPath.includes('/privacy')) tab = 'privacy';
      else if (currentPath.includes('/account')) tab = 'account';
      return <SettingsPage initialTab={tab} onNavigate={navigate} />;
    }

    // Admin route
    if (currentPath.startsWith('/admin')) {
      return <AdminPage onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <LandingPage onNavigate={navigate} onOpenNewProject={() => setIsCreateModalOpen(true)} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/signup':
        return <SignupPage onNavigate={navigate} />;
      case '/forgot-password':
      case '/reset-password':
        return <ForgotPasswordPage onNavigate={navigate} />;
      case '/verify-email':
        return <VerifyEmailPage onNavigate={navigate} />;
      case '/dashboard':
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenNewProject={() => setIsCreateModalOpen(true)}
          />
        );
      case '/projects':
        return (
          <ProjectsPage
            onNavigate={navigate}
            onOpenNewProject={() => setIsCreateModalOpen(true)}
          />
        );
      case '/terms':
        return <TermsPage onNavigate={navigate} />;
      case '/privacy':
        return <PrivacyPage onNavigate={navigate} />;
      default:
        // Fallback: If logged in, go to dashboard, else landing
        if (currentUser) {
          return (
            <DashboardPage
              onNavigate={navigate}
              onOpenNewProject={() => setIsCreateModalOpen(true)}
            />
          );
        }
        return <LandingPage onNavigate={navigate} onOpenNewProject={() => setIsCreateModalOpen(true)} />;
    }
  };

  const isEditorMode = currentPath.startsWith('/editor/') || currentPath.startsWith('/shared/');

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? 'bg-[#0c0d12] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenNewProject={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {renderRoute()}
      </main>

      {!isEditorMode && <Footer onNavigate={navigate} />}

      {/* Global New Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={(projectId) => navigate(`/editor/${projectId}`)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
