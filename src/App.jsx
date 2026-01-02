import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserDashboard from './pages/UserDashboard';

// Main App Component with Router
const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Navigation handlers
  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleAuthenticatedAction = (action) => {
    // Execute authenticated actions (e.g., create mock server)
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onLoginClick={handleLoginClick}
            onSignUpClick={handleSignUpClick}
            isAuthenticated={isAuthenticated}
            user={user}
            onAuthenticatedAction={handleAuthenticatedAction}
          />
        }
      />
      <Route
        path="/login"
        element={
          <Login
            onSignUpClick={handleSignUpClick}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/signup"
        element={
          <SignUp
            onLoginClick={handleLoginClick}
            onSignUpSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <UserDashboard
            user={user}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
