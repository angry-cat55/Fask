import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FindIdPage from './pages/FindIdPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import WorkspaceLanding from './pages/WorkspaceLanding.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('workspace-landing');
    alert(`${userData.nickname}님 환영합니다!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
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
    return <WorkspacePage user={user} onLogout={handleLogout} />;
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
