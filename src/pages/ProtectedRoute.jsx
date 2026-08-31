import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');
  const accessToken = localStorage.getItem('accessToken');

  if (!userData || !accessToken) {
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;