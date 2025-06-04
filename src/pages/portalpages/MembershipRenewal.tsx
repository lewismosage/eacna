import { useState } from 'react';
import { Clock, CreditCard, Calendar, ArrowRight, RefreshCw, CheckCircle, Loader2, AlertCircle, Banknote, Landmark } from 'lucide-react';

interface Membership {
  type: string;
  membershipId: string;
  expiryDate: string;
  renewalFee: number;
  benefits: string[];
}

interface MembershipRenewalProps {
  currentMembership: Membership; 
  onClose: () => void;
}

type PaymentMethod = 'mpesa' | 'bank_transfer' | 'credit_card';

const MembershipRenewal = ({ currentMembership, onClose }: MembershipRenewalProps) => {
  // Payment process state
  const [step, setStep] = useState(1); // 1: confirm details, 2: payment method, 3: payment form, 4: success
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [bankTransferDetails, setBankTransferDetails] = useState({
    reference: '',
    bankName: '',
    date: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const calculateDaysRemaining = () => {
    const today = new Date();
    const expiryDate = new Date(currentMembership.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  
  // Handle payment submission
  const handleSubmitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Validate based on payment method
      if (selectedMethod === 'mpesa' && (!transactionId || transactionId.length < 8)) {
        setSubmitStatus("Please enter a valid M-Pesa transaction ID");
        setSubmitLoading(false);
        return;
      }
      
      if (selectedMethod === 'bank_transfer' && (!bankTransferDetails.reference || !bankTransferDetails.date)) {
        setSubmitStatus("Please provide all bank transfer details");
        setSubmitLoading(false);
        return;
      }
      
      if (selectedMethod === 'credit_card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)) {
        setSubmitStatus("Please provide all credit card details");
        setSubmitLoading(false);
        return;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus("PAYMENT VERIFICATION IN PROGRESS");
      setSubmitted(true);
      
      // Show success message after a brief delay
      setTimeout(() => {
        setStep(4); // Move to success step
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
      {[1, 2, 3, 4].map((s) => (
        <div 
          key={s} 
          className={`flex items-center ${s < step ? 'text-green-500' : s === step ? 'text-primary-600' : 'text-gray-300'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            s < step ? 'border-green-500 bg-green-50' : 
            s === step ? 'border-primary-600 bg-primary-50' : 
            'border-gray-300 bg-gray-50'
          }`}>
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-10 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderConfirmDetailsStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">Confirm Membership Renewal</h2>
      
      {/* Member Information Summary */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Member Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Membership Type</p>
            <p className="font-medium">{currentMembership.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member ID</p>
            <p className="font-medium">{currentMembership.membershipId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Expiry Date</p>
            <p className="font-medium">{currentMembership.expiryDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">New Expiry Date</p>
            <p className="font-medium">
              {new Date(new Date(currentMembership.expiryDate).setFullYear(
                new Date(currentMembership.expiryDate).getFullYear() + 1
              )).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
      
      {/* Membership Details Card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow mb-6">
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Renew {currentMembership.type}</h4>
              <p className="text-sm text-gray-600">
                Extend your membership for another year
              </p>
            </div>
          </div>
          
          {/* Display current benefits */}
          <div className="mt-3 mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Membership Benefits:</h5>
            <ul className="space-y-2">
              {currentMembership.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="font-semibold">KSH {currentMembership.renewalFee}</span>
          </div>
        </div>
      </div>
      
      {/* Days Remaining */}
      <div className={`rounded-xl p-5 mb-6 flex items-center justify-between ${
        daysRemaining < 30 
          ? "bg-yellow-50 border border-yellow-100" 
          : "bg-green-50 border border-green-100"
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-6 h-6 ${
            daysRemaining < 30 ? "text-yellow-600" : "text-green-600"
          }`} />
          <div>
            <h3 className="font-medium">{daysRemaining} days remaining</h3>
            <p className="text-sm text-gray-600">Your membership will expire on {currentMembership.expiryDate}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
        >
          Continue to Payment
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">Select Payment Method</h2>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* M-Pesa Option */}
        <button
          onClick={() => {
            setSelectedMethod('mpesa');
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === 'mpesa' 
              ? 'border-primary-600 bg-primary-50' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">M-Pesa</h3>
              <p className="text-sm text-gray-600">Mobile Money Payment</p>
            </div>
          </div>
        </button>
        
        {/* Bank Transfer Option */}
        <button
          onClick={() => {
            setSelectedMethod('bank_transfer');
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === 'bank_transfer' 
              ? 'border-primary-600 bg-primary-50' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Landmark className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Bank Transfer</h3>
              <p className="text-sm text-gray-600">Direct Bank Deposit</p>
            </div>
          </div>
        </button>
        
        {/* Credit Card Option */}
        <button
          onClick={() => {
            setSelectedMethod('credit_card');
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === 'credit_card' 
              ? 'border-primary-600 bg-primary-50' 
              : 'border-gray-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Banknote className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Credit Card</h3>
              <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => selectedMethod && setStep(3)}
          disabled={!selectedMethod}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderMpesaPaymentForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">M-Pesa Payment</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Payment Instructions</h3>
              <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                <li>Go to M-Pesa on your phone</li>
                <li>Select "Lipa na M-Pesa"</li>
                <li>Select "Pay Bill"</li>
                <li>Enter Business Number: <span className="font-semibold">123456</span></li>
                <li>Enter Account Number: <span className="font-semibold">EACNA-{currentMembership.membershipId.slice(-4)}</span></li>
                <li>Enter Amount: KSH {currentMembership.renewalFee}</li>
                <li>Enter your M-Pesa PIN and confirm payment</li>
                <li>Enter the transaction ID below</li>
              </ol>
            </div>
            
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                M-Pesa Transaction ID
              </label>
              <input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g. QJI23R4TYH"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the transaction ID from your M-Pesa confirmation message</p>
            </div>
            
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
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
                disabled={submitLoading || submitted}
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
        </div>
        
        <div className="md:col-span-1">
          <OrderSummary currentMembership={currentMembership} />
        </div>
      </div>
    </div>
  );

  const renderBankTransferForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">Bank Transfer Payment</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Payment Instructions</h3>
              <div className="space-y-3 text-blue-700">
                <div>
                  <h4 className="font-medium">Bank Details:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Bank Name: <span className="font-semibold">Equity Bank</span></li>
                    <li>Account Name: <span className="font-semibold">EACNA Membership</span></li>
                    <li>Account Number: <span className="font-semibold">1234567890</span></li>
                    <li>Branch: <span className="font-semibold">Nairobi CBD</span></li>
                    <li>SWIFT Code: <span className="font-semibold">EQBLKENA</span></li>
                  </ul>
                </div>
                <p>Please include your membership ID (<span className="font-semibold">{currentMembership.membershipId}</span>) in the reference.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="bankReference" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Reference Number
                </label>
                <input
                  id="bankReference"
                  type="text"
                  value={bankTransferDetails.reference}
                  onChange={(e) => setBankTransferDetails({...bankTransferDetails, reference: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. EACNA12345"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Bank Name
                </label>
                <input
                  id="bankName"
                  type="text"
                  value={bankTransferDetails.bankName}
                  onChange={(e) => setBankTransferDetails({...bankTransferDetails, bankName: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. KCB"
                />
              </div>
              
              <div>
                <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Date
                </label>
                <input
                  id="transferDate"
                  type="date"
                  value={bankTransferDetails.date}
                  onChange={(e) => setBankTransferDetails({...bankTransferDetails, date: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
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
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
                disabled={submitLoading || submitted}
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
        </div>
        
        <div className="md:col-span-1">
          <OrderSummary currentMembership={currentMembership} />
        </div>
      </div>
    </div>
  );

  const renderCreditCardForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">Credit Card Payment</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Secure Payment</h3>
              <p className="text-blue-700">
                All transactions are secure and encrypted. We do not store your credit card details.
              </p>
            </div>
            
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                id="cardName"
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  id="cardExpiry"
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  id="cardCvv"
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="123"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LockIcon />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
            
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
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
                disabled={submitLoading || submitted}
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
                  "Pay KSH " + currentMembership.renewalFee
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="md:col-span-1">
          <OrderSummary currentMembership={currentMembership} />
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Renewal Payment Submitted Successfully
      </h2>
      
      <p className="text-gray-600 mb-6">
        Your membership renewal request has been received and is now being processed.
        You will receive a confirmation once the payment has been verified.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
        <h3 className="font-medium text-gray-800 mb-2">Transaction Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Membership Type:</div>
          <div>{currentMembership.type}</div>
          <div className="text-gray-500">Amount Paid:</div>
          <div>KSH {currentMembership.renewalFee}</div>
          <div className="text-gray-500">Payment Method:</div>
          <div className="capitalize">
            {selectedMethod?.replace('_', ' ') || 'Unknown'}
          </div>
          <div className="text-gray-500">Status:</div>
          <div className="text-orange-600 font-medium">Verification in Progress</div>
        </div>
      </div>
      
      <button 
        onClick={onClose}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Return to Membership Status
      </button>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {renderStepIndicator()}
      
      {step === 1 && renderConfirmDetailsStep()}
      {step === 2 && renderPaymentMethodStep()}
      {step === 3 && selectedMethod === 'mpesa' && renderMpesaPaymentForm()}
      {step === 3 && selectedMethod === 'bank_transfer' && renderBankTransferForm()}
      {step === 3 && selectedMethod === 'credit_card' && renderCreditCardForm()}
      {step === 4 && renderSuccessStep()}
    </div>
  );
};

// Helper component for order summary
const OrderSummary = ({ currentMembership }: { currentMembership: Membership }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
    <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
    
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{currentMembership.type} Renewal</span>
        <span className="font-medium">KSH {currentMembership.renewalFee}</span>
      </div>
      
      <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
        <span>Total</span>
        <span>KSH {currentMembership.renewalFee}</span>
      </div>
    </div>
    
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h4 className="font-medium text-gray-800 mb-2">Membership Period</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Current Expiry: {currentMembership.expiryDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>New Expiry: {new Date(new Date(currentMembership.expiryDate).setFullYear(
            new Date(currentMembership.expiryDate).getFullYear() + 1
          )).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  </div>
);

// Helper component for check icons in benefits lists
const CheckIcon = () => (
  <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Helper component for lock icon
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6667 7.33333H3.33333C2.59695 7.33333 2 7.93028 2 8.66666V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V8.66666C14 7.93028 13.403 7.33333 12.6667 7.33333Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.66663 7.33333V4.66666C4.66663 3.78261 5.01782 2.93476 5.64294 2.30964C6.26806 1.68452 7.11591 1.33333 7.99996 1.33333C8.88401 1.33333 9.73186 1.68452 10.357 2.30964C10.9821 2.93476 11.3333 3.78261 11.3333 4.66666V7.33333" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default MembershipRenewal;