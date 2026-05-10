import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {currentPage === 'signup' ? (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : (
        <LoginPage onNavigateToSignup={() => setCurrentPage('signup')} />
      )}
    </>
  );
}

export default App;
