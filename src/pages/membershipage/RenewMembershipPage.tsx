import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  RefreshCw,
  ArrowUpRight,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { MembershipTier, membershipTiers } from "../../types/membership";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePayment } from "../../components/protectedroute/StripePayment";

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

// Add payment methods array
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

export default function MembershipRenewalPage() {
  // Member data state
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(
    "Associate Membership"
  );
  const [originalTier, setOriginalTier] = useState<MembershipTier>(
    "Associate Membership"
  );
  const [transactionId, setTransactionId] = useState("");
  const [bankTransferDetails, setBankTransferDetails] = useState({
    reference: "",
    swiftReference: "",
    bankName: "",
    accountNumber: "",
  });

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [actionType, setActionType] = useState<"renew" | "upgrade">("renew");
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

  // Add payment method state variable
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
        setMembershipTier(member.membership_type as MembershipTier);
        setOriginalTier(member.membership_type as MembershipTier);
        setStep(2);
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

      // Calculate new expiry date (365 days from current expiry or from now if no expiry)
      const currentExpiry = memberData.expiry_date
        ? new Date(memberData.expiry_date)
        : new Date();
      const newExpiryDate = new Date(currentExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + 365);

      let paymentTransactionId = transactionId;
      if (paymentMethod === "bank") {
        paymentTransactionId = bankTransferDetails.reference;
      } else if (paymentMethod === "online") {
        paymentTransactionId = paymentIntentId || "";
      }

      // Calculate correct amount for upgrade or renewal
      const selectedTier =
        actionType === "renew" ? originalTier : membershipTier;
      const amount =
        actionType === "upgrade"
          ? membershipTiers[selectedTier].price -
            membershipTiers[originalTier].price
          : membershipTiers[selectedTier].price;

      // Create payment record with all required fields
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          transaction_id: paymentTransactionId,
          amount: amount,
          currency: "KES",
          payment_method: dbPaymentMethod, // mapped from frontend
          status: "pending",
          user_id: memberData.user_id,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          email: memberData.email,

          payment_type: actionType === "renew" ? "renewal" : "upgrade",
          membership_tier: membershipTier,
          membership_id: memberData.membership_id, // Existing ID for renewals
          previous_tier: actionType === "upgrade" ? originalTier : null,
          expiry_date: newExpiryDate.toISOString(),
          // Add bank transfer details if applicable
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
        setStep(4);
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
      {[1, 2, 3, 4].map((s) => (
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
          {s < 4 && (
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

  const renderPlanSelectionStep = () => {
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
      <div className="space-y-6">
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
              <p className="text-sm text-gray-500">Current Membership</p>
              <p className="font-medium">{originalTier}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Action
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Renewal Card */}
            <div
              className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                actionType === "renew"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActionType("renew")}
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Renew Current Membership
                </h3>
              </div>

              <p className="text-gray-600 mb-3">
                Keep your {originalTier} membership active for another year.
              </p>

              <p className="font-semibold text-lg text-gray-800">
                KES {membershipTiers[originalTier].price.toLocaleString()}
              </p>
            </div>

            {/* Upgrade Card */}
            <div
              className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                actionType === "upgrade"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActionType("upgrade")}
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Upgrade Membership</h3>
              </div>

              <p className="text-gray-600 mb-3">
                Upgrade to a higher tier for additional benefits.
              </p>

              {actionType === "upgrade" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Tier
                  </label>
                  <select
                    value={membershipTier}
                    onChange={(e) =>
                      setMembershipTier(e.target.value as MembershipTier)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a tier</option>
                    {Object.entries(membershipTiers)
                      .filter(([tier, tierData]) => {
                        const currentTierRank =
                          membershipTiers[originalTier].rank;
                        return tierData.rank > currentTierRank;
                      })
                      .map(([tier, tierData]) => (
                        <option key={tier} value={tier}>
                          {tier} - KES {tierData.price.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                if (actionType === "renew") {
                  setMembershipTier(originalTier);
                  setStep(3);
                } else if (
                  actionType === "upgrade" &&
                  membershipTier &&
                  membershipTier !== originalTier
                ) {
                  setStep(3);
                } else if (actionType === "upgrade") {
                  setSearchError("Please select a new membership tier");
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Continue to Payment
            </button>
          </div>
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

    const selectedTier = actionType === "renew" ? originalTier : membershipTier;
    // Calculate upgrade fee if upgrading, otherwise use full price
    const price =
      actionType === "upgrade"
        ? membershipTiers[selectedTier].price -
          membershipTiers[originalTier].price
        : membershipTiers[selectedTier].price;

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

                  {/* Standard Transaction/Payment ID input for mobile and online */}
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

                  {/* Credit Card Inputs */}
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

                  {/* Bank Transfer Inputs */}
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
                  onClick={() => setStep(2)}
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
                <span className="text-gray-600">{selectedTier}</span>
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
                Selected Plan Benefits
              </h4>
              <ul className="space-y-2">
                {membershipTiers[selectedTier].features.map(
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
        Your {actionType === "renew" ? "renewal" : "upgrade"} request has been
        received and is now being processed. You will receive a confirmation
        once the payment has been verified.
      </p>

      {memberData && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-medium text-gray-800 mb-2">
            Transaction Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Membership Type:</div>
            <div>{membershipTier}</div>
            <div className="text-gray-500">Amount Paid:</div>
            <div>
              KES{" "}
              {(actionType === "upgrade"
                ? membershipTiers[membershipTier].price -
                  membershipTiers[originalTier].price
                : membershipTiers[membershipTier].price
              ).toLocaleString()}
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
        HOME
      </button>
    </div>
  );

  const LockIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6667 7.33333H3.33333C2.59695 7.33333 2 7.93028 2 8.66666V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V8.66666C14 7.93028 13.403 7.33333 12.6667 7.33333Z"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66663 7.33333V4.66666C4.66663 3.78261 5.01782 2.93476 5.64294 2.30964C6.26806 1.68452 7.11591 1.33333 7.99996 1.33333C8.88401 1.33333 9.73186 1.68452 10.357 2.30964C10.9821 2.93476 11.3333 3.78261 11.3333 4.66666V7.33333"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
            Renew or Upgrade Your EACNA Membership
          </h1>

          <p className="text-lg max-w-2xl mb-8 text-white/90">
            Continue your professional journey with EACNA by renewing your
            membership or upgrading to access additional benefits and
            opportunities.
          </p>

          {!memberData && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white text-primary-800 font-medium rounded-md hover:bg-gray-100 shadow-md flex items-center transition-all"
            >
              Find My Membership Record
              <Search className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {memberData && renderStepIndicator()}

        <div className="mt-6">
          {step === 2 && renderPlanSelectionStep()}
          {step === 3 && renderPaymentStep()}
          {step === 4 && renderSuccessStep()}
        </div>
      </div>

      {/* Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                  Find Your Membership Record
                </h3>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={searchQuery.firstName}
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          firstName: e.target.value,
                        })
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={searchQuery.lastName}
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          lastName: e.target.value,
                        })
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={searchQuery.phone}
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          phone: e.target.value,
                        })
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g. 0712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={searchQuery.email}
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          email: e.target.value,
                        })
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You need to fill at least one field
                    </p>
                  </div>

                  {searchError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span>{searchError}</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:ml-3 sm:w-auto"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    "Find Record"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
