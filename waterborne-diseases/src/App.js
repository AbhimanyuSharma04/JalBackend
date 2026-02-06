import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard_copy'; // Your main app component
import ProtectedRoute from './ProtectedRoute';

// We will create LoginPage in the next step
// For now, we can create a placeholder
import LoginPage from './Components/LoginPage';

// LocationEnforcer removed as per user request

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the login page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* A protected route for your main dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect any other path to the login page by default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;