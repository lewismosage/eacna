import { useState } from "react";
import {
  Search,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { MembershipTier, membershipTiers } from "../../types/membership";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Mock payment methods
const paymentMethods = [
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank transfer to our account",
    instructions: [
      "Bank: Kenya Commercial Bank",
      "Account Name: EACNA",
      "Account Number: 1234567890",
      "Branch: Nairobi CBD",
      "Swift Code: KCBKENYA",
    ],
  },
  {
    id: "mobile",
    name: "Mobile Money",
    description: "Pay via M-Pesa or other mobile money",
    instructions: [
      "Go to M-Pesa on your phone",
      'Select "Lipa na M-Pesa"',
      'Select "Pay Bill"',
      "Enter Business Number: 123456",
      "Enter Account Number: EACNA[YourID]",
      "Enter the amount",
      "Enter your PIN and confirm",
    ],
  },
  {
    id: "online",
    name: "Credit/Debit Card",
    description: "Pay via credit/debit card",
    instructions: [
      "You will be redirected to a secure payment gateway",
      "Enter your card details",
      "Complete the payment",
    ],
  },
];

interface PaymentModalProps {
  onClose: () => void;
}

interface MemberData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  membership_tier: MembershipTier;
  membership_id: string;
  status: string;
  expiry_date: string;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  // Search state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Member data from search
  const [memberData, setMemberData] = useState<MemberData | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // UI state
  const [step, setStep] = useState(1); // 1: search, 2: payment, 3: success
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate at least one field is filled
    if (!firstName && !lastName && !phone && !email) {
      setSearchError("Please fill at least one search field");
      return;
    }
  
    setSearchLoading(true);
    setSearchError("");
  
    try {
      // Clean search terms
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();
      const cleanPhone = phone.trim();
      const cleanEmail = email.trim();
  
      // Start building the query
      let query = supabase
        .from("membership_applications")
        .select("*");
  
      // Add conditions for each provided field
      if (cleanFirstName) {
        query = query.ilike("first_name", `%${cleanFirstName}%`);
      }
      if (cleanLastName) {
        query = query.ilike("last_name", `%${cleanLastName}%`);
      }
      if (cleanPhone) {
        query = query.ilike("phone", `%${cleanPhone}%`);
      }
      if (cleanEmail) {
        query = query.ilike("email", `%${cleanEmail}%`);
      }
  
      // Execute the query
      const { data, error } = await query;
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        // Find the best match - prioritize exact matches
        let bestMatch = data[0];
  
        if (cleanFirstName || cleanLastName) {
          const exactMatch = data.find(
            (app) =>
              (cleanFirstName &&
                app.first_name?.toLowerCase() === cleanFirstName.toLowerCase()) ||
              (cleanLastName &&
                app.last_name?.toLowerCase() === cleanLastName.toLowerCase())
          );
  
          if (exactMatch) {
            bestMatch = exactMatch;
          }
        }
  
        const application = bestMatch;
  
        // Check if application is approved
        if (application.application_status === "approved") {
          // Validate membership tier exists and is valid
          if (!application.membership_tier) {
            throw new Error("Membership tier is missing from application");
          }
  
          // Check if the tier exists in our membershipTiers
          if (!membershipTiers[application.membership_tier as MembershipTier]) {
            throw new Error(`Invalid membership tier: ${application.membership_tier}`);
          }
  
          setMemberData({
            id: application.id,
            user_id: application.user_id,
            first_name: application.first_name,
            last_name: application.last_name,
            phone: application.phone,
            email: application.email,
            membership_tier: application.membership_tier as MembershipTier,
            status: application.application_status,
            membership_id: application.membership_id,
            expiry_date: application.expiry_date,
          });
          setStep(2); // Move to payment step
        } else {
          // Application exists but not approved
          setSearchError(
            "Your application is pending approval. Once approved, you will be able to continue with payment. Please check your email for updates."
          );
        }
      } else {
        // No application found at all
        setSearchError(
          "No matching membership application found. Please check your information or submit a new application."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error instanceof Error
          ? error.message
          : "An error occurred during search. Please try again."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberData) return;

    setSubmitLoading(true);
    setSubmitStatus("");

    try {
      // Validate inputs
      if (!paymentMethod) throw new Error("Please select a payment method");
      if (!transactionId || transactionId.length < 8) {
        throw new Error("Please enter a valid transaction ID");
      }

      // Get the tier details
      const tier = membershipTiers[memberData.membership_tier];
      if (!tier) {
        throw new Error("Invalid membership tier");
      }

      // Map frontend payment method to database values
      const paymentMethodMap = {
        bank: "bank_transfer",
        mobile: "mpesa",
        online: "credit_card",
      };

      const dbPaymentMethod = paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap] || "other";

      // Submit payment
      const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: memberData.user_id,
        transaction_id: transactionId,
        amount: tier.price,
        currency: "KES",
        payment_method: dbPaymentMethod,
        status: "pending",
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        payment_type: "application",
        membership_id: memberData.membership_id,
        membership_tier: memberData.membership_tier,
        notes: "Payment submitted through member portal",
      })
      .select()
      .single();

      if (paymentError) throw paymentError;

      setSubmitStatus("success");
      setStep(3);
    } catch (error) {
      console.error("Payment processing error:", error);
      setSubmitStatus(
        error instanceof Error ? error.message : "Payment processing failed"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderSearchStep = () => (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Find Your Application
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your details to find your approved membership application.
      </p>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 0712345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{searchError}</span>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={searchLoading}
          >
            {searchLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                Search Application
                <Search className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentStep = () => {
    if (!memberData) return null;

    const tier = membershipTiers[memberData.membership_tier];
    if (!tier) {
      return (
        <div className="bg-white rounded-lg p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Invalid membership tier configuration</span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Application Details
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                Change <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">
                  {memberData.first_name} {memberData.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{memberData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membership Tier</p>
                <p className="font-medium">{tier.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer ${
                        paymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {paymentMethod && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Payment Instructions
                    </h3>
                    <ol className="list-decimal pl-5 space-y-1 text-blue-700">
                      {paymentMethods
                        .find((m) => m.id === paymentMethod)
                        ?.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter transaction ID"
                      required
                    />
                  </div>
                </>
              )}

              {submitStatus && (
                <div
                  className={`p-3 rounded-md ${
                    submitStatus === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {submitStatus === "success"
                    ? "Payment submitted successfully!"
                    : submitStatus}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={submitLoading || !paymentMethod || !transactionId}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Payment Summary
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Membership Tier</span>
                <span>{tier.name}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span>KES {tier.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium text-gray-800 mb-2">
                Membership Benefits
              </h4>
              <ul className="space-y-2">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
    if (!memberData) return null;

    const tier = membershipTiers[memberData.membership_tier];
    if (!tier) {
      return (
        <div className="bg-white rounded-lg p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Invalid membership tier configuration</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Submitted Successfully
        </h2>

        <p className="text-gray-600 mb-6">
          Your payment for {tier.name} membership has been received and is being
          processed. You'll receive a confirmation email once approved.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-medium text-gray-800 mb-2">
            Transaction Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Name:</div>
            <div>
              {memberData.first_name} {memberData.last_name}
            </div>
            <div className="text-gray-500">Membership:</div>
            <div>{tier.name}</div>
            <div className="text-gray-500">Amount:</div>
            <div>KES {tier.price.toLocaleString()}</div>
            <div className="text-gray-500">Transaction ID:</div>
            <div>{transactionId}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Membership Payment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === 1 && renderSearchStep()}
          {step === 2 && renderPaymentStep()}
          {step === 3 && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}