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
  const [currentPage, setCurrentPage] = useState(() =>
    localStorage.getItem('user') ? 'workspace' : 'login'
  );

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
    return <WorkspacePage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
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
