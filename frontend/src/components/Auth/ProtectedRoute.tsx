import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: { resource: string; action: string };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check specific permissions if required
  if (requiredPermission) {
    if (requiredPermission.resource === 'users' || requiredPermission.resource === 'settings') {
      if (!user?.is_admin) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">
              <div className="text-lg mb-2">Access Denied</div>
              <div className="text-sm">You don't have permission to access this page</div>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
