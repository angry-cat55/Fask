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
    // 새로고침: sessionStorage에 저장된 페이지 복원
    const session = sessionStorage.getItem('currentPage');
    if (session) return session;
    // 창 새로 열기: localStorage에 user가 있으면 워크스페이스 목록으로
    try {
      return localStorage.getItem('user') ? 'workspace-landing' : 'login';
    } catch {
      return 'login';
    }
  });

  const navigateTo = (page) => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigateTo('workspace-landing');
    alert(`${userData.nickname}님 환영합니다!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('currentPage');
    setUser(null);
    setCurrentPage('login');
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleSwitchWorkspace = (workspaceId, workspaceName) => {
    const updated = { ...user, workspaceId, ...(workspaceName ? { workspaceName } : {}) };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const handleLeaveWorkspace = () => {
    const { workspaceId, ...rest } = user ?? {};
    localStorage.setItem('user', JSON.stringify(rest));
    setUser(rest);
    navigateTo('workspace-landing');
  };

  if (currentPage === 'workspace-landing') {
    const enterWorkspace = (workspaceId, workspaceName) => {
      const updated = { ...user, workspaceId, ...(workspaceName ? { workspaceName } : {}) };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      navigateTo('workspace');
    };

    return (
      <ErrorBoundary>
        <WorkspaceLanding
          user={user}
          onLogout={handleLogout}
          onEnterWorkspace={enterWorkspace}
          onUserUpdate={handleUserUpdate}
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
        <SignupPage onNavigateToLogin={() => navigateTo('login')} />
      ) : currentPage === 'find-id' ? (
        <FindIdPage onNavigateToLogin={() => navigateTo('login')} />
      ) : currentPage === 'reset-password' ? (
        <ResetPasswordPage onNavigateToLogin={() => navigateTo('login')} />
      ) : (
        <LoginPage
          onNavigateToSignup={() => navigateTo('signup')}
          onNavigateToFindId={() => navigateTo('find-id')}
          onNavigateToResetPassword={() => navigateTo('reset-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

export default App;
