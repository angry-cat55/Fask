import React, { useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <StrictMode>
      {currentPage === 'signup' ? (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      ) : (
        <LoginPage onNavigateToSignup={() => setCurrentPage('signup')} />
      )}
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<App />);
