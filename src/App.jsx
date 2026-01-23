import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserDashboard from './pages/UserDashboard';
import ProjectDetails from './pages/ProjectDetails';
import EditAccount from './pages/EditAccount';
import Price from './pages/Price';
import Features from './pages/Features';
import Documentation from './pages/Documentation';
import { Navigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Component with Router
const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Load authentication state from localStorage on app start
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const handleAuthenticatedAction = (action) => {
    // Execute authenticated actions (e.g., create mock server)
    navigate('/dashboard');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    console.log("handleLogout function called");
    console.log("Current isAuthenticated:", isAuthenticated);
    console.log("Current user:", user);
    
    // Clear localStorage first
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    console.log("localStorage cleared");
    
    // Clear state
    setIsAuthenticated(false);
    setUser(null);
    console.log("State cleared, redirecting...");
    
    // Force navigation
    window.location.href = '/';
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage
              onLoginClick={handleLoginClick}
              onSignUpClick={handleSignUpClick}
              isAuthenticated={isAuthenticated}
              user={user}
              onAuthenticatedAction={handleAuthenticatedAction}
              onLogout={handleLogout}
            />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onSignUpClick={handleSignUpClick}
              onLoginSuccess={handleLoginSuccess}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignUp
              onLoginClick={handleLoginClick}
              onSignUpSuccess={handleLoginSuccess}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UserDashboard
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProjectDetails
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-account"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <EditAccount
              user={user}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <Price
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
            onLoginClick={handleLoginClick}
            onSignUpClick={handleSignUpClick}
          />
        }
      />
      <Route
        path="/features"
        element={
          <Features
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
            onLoginClick={handleLoginClick}
            onSignUpClick={handleSignUpClick}
            isPage={true}
          />
        }
      />
      <Route
        path="/docs"
        element={
          <Documentation 
            onLoginClick={handleLoginClick}
            onSignUpClick={handleSignUpClick}
            isAuthenticated={isAuthenticated}
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
