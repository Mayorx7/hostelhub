import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'student' | 'admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: Role;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf7f4]">
        <svg className="h-8 w-8 animate-spin text-[#5C2200]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    const userRole: Role = (user.user_metadata?.role as Role) ?? 'student';
    if (userRole !== allowedRole) {
      // Redirect to the correct dashboard for their role
      return <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
    }
  }

  return <>{children}</>;
}
