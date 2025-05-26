import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle, MailCheck, Loader2 } from "lucide-react";
import Card, { CardContent } from "../components/common/Card";
import Button from "../components/common/Button";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WelcomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        // Check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user) {
          setUserEmail(user.email || "");
          
          // Check if email is verified
          if (user.email_confirmed_at) {
            setEmailVerified(true);
          } else {
            setError("Email not yet verified. Please check your inbox.");
          }
        } else {
          setError("No authenticated user found. Please try signing in.");
        }
      } catch (err) {
        console.error("Error checking verification:", err);
        setError("Error verifying your email. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkEmailVerification();
  }, []);

  const handleContinue = () => {
    // Redirect to the application completion page
    navigate("/membership/complete");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="text-center p-8">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="text-center p-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4 mx-auto">
              <MailCheck className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Issue</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          {emailVerified ? (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to EACNA!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for verifying your email <span className="font-semibold">{userEmail}</span>.
                You're now ready to complete your membership application.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleContinue}
                  className="w-full"
                >
                  Complete Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4 mx-auto">
                <MailCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
              <p className="text-gray-600 mb-4">
                We've sent a confirmation email to <span className="font-semibold">{userEmail}</span>.
                Please click the verification link in that email to continue.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={async () => {
                    await supabase.auth.resend({
                      type: 'signup',
                      email: userEmail,
                    });
                    alert("Confirmation email resent!");
                  }}
                  className="w-full"
                >
                  Resend Confirmation Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Already Verified? Login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;