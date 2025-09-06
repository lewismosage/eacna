import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePayment } from "../../components/protectedroute/StripePayment";
import { MembershipTier, membershipTiers } from "../../types/membership";
import { MemberSearchModal } from "../../components/common/MemberSearchModal";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface MemberData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  membership_type: MembershipTier;
  membership_id: string;
  status: string;
  expiry_date: string;
  institution: string;
  nationality: string;
  country_of_residence: string;
  current_profession: string;
}

const paymentMethods = [
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank transfer to our account",
    instructions: [
      "Bank Name: Equity Bank",
      "Account Name: EACNA Membership",
      "Account Number: 1234567890",
      "Branch: Nairobi CBD",
      "SWIFT Code: EQBLKENA",
      "Please include your Membership ID in the transaction reference: [YourMembershipID]",
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
      "Enter your card details",
      "Complete the payment",
      "All transactions are secure and encrypted. We do not store your credit card details",
    ],
  },
];

export default function PaymentPage() {
  // Member data state
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [bankTransferDetails, setBankTransferDetails] = useState({
    reference: "",
    swiftReference: "",
    bankName: "",
    accountNumber: "",
  });

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [step, setStep] = useState(1);

  // Loading and error states
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Search form state
  const [searchQuery, setSearchQuery] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError("");

    // Validate at least one field is filled
    if (
      !searchQuery.firstName &&
      !searchQuery.lastName &&
      !searchQuery.phone &&
      !searchQuery.email
    ) {
      setSearchError("Please fill in at least one field");
      setSearchLoading(false);
      return;
    }

    try {
      let query = supabase.from("membership_directory").select("*");

      if (searchQuery.firstName)
        query = query.ilike("first_name", `%${searchQuery.firstName}%`);
      if (searchQuery.lastName)
        query = query.ilike("last_name", `%${searchQuery.lastName}%`);
      if (searchQuery.phone)
        query = query.ilike("phone", `%${searchQuery.phone}%`);
      if (searchQuery.email)
        query = query.ilike("email", `%${searchQuery.email}%`);

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const member = data[0];
        setMemberData(member);
        setStep(1);
        setIsModalOpen(false);
      } else {
        setSearchError("No matching membership record found");
      }
    } catch (error) {
      console.error("Error searching for member:", error);
      setSearchError("Error searching for member. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitPayment = async (
    e: React.FormEvent,
    paymentIntentId?: string
  ) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Validate transaction ID based on payment method
      if (paymentMethod === "bank") {
        if (
          !bankTransferDetails.reference ||
          !bankTransferDetails.swiftReference ||
          !bankTransferDetails.bankName ||
          !bankTransferDetails.accountNumber
        ) {
          throw new Error("Please provide all bank transfer details");
        }
      } else if (paymentMethod === "mobile") {
        if (!transactionId || transactionId.length < 8) {
          throw new Error("Please enter a valid transaction ID");
        }
      }

      if (!memberData) {
        throw new Error("Member data not found");
      }

      if (!paymentMethod) {
        throw new Error("Please select a payment method");
      }

      // Map frontend payment method to database values
      const paymentMethodMap = {
        bank: "bank_transfer",
        mobile: "mpesa",
        online: "credit_card",
      };

      const dbPaymentMethod =
        paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap] ||
        "other";

      let paymentTransactionId = transactionId;
      if (paymentMethod === "bank") {
        paymentTransactionId = bankTransferDetails.reference;
      } else if (paymentMethod === "online") {
        paymentTransactionId = paymentIntentId || "";
      }

      // Calculate amount based on membership type
      const amount = membershipTiers[memberData.membership_type].price;

      // Create payment record with all required fields
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          transaction_id: paymentTransactionId,
          amount: amount,
          currency: "KES",
          payment_method: dbPaymentMethod,
          status: "pending",
          user_id: memberData.user_id,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          email: memberData.email,
          payment_type: "application",
          membership_tier: memberData.membership_type,
          membership_id: memberData.membership_id,
          expiry_date: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          additional_info:
            paymentMethod === "bank"
              ? {
                  bankName: bankTransferDetails.bankName,
                  swiftReference: bankTransferDetails.swiftReference,
                  accountNumber: bankTransferDetails.accountNumber,
                }
              : null,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      if (!paymentData) throw new Error("Payment record not created");

      setSubmitStatus("PAYMENT VERIFICATION IN PROGRESS");
      setSubmitted(true);

      setTimeout(() => {
        setStep(3);
      }, 1000);
    } catch (error) {
      console.error("Error submitting payment:", error);
      setSubmitStatus(
        error instanceof Error ? error.message : "Payment processing failed"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex items-center ${
            s < step
              ? "text-green-500"
              : s === step
              ? "text-blue-600"
              : "text-gray-300"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              s < step
                ? "border-green-500 bg-green-50"
                : s === step
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-10 h-0.5 ${
                s < step ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMemberInfoStep = () => {
    if (!memberData) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Member Data Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            We couldn't find your membership record. Please try searching again.
          </p>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setStep(1);
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Search Again
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Member Information
          </h2>
          <button
            onClick={() => {
              setStep(1);
              setIsModalOpen(true);
            }}
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
            <p className="text-sm text-gray-500">Membership Type</p>
            <p className="font-medium">{memberData.membership_type}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setStep(2)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    if (!memberData) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Member Data Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            We couldn't find your membership record. Please try searching again.
          </p>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setStep(1);
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Search Again
          </button>
        </div>
      );
    }

    const price = membershipTiers[memberData.membership_type].price;

    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Payment Instructions
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                      {paymentMethods
                        .find((m) => m.id === paymentMethod)
                        ?.instructions.map((step, i) => {
                          if (step.includes("[YourID]")) {
                            return (
                              <li key={i}>
                                Enter Account Number:{" "}
                                <span className="font-semibold">
                                  EACNA-{memberData.membership_id.slice(-4)}
                                </span>
                              </li>
                            );
                          }
                          if (step.includes("[YourMembershipID]")) {
                            return (
                              <li key={i}>
                                Please include your Membership ID in the
                                transaction reference:{" "}
                                <span className="font-semibold">
                                  {memberData.membership_id}
                                </span>
                              </li>
                            );
                          }
                          return <li key={i}>{step}</li>;
                        })}
                    </ol>
                  </div>

                  {paymentMethod === "mobile" && (
                    <div>
                      <label
                        htmlFor="transactionId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Transaction ID
                      </label>
                      <input
                        id="transactionId"
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="Enter transaction ID"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the transaction ID from your confirmation
                      </p>
                    </div>
                  )}

                  {paymentMethod === "online" && (
                    <div className="pt-4">
                      <Elements
                        stripe={stripePromise}
                        options={{
                          mode: "payment",
                          amount: price * 100,
                          currency: "kes",
                          paymentMethodCreation: "manual",
                        }}
                      >
                        <StripePayment
                          amount={price}
                          currency="kes"
                          onSuccess={(paymentIntent) => {
                            setTransactionId(paymentIntent.id);
                            handleSubmitPayment(
                              new Event("submit") as any,
                              paymentIntent.id
                            );
                          }}
                          onError={(error) => setSubmitStatus(error)}
                        />
                      </Elements>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label
                          htmlFor="bankReference"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Reference Number
                        </label>
                        <input
                          id="bankReference"
                          type="text"
                          value={bankTransferDetails.reference}
                          onChange={(e) =>
                            setBankTransferDetails({
                              ...bankTransferDetails,
                              reference: e.target.value,
                            })
                          }
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                          placeholder="e.g., EACNA12345"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="swiftReference"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          SWIFT Transaction Reference Number
                        </label>
                        <input
                          id="swiftReference"
                          type="text"
                          value={bankTransferDetails.swiftReference}
                          onChange={(e) =>
                            setBankTransferDetails({
                              ...bankTransferDetails,
                              swiftReference: e.target.value,
                            })
                          }
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                          placeholder="e.g., SWIFTREF123"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bankName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Bank Name
                        </label>
                        <input
                          id="bankName"
                          type="text"
                          value={bankTransferDetails.bankName}
                          onChange={(e) =>
                            setBankTransferDetails({
                              ...bankTransferDetails,
                              bankName: e.target.value,
                            })
                          }
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                          placeholder="e.g., KCB"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="accountNumber"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Account Number
                        </label>
                        <input
                          id="accountNumber"
                          type="text"
                          value={bankTransferDetails.accountNumber}
                          onChange={(e) =>
                            setBankTransferDetails({
                              ...bankTransferDetails,
                              accountNumber: e.target.value,
                            })
                          }
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                          placeholder="Account you paid from"
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {submitStatus && (
                <div
                  className={`text-center p-3 rounded-md ${
                    submitStatus === "PAYMENT VERIFICATION IN PROGRESS"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center"
                  disabled={submitLoading || submitted || !paymentMethod}
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
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {memberData.membership_type}
                </span>
                <span className="font-medium">
                  KES {price.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>KES {price.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium text-gray-800 mb-2">
                Membership Benefits
              </h4>
              <ul className="space-y-2">
                {membershipTiers[memberData.membership_type].features.map(
                  (feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Payment Submitted Successfully
      </h2>

      <p className="text-gray-600 mb-6">
        Your payment request has been received and is now being processed. You
        will receive a confirmation once the payment has been verified.
      </p>

      {memberData && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-medium text-gray-800 mb-2">
            Transaction Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Membership Type:</div>
            <div>{memberData.membership_type}</div>
            <div className="text-gray-500">Amount Paid:</div>
            <div>
              KES{" "}
              {membershipTiers[
                memberData.membership_type
              ].price.toLocaleString()}
            </div>

            {/* Conditional Transaction Details */}
            {paymentMethod === "bank" ? (
              <>
                <div className="text-gray-500">Reference Number:</div>
                <div>{bankTransferDetails.reference}</div>
                <div className="text-gray-500">
                  SWIFT Transaction Reference Number:
                </div>
                <div>{bankTransferDetails.swiftReference}</div>
              </>
            ) : paymentMethod === "mobile" ? (
              <>
                <div className="text-gray-500">Transaction ID:</div>
                <div>{transactionId}</div>
              </>
            ) : null}

            <div className="text-gray-500">Status:</div>
            <div className="text-orange-600 font-medium">
              Verification in Progress
            </div>
          </div>
        </div>
      )}

      {memberData?.email && (
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email will be sent to {memberData.email} once payment
          has been approved. If you have any questions, please contact support.
        </p>
      )}

      <button
        onClick={() => (window.location.href = "/")}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Return to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative py-16 md:py-24">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl">
            Complete Your EACNA Membership Payment
          </h1>

          <p className="text-lg max-w-2xl mb-8 text-white/90">
            Finalize your membership application by completing the payment
            process.
          </p>

          {!memberData && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white text-primary-800 font-medium rounded-md hover:bg-gray-100 shadow-md flex items-center transition-all"
            >
              Find My Application
              <Search className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {memberData && renderStepIndicator()}

        <div className="mt-6">
          {step === 1 && renderMemberInfoStep()}
          {step === 2 && renderPaymentStep()}
          {step === 3 && renderSuccessStep()}
        </div>
      </div>

      {/* Search Modal */}
      <MemberSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={async (query) => {
          setSearchLoading(true);
          setSearchError("");
          try {
            // Your payment page search logic
            let search = supabase.from("membership_directory").select("*");
            if (query.firstName)
              search = search.ilike("first_name", `%${query.firstName}%`);
            if (query.lastName)
              search = search.ilike("last_name", `%${query.lastName}%`);
            if (query.phone) search = search.ilike("phone", `%${query.phone}%`);
            if (query.email) search = search.ilike("email", `%${query.email}%`);
            const { data, error } = await search;
            if (data && data.length > 0) {
              const member = data[0];
              setMemberData(member);
              setStep(1);
              setIsModalOpen(false);
            } else {
              setSearchError("No matching membership record found");
            }
          } catch (error) {
            setSearchError("Error searching for member. Please try again.");
          } finally {
            setSearchLoading(false);
          }
        }}
        title="Find Your Application"
        searchButtonText="Find Application"
        loading={searchLoading}
        error={searchError}
      />
    </div>
  );
}
