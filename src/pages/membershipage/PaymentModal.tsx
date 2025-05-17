import { useState, useEffect } from 'react';
import { Search, ArrowRight, RefreshCw, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';

// Mock membership tiers data
const membershipTiers = {
  ordinary: {
    name: "Full Member",
    price: 15000,
    features: ["Full access to resources", "Voting rights", "Conference discounts", "Professional certification"]
  },
  associate: {
    name: "Associate Member",
    price: 10000,
    features: ["Limited resource access", "Community membership", "Event access", "Digital newsletter"]
  },
  student: {
    name: "Student Member",
    price: 5000,
    features: ["Basic resource access", "Student networking", "Mentorship opportunities", "Digital newsletter"]
  },
  institutional: {
    name: "Institutional Member",
    price: 50000,
    features: ["Multiple user accounts", "Resource sharing", "Organizational recognition", "Event hosting"]
  },
  honorary: {
    name: "Honorary Member",
    price: 0,
    features: ["Full membership benefits", "Special recognition", "Lifetime membership"]
  }
};

// Mock payment methods
const paymentMethods = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer to our account',
    instructions: [
      'Bank: Kenya Commercial Bank',
      'Account Name: EACNA',
      'Account Number: 1234567890',
      'Branch: Nairobi CBD',
      'Swift Code: KCBKENYA'
    ]
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    description: 'Pay via M-Pesa or other mobile money',
    instructions: [
      'Go to M-Pesa on your phone',
      'Select "Lipa na M-Pesa"',
      'Select "Pay Bill"',
      'Enter Business Number: 123456',
      'Enter Account Number: EACNA[YourID]',
      'Enter the amount',
      'Enter your PIN and confirm'
    ]
  },
  {
    id: 'online',
    name: 'Credit/Debit Card',
    description: 'Pay via credit/debit card',
    instructions: [
      'You will be redirected to a secure payment gateway',
      'Enter your card details',
      'Complete the payment'
    ]
  }
];

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  // User details state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  type MembershipTierKey = keyof typeof membershipTiers;
  const [membershipTier, setMembershipTier] = useState<MembershipTierKey>("ordinary");
  
  // UI state
  const [step, setStep] = useState(1); // 1: find record, 2: select payment method, 3: payment confirmation
  const [recordFound, setRecordFound] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  // Loading and error states
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setSearchError("");

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes - in production, this would be a real API call
      if (email || fullName || phoneNumber) {
        // Mock successful search
        setFullName(fullName || "John Doe");
        setPhoneNumber(phoneNumber || "0712345678");
        setEmail(email || "john.doe@example.com");
        setMembershipTier("ordinary");
        setRecordFound(true);
        setStep(2); // Move to payment method selection
      } else {
        setSearchError("Please enter at least one search field");
      }
    } catch (error) {
      console.error("Error searching for member:", error);
      setSearchError("Error searching for member. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Validate transaction ID
      if (!transactionId || transactionId.length < 8) {
        setSubmitStatus("Please enter a valid transaction ID");
        setSubmitLoading(false);
        return;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would update the database
      setSubmitStatus("PAYMENT VERIFICATION IN PROGRESS");
      setSubmitted(true);
      
      // Show success message after a brief delay
      setTimeout(() => {
        setStep(3); // Move to success step
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting payment:", error);
      setSubmitStatus("Error processing payment. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div 
          key={s} 
          className={`flex items-center ${s < step ? 'text-green-500' : s === step ? 'text-blue-600' : 'text-gray-300'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            s < step ? 'border-green-500 bg-green-50' : 
            s === step ? 'border-blue-600 bg-blue-50' : 
            'border-gray-300 bg-gray-50'
          }`}>
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-10 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFindRecordStep = () => (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Your Membership Record</h2>
      <p className="text-gray-600 mb-6">Enter your details below to find your membership record.</p>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="e.g. 0712345678"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="your.email@example.com"
          />
        </div>
        
        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{searchError}</span>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            disabled={searchLoading}
          >
            {searchLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                Search Records
                <Search className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentMethodStep = () => {
    const tier = membershipTiers[membershipTier];
    const price = tier.price;

    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Member Information</h2>
              <button 
                onClick={() => { setStep(1); setRecordFound(false); }}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                Change <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membership Type</p>
                <p className="font-medium">{tier.name}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Payment Method</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    paymentMethod === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                      {method.id === 'bank' && <RefreshCw className="h-5 w-5 text-blue-600" />}
                      {method.id === 'mobile' && <ArrowRight className="h-5 w-5 text-blue-600" />}
                      {method.id === 'online' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                    </div>
                    <h3 className="text-lg font-semibold">{method.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
            
            {paymentMethod && (
              <form onSubmit={handleSubmitPayment}>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">Payment Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                    {paymentMethods.find(m => m.id === paymentMethod)?.instructions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </div>
                
                {paymentMethod !== 'online' && (
                  <div className="mb-6">
                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      id="transactionId"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="e.g. QJI23R4TYH"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the transaction ID from your confirmation message</p>
                  </div>
                )}
                
                {submitStatus && (
                  <div className={`text-center p-3 rounded-md ${
                    submitStatus === "PAYMENT VERIFICATION IN PROGRESS" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {submitStatus}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    disabled={submitLoading || submitted || !paymentMethod || (paymentMethod !== 'online' && !transactionId)}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submitted
                      </>
                    ) : (
                      "Submit Payment"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{tier.name}</span>
                <span className="font-medium">KES {price.toLocaleString()}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>KES {price.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Membership Benefits</h4>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => {
    const tier = membershipTiers[membershipTier];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Submitted Successfully
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your payment request has been received and is now being processed.
          You will receive a confirmation once the payment has been verified.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-medium text-gray-800 mb-2">Transaction Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Membership Type:</div>
            <div>{tier.name}</div>
            <div className="text-gray-500">Amount Paid:</div>
            <div>KES {tier.price.toLocaleString()}</div>
            <div className="text-gray-500">Transaction ID:</div>
            <div>{transactionId}</div>
            <div className="text-gray-500">Status:</div>
            <div className="text-orange-600 font-medium">Verification in Progress</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to {email}. If you have any questions, please contact support.
        </p>
        
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          CLOSE
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-gray-50 rounded-lg w-full max-w-5xl mx-4 p-6 overflow-hidden shadow-xl transform transition-all">
          {/* Close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Complete Your Membership Payment</h2>
            <p className="text-gray-600 mt-2">Pay your membership fees to activate your account and access all benefits</p>
          </div>

          {/* Step indicator */}
          {renderStepIndicator()}

          {/* Content based on current step */}
          <div className="mt-6">
            {step === 1 && renderFindRecordStep()}
            {step === 2 && renderPaymentMethodStep()}
            {step === 3 && renderSuccessStep()}
          </div>
        </div>
      </div>
    </div>
  );
}