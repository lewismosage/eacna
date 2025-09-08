import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, Check, AlertCircle,ChevronLeft, MessageSquareX } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


const LoadingSpinner = () => (
  <div className="animate-spin h-5 w-5">
    <LoadingSpinner />
  </div>
);

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already-unsubscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      validateEmail(emailParam);
    }
  }, [searchParams]);

  const validateEmail = async (emailToValidate: string) => {
    setIsLoading(true);
    try {
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('id, email, is_active')
        .eq('email', emailToValidate)
        .maybeSingle();

      if (error) throw error;

      if (!subscriber) {
        setErrorMessage('This email is not subscribed to our newsletters.');
        setStatus('error');
        return;
      }

      if (subscriber.is_active === false) {
        setStatus('already-unsubscribed');
        return;
      }
    } catch (err) {
      console.error('Error validating email:', err);
      setErrorMessage('An error occurred. Please try again later.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email) {
    setErrorMessage('Please enter your email address');
    setStatus('error');
    return;
  }

  setIsLoading(true);
  setStatus('loading');

  try {
    const { data: subscriber, error: lookupError } = await supabase
      .from('subscribers')
      .select('id, email, name, is_active')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!subscriber) {
      setErrorMessage('This email is not subscribed to our newsletters.');
      setStatus('error');
      return;
    }

    if (subscriber.is_active === false) {
      setStatus('already-unsubscribed');
      return;
    }

    
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email)
      .select(); 

    if (updateError) throw updateError;

    setStatus('success');
  } catch (err) {
    console.error('Error unsubscribing:', err);
    setErrorMessage('Failed to unsubscribe. Please try again later.');
    setStatus('error');
  } finally {
    setIsLoading(false);
  }
};

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          is_active: true,
          unsubscribed_at: null
        })
        .eq('email', email);

      if (error) throw error;

      setStatus('idle');
    } catch (err) {
      console.error('Error resubscribing:', err);
      setErrorMessage('Failed to resubscribe. Please try again later.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleUnsubscribe} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optional: Help us improve
        </label>
        <select 
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Why are you unsubscribing?</option>
          <option value="too-many">Too many emails</option>
          <option value="not-relevant">Content not relevant to me</option>
          <option value="never-signed-up">I never signed up for these emails</option>
          <option value="other">Other reason</option>
        </select>
      </div>

      {status === 'error' && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full relative inline-flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white shadow-sm transition-all duration-200 ease-in-out ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isLoading ? (
          <>
            <span className="mr-2"><LoadingSpinner /></span>
            Processing...
          </>
        ) : (
          <>Unsubscribe</>
        )}
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        This will unsubscribe you from all email communications and newsletters.
      </p>
    </form>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-green-100 p-4 mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Unsubscribe Successful</h3>
      <p className="text-gray-600 mb-8 max-w-md">
        You have been removed from our mailing list and will no longer receive emails from us.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 w-full">
        <h4 className="font-medium text-gray-900 mb-2">Changed your mind?</h4>
        <p className="text-gray-600 mb-4">
          You can resubscribe anytime or manage your preferences from your account settings.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleResubscribe}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resubscribe
          </button>
          <Link
            to="/"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );

  const renderAlreadyUnsubscribed = () => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-blue-100 p-4 mb-6">
        <MessageSquareX className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Already Unsubscribed</h3>
      <p className="text-gray-600 mb-8 max-w-md">
        This email address is already unsubscribed from our mailing lists. You won't receive any more emails from us.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 w-full">
        <h4 className="font-medium text-gray-900 mb-2">Changed your mind?</h4>
        <p className="text-gray-600 mb-4">
          You can resubscribe anytime to start receiving our communications again.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleResubscribe}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resubscribe
          </button>
          <Link
            to="/"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header with logo */}
      <header className="py-4 px-6 md:px-8 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Back to website</span>
          </Link>
          <div className="font-semibold text-gray-800">EACNA</div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header section with gradient background */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-16 px-8">
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              {status === 'success' && (
                <>
                  <h1 className="mt-4 text-2xl font-bold text-white text-center">
                    Successfully Unsubscribed
                  </h1>
                  <p className="text-blue-100 text-center mt-2 max-w-md mx-auto">
                    You won't receive any more emails from us.
                  </p>
                </>
              )}
              {status === 'already-unsubscribed' && (
                <>
                  <h1 className="mt-4 text-2xl font-bold text-white text-center">
                    Email Management
                  </h1>
                  <p className="text-blue-100 text-center mt-2 max-w-md mx-auto">
                    This email is already unsubscribed from our communications.
                  </p>
                </>
              )}
              {(status === 'idle' || status === 'loading' || status === 'error') && (
                <>
                  <h1 className="text-2xl font-bold text-white text-center">
                    Unsubscribe
                  </h1>

                  <p className="mt-2 text-indigo-100">
                    We're sorry to see you go. Please confirm your email address to unsubscribe.
                  </p>
                </>
              )}
            </div>
            {/* Wave decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
                <path fill="white" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
                <path fill="white" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39 116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
                <path fill="white" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
              </svg>
            </div>
          </div>
          
          {/* Form content */}
          <div className="px-8 py-10 -mt-6 bg-white rounded-t-3xl relative">
            {status === 'success' && renderSuccess()}
            {status === 'already-unsubscribed' && renderAlreadyUnsubscribed()}
            {(status === 'idle' || status === 'loading' || status === 'error') && renderForm()}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100">
            <div className="max-w-lg mx-auto">
              <p className="text-xs text-center text-gray-500">
                &copy; {new Date().getFullYear()} EACNA. All rights reserved.
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="privacy-policy" className="text-xs text-gray-500 hover:text-gray-700">Privacy Policy</a>
                <span className="text-gray-300">|</span>
                <a href="terms-of-service" className="text-xs text-gray-500 hover:text-gray-700">Terms of Service</a>
                <span className="text-gray-300">|</span>
                <a href="cookie-policy" className="text-xs text-gray-500 hover:text-gray-700">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}