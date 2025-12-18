import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        setIsAuthenticated(true);
        setIsAdmin(true);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthCheck;

