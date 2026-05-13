import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FindIdPage from './pages/FindIdPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('workspace');
    alert(`${userData.nickname}님 환영합니다!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

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
