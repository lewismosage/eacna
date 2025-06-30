import { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

export const StripePayment = ({
  amount,
  currency = "kes",
  onSuccess,
  onError,
}: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) return;

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              currency: currency.toLowerCase(),
            }),
          }
        );

        const { clientSecret, error } = await response.json();
        if (error) throw new Error(error);
        setClientSecret(clientSecret);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize payment";
        setMessage(errorMessage);
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [stripe, amount, currency, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);
    setMessage(null);

    // First validate the card elements
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message || "Validation failed");
      setIsLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete`,
        },
        redirect: "if_required",
      });

      if (error) throw error;
      if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center pt-4">
        <Loader2 className="animate-spin mr-2" />
        Initializing payment...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <PaymentElement options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false
        }
      }} />
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-300"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" /> Processing...
          </span>
        ) : (
          `Pay ${currency.toUpperCase()} ${amount.toLocaleString()}`
        )}
      </button>
      {message && <div className="text-red-500 text-sm mt-2">{message}</div>}
    </form>
  );
};