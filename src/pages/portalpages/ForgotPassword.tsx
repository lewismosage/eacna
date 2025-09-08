import { useState, FormEvent, useEffect } from 'react'; // Added useEffect import
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Card, { CardContent } from '../../components/common/Card';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for rate limiting
  const [timeLeft, setTimeLeft] = useState(rateLimitTime * 60);
  
  useEffect(() => {
    if (rateLimited && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setRateLimited(false);
    }
  }, [rateLimited, timeLeft]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        
        // Handle specific error cases
        if (resetError.message.includes('email')) {
          throw new Error('No account found with this email address');
        } else if (resetError.message.includes('rate limit')) {
          // Set rate limit state and calculate wait time
          setRateLimited(true);
          setRateLimitTime(60); // 60 minutes wait
          setTimeLeft(60 * 60); // Convert to seconds
          throw new Error('Too many attempts. Please try again in about an hour.');
        } else {
          throw resetError;
        }
      }

      setSuccess(true);
      setRateLimited(false);
    } catch (err) {
      console.error('Error in password reset:', err);
      setError(
        err instanceof Error 
          ? err.message
          : 'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
                {rateLimited && timeLeft > 0 && (
                  <p className="text-sm text-red-700 mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time remaining: {formatTime(timeLeft)}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {success ? (
            <div className="space-y-6">
              <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Password reset link sent!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Check your email for instructions. If you don't see it, check your spam folder.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={rateLimited && timeLeft > 0}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || (rateLimited && timeLeft > 0)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : rateLimited && timeLeft > 0 ? (
                    `Try again in ${formatTime(timeLeft)}`
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
              
              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="font-medium text-primary-700 hover:text-primary-600"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;