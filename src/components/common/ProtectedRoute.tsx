import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        if (adminOnly) {
          // Check both metadata sources for admin role
          const isAdmin = (
            user.user_metadata?.role === 'admin' || 
            user.app_metadata?.role === 'admin'
          );
          
          if (!isAdmin) {
            setAuthorized(false);
          } else {
            setAuthorized(true);
          }
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [adminOnly, location]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!authorized) {
    return <Navigate 
      to={adminOnly ? "/admin-login" : "/login"} 
      state={{ from: location }} 
      replace 
    />;
  }

  return <Outlet />;
}