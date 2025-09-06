import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle,
  Loader2,
  BadgeCheck,
  CreditCard,
  Banknote,
  Landmark,
} from "lucide-react";
import { membershipTiers, MembershipTier } from "../../types/membership";
import { createClient } from "@supabase/supabase-js";
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

type MembershipUpgradeProps = {
  currentMembership: {
    type: string;
    membershipId: string;
    expiryDate: string;
  };
  onClose: () => void;
  selectedTierFromStatus?: MembershipTier;
};

interface MemberDetails {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

type PaymentMethod = "mpesa" | "bank_transfer" | "credit_card";

const MembershipUpgrade = ({
  currentMembership,
  onClose,
  selectedTierFromStatus,
}: MembershipUpgradeProps) => {
  // Payment process state
  const [step, setStep] = useState(selectedTierFromStatus ? 2 : 1);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(
    selectedTierFromStatus || null
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [upgradeFee, setUpgradeFee] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(
    null
  );
  const [bankTransferDetails, setBankTransferDetails] = useState({
    reference: "",
    swiftReference: "",
    bankName: "",
    accountNumber: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Get current membership tier
  const currentTier = currentMembership.type as MembershipTier;
  const currentTierData = membershipTiers[currentTier];

  // Filter available tiers based on current membership rank
  const availableTiers = (
    Object.keys(membershipTiers) as MembershipTier[]
  ).filter((tier) => {
    const tierData = membershipTiers[tier];
    // Only show higher ranked AND higher priced tiers (except Honorary)
    return (
      tierData.rank > currentTierData.rank &&
      tierData.price > currentTierData.price &&
      tier !== "Honorary Membership"
    );
  });

  // If we have a preselected tier from status page, filter to just that tier
  const displayTiers = selectedTierFromStatus
    ? availableTiers.filter((tier) => tier === selectedTierFromStatus)
    : availableTiers;

  // Effect to calculate fee when tier is selected
  useEffect(() => {
    if (selectedTier) {
      const fee = membershipTiers[selectedTier].price - currentTierData.price;
      setUpgradeFee(fee);
    }
  }, [selectedTier, currentTierData.price]);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (currentMembership.membershipId) {
        const { data, error } = await supabase
          .from("membership_directory")
          .select("user_id, first_name, last_name, email")
          .eq("membership_id", currentMembership.membershipId)
          .single();

        if (error) {
          console.error("Error fetching member details:", error);
          setSubmitStatus("Could not find member details. Please try again.");
        } else if (data) {
          setMemberDetails(data);
        }
      }
    };

    fetchMemberDetails();
  }, [currentMembership.membershipId]);

  // Calculate days remaining to expiry
  const calculateDaysRemaining = () => {
    const today = new Date();
    const expiryDate = new Date(currentMembership.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining();

  // Handle payment submission
  const handleSubmitPayment = async (
    e: React.FormEvent<HTMLFormElement> | Event,
    paymentIntentId?: string
  ) => {
    if (e && "preventDefault" in e) e.preventDefault();
    setSubmitLoading(true);
    setSubmitStatus("");

    if (!memberDetails) {
      setSubmitStatus("Could not find member details. Please try again.");
      setSubmitLoading(false);
      return;
    }

    if (!selectedTier) {
      setSubmitStatus("Please select a tier to upgrade to.");
      setSubmitLoading(false);
      return;
    }

    try {
      // Validate based on payment method
      if (
        selectedMethod === "mpesa" &&
        (!transactionId || transactionId.length < 8)
      ) {
        throw new Error("Please enter a valid M-Pesa transaction ID");
      }

      if (
        selectedMethod === "bank_transfer" &&
        (!bankTransferDetails.reference ||
          !bankTransferDetails.swiftReference ||
          !bankTransferDetails.bankName ||
          !bankTransferDetails.accountNumber)
      ) {
        throw new Error("Please provide all bank transfer details");
      }

      // StripePayment will provide paymentIntentId for credit_card
      if (selectedMethod === "credit_card") {
        paymentIntentId = paymentIntentId || "";
      }

      const dbPaymentMethod = selectedMethod || "other";

      let paymentTransactionId = transactionId;
      if (selectedMethod === "bank_transfer") {
        paymentTransactionId = bankTransferDetails.reference;
      } else if (selectedMethod === "credit_card") {
        paymentTransactionId = paymentIntentId || "";
      }

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          transaction_id: paymentTransactionId,
          amount: upgradeFee,
          currency: "KES",
          payment_method: dbPaymentMethod,
          status: "pending",
          user_id: memberDetails.user_id,
          first_name: memberDetails.first_name,
          last_name: memberDetails.last_name,
          email: memberDetails.email,
          payment_type: "upgrade",
          membership_tier: selectedTier,
          membership_id: currentMembership.membershipId,
          previous_tier: currentMembership.type,
          expiry_date: currentMembership.expiryDate,
          additional_info:
            selectedMethod === "bank_transfer"
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

      // Show success message after a brief delay
      setTimeout(() => {
        setStep(4); 
      }, 1000);
    } catch (error) {
      console.error("Error submitting payment:", error);
      setSubmitStatus(
        error instanceof Error
          ? error.message
          : "Error processing payment. Please try again."
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
              ? "text-primary-600"
              : "text-gray-300"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              s < step
                ? "border-green-500 bg-green-50"
                : s === step
                ? "border-primary-600 bg-primary-50"
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

  const renderSelectTierStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Upgrade Membership
      </h2>

      {/* Member Information Summary */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Current Membership
        </h3>
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
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="font-medium">{currentMembership.expiryDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="font-medium">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Select Tier */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Select Upgrade Tier</h4>
              <p className="text-sm text-gray-600">
                Choose a membership tier to upgrade to
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-3">
              Available Upgrade Options:
            </h5>

            <div className="space-y-4">
              {displayTiers.map((tier) => (
                <div
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`cursor-pointer border rounded-lg p-4 transition-all ${
                    selectedTier === tier
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h6 className="font-semibold text-gray-800">{tier}</h6>
                      <p className="text-sm text-gray-600 mt-1">
                        {membershipTiers[tier].description}
                      </p>

                      <h6 className="font-medium text-gray-700 mt-3 mb-2">
                        Features:
                      </h6>
                      <ul className="space-y-2">
                        {membershipTiers[tier].features.map(
                          (feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <CheckIcon />
                              <span>{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        KSH {membershipTiers[tier].price}
                      </div>
                      <div className="text-sm text-gray-500">per year</div>

                      {selectedTier === tier && (
                        <div className="mt-3 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Days Remaining */}
      <div
        className={`rounded-xl p-5 mb-6 flex items-center justify-between ${
          daysRemaining < 30
            ? "bg-yellow-50 border border-yellow-100"
            : "bg-green-50 border border-green-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock
            className={`w-6 h-6 ${
              daysRemaining < 30 ? "text-yellow-600" : "text-green-600"
            }`}
          />
          <div>
            <h3 className="font-medium">
              {daysRemaining} days remaining on current membership
            </h3>
            <p className="text-sm text-gray-600">
              Your membership will expire on {currentMembership.expiryDate}
            </p>
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
          className={`px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center ${
            !selectedTier ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!selectedTier}
        >
          Continue to Payment
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Select Payment Method
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* M-Pesa Option */}
        <button
          onClick={() => {
            setSelectedMethod("mpesa");
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === "mpesa"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200 hover:border-primary-300"
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
            setSelectedMethod("bank_transfer");
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === "bank_transfer"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200 hover:border-primary-300"
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
            setSelectedMethod("credit_card");
            setStep(3);
          }}
          className={`border rounded-lg p-4 hover:shadow-md transition-all ${
            selectedMethod === "credit_card"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200 hover:border-primary-300"
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
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Membership Upgrade Payment
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Payment Instructions
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                <li>Go to M-Pesa on your phone</li>
                <li>Select "Lipa na M-Pesa"</li>
                <li>Select "Pay Bill"</li>
                <li>
                  Enter Business Number:{" "}
                  <span className="font-semibold">123456</span>
                </li>
                <li>
                  Enter Account Number:{" "}
                  <span className="font-semibold">
                    EACNA-{currentMembership.membershipId.slice(-4)}
                  </span>
                </li>
                <li>Enter Amount: KSH {upgradeFee}</li>
                <li>Enter your M-Pesa PIN and confirm payment</li>
                <li>Enter the transaction ID below</li>
              </ol>
            </div>

            <div>
              <label
                htmlFor="transactionId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <p className="text-xs text-gray-500 mt-1">
                Enter the transaction ID from your M-Pesa confirmation message
              </p>
            </div>

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
          <OrderSummary
            currentMembership={currentMembership}
            selectedTier={selectedTier}
            upgradeFee={upgradeFee}
          />
        </div>
      </div>
    </div>
  );

  const renderBankTransferForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Bank Transfer Payment
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Payment Instructions
              </h3>
              <div className="space-y-3 text-blue-700">
                <div>
                  <h4 className="font-medium">Bank Details:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Bank Name:{" "}
                      <span className="font-semibold">Equity Bank</span>
                    </li>
                    <li>
                      Account Name:{" "}
                      <span className="font-semibold">EACNA Membership</span>
                    </li>
                    <li>
                      Account Number:{" "}
                      <span className="font-semibold">1234567890</span>
                    </li>
                    <li>
                      Branch: <span className="font-semibold">Nairobi CBD</span>
                    </li>
                    <li>
                      SWIFT Code:{" "}
                      <span className="font-semibold">EQBLKENA</span>
                    </li>
                  </ul>
                </div>
                <p>
                  Please include your membership ID (
                  <span className="font-semibold">
                    {currentMembership.membershipId}
                  </span>
                  ) in the reference.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. EACNA12345"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. SWIFTREF123"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. KCB"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Account you paid from"
                  required
                />
              </div>
            </div>

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
          <OrderSummary
            currentMembership={currentMembership}
            selectedTier={selectedTier}
            upgradeFee={upgradeFee}
          />
        </div>
      </div>
    </div>
  );

  const renderCreditCardForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-6">
        Credit Card Payment
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Stripe Elements for card payment */}
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: upgradeFee * 100,
              currency: "kes",
              paymentMethodCreation: "manual",
            }}
          >
            <StripePayment
              amount={upgradeFee}
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
        </div>

        <div className="md:col-span-1">
          <OrderSummary
            currentMembership={currentMembership}
            selectedTier={selectedTier}
            upgradeFee={upgradeFee}
          />
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
        Membership Upgrade Successfully Submitted
      </h2>

      <p className="text-gray-600 mb-6">
        Your membership upgrade request has been received and is now being
        processed. You will receive a confirmation once the payment has been
        verified.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
        <h3 className="font-medium text-gray-800 mb-2">Transaction Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Current Membership:</div>
          <div>{currentMembership.type}</div>
          <div className="text-gray-500">Upgraded To:</div>
          <div>{selectedTier}</div>
          <div className="text-gray-500">Amount Paid:</div>
          <div>KSH {upgradeFee}</div>
          <div className="text-gray-500">Payment Method:</div>
          <div className="capitalize">
            {selectedMethod?.replace("_", " ") || "Unknown"}
          </div>

          {/* Conditional Transaction Details */}
          {selectedMethod === "mpesa" && (
            <>
              <div className="text-gray-500">Transaction ID:</div>
              <div>{transactionId}</div>
            </>
          )}
          {selectedMethod === "bank_transfer" && (
            <>
              <div className="text-gray-500">Reference Number:</div>
              <div>{bankTransferDetails.reference}</div>
              <div className="text-gray-500">
                SWIFT Transaction Reference Number:
              </div>
              <div>{bankTransferDetails.swiftReference}</div>
            </>
          )}

          <div className="text-gray-500">Status:</div>
          <div className="text-orange-600 font-medium">
            Verification in Progress
          </div>
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

  // Helper component for check icons in benefits lists
  const CheckIcon = () => (
    <svg
      className="flex-shrink-0 mt-0.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.3332 4L5.99984 11.3333L2.6665 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Helper component for lock icon
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
    <div className="space-y-6">
      {renderStepIndicator()}

      {step === 1 && renderSelectTierStep()}
      {step === 2 && renderPaymentMethodStep()}
      {step === 3 && selectedMethod === "mpesa" && renderMpesaPaymentForm()}
      {step === 3 &&
        selectedMethod === "bank_transfer" &&
        renderBankTransferForm()}
      {step === 3 && selectedMethod === "credit_card" && renderCreditCardForm()}
      {step === 4 && renderSuccessStep()}
    </div>
  );
};

// Helper component for order summary
const OrderSummary = ({
  currentMembership,
  selectedTier,
  upgradeFee,
}: {
  currentMembership: {
    type: string;
    membershipId: string;
    expiryDate: string;
  };
  selectedTier: MembershipTier | null;
  upgradeFee: number;
}) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
    <h3 className="font-semibold text-gray-800 mb-3">Upgrade Summary</h3>

    <div className="space-y-3 mb-4">
      <div>
        <span className="text-gray-600">Current Membership:</span>
        <div className="font-medium">{currentMembership.type}</div>
      </div>

      <div>
        <span className="text-gray-600">Upgrading to:</span>
        <div className="font-medium">{selectedTier}</div>
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
        <span>Total upgrade fee</span>
        <span>KSH {upgradeFee}</span>
      </div>
    </div>

    <div className="border-t border-gray-200 pt-4 mt-4">
      <h4 className="font-medium text-gray-800 mb-2">Membership Period</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Current Expiry: {currentMembership.expiryDate}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Your upgraded membership will maintain the same expiry date. For
          future renewals, you'll pay the full rate for your new membership
          tier.
        </p>
      </div>
    </div>
  </div>
);

export default MembershipUpgrade;
