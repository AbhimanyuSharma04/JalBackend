import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // This checks if the user's token exists in local storage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // If no token, redirect them to the login page
        return <Navigate to="/login" />;
    }

    // If there is a token, show the component they were trying to access
    return children;
};

export default ProtectedRoute;