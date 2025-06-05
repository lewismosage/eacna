import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Auth error or user not found:", authError);
          setAuthorized(false);
          setLoading(false);
          return;
        }

        if (adminOnly) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            setAuthorized(false);
          } else {
            const isAdmin = profile?.role === "admin";
            setAuthorized(isAdmin);
          }
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        checkAuth();
      } else if (event === "SIGNED_OUT") {
        setAuthorized(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [adminOnly, location]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authorized) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
