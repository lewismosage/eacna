import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}