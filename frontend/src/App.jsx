import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FindIdPage from './pages/FindIdPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {currentPage === 'signup' ? (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : currentPage === 'find-id' ? (
        <FindIdPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : (
        <LoginPage
          onNavigateToSignup={() => setCurrentPage('signup')}
          onNavigateToFindId={() => setCurrentPage('find-id')}
        />
      )}
    </>
  );
}

export default App;
