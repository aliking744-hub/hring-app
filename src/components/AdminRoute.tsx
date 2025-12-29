import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Hardcoded admin email for direct access
const ADMIN_EMAIL = 'ali_king744@yahoo.com';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!session || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Email doesn't match admin -> redirect to dashboard
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin email matches -> allow access
  return <>{children}</>;
};

export default AdminRoute;
