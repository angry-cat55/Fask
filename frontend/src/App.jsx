import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FindIdPage from './pages/FindIdPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import WorkspaceLanding from './pages/WorkspaceLanding.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved) return 'login';
      const u = JSON.parse(saved);
      return u?.workspaceId ? 'workspace' : 'workspace-landing';
    } catch {
      return 'login';
    }
  });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setCurrentPage('workspace-landing');
    alert(`${userData.nickname}님 환영합니다!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleSwitchWorkspace = (workspaceId) => {
    const updated = { ...user, workspaceId };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const handleLeaveWorkspace = () => {
    const { workspaceId, ...rest } = user ?? {};
    localStorage.setItem('user', JSON.stringify(rest));
    setUser(rest);
    setCurrentPage('workspace-landing');
  };

  if (currentPage === 'workspace-landing') {
    const enterWorkspace = (workspaceId) => {
      setUser((u) => ({ ...u, workspaceId }));
      setCurrentPage('workspace');
    };

    return (
      <ErrorBoundary>
        <WorkspaceLanding
          user={user}
          onLogout={handleLogout}
          onEnterWorkspace={enterWorkspace}
        />
      </ErrorBoundary>
    );
  }

  if (currentPage === 'workspace') {
    return <WorkspacePage key={user?.workspaceId} user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} onLeaveWorkspace={handleLeaveWorkspace} onSwitchWorkspace={handleSwitchWorkspace} />;
  }

  return (
    <>
      {currentPage === 'signup' ? (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : currentPage === 'find-id' ? (
        <FindIdPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : currentPage === 'reset-password' ? (
        <ResetPasswordPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : (
        <LoginPage
          onNavigateToSignup={() => setCurrentPage('signup')}
          onNavigateToFindId={() => setCurrentPage('find-id')}
          onNavigateToResetPassword={() => setCurrentPage('reset-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

export default App;
