// components/admin/Payments.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  CreditCard,
  FileText,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import AlertModal from "../../../components/common/AlertModal";
import Card, { CardContent } from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import { format } from "date-fns";
import {
  MembershipTier,
  membershipTiers as tierData,
} from "../../../types/membership";

// Add this interface for Brevo response
interface BrevoResponse {
  messageId?: string;
  error?: string;
}

const sendEmailViaBrevo = async (
  recipientName: string,
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  senderName = "EACNA"
): Promise<BrevoResponse> => {
  try {
    const response = await fetch(
      "https://jajnicjmctsqgxcbgpmd.supabase.co/functions/v1/send-email",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          htmlContent: htmlContent,
          senderName: senderName,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Brevo API error:", error);
    throw error;
  }
};

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
type PaymentType = "application" | "renewal" | "upgrade" | "other";
type PaymentMethod = "mpesa" | "bank_transfer" | "credit_card" | "other";

interface Payment {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: "mpesa" | "bank_transfer" | "credit_card" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  payment_type: "application" | "renewal" | "upgrade" | "other";
  membership_tier: MembershipTier;
  membership_id?: string; // Optional for renewals/upgrades
  previous_tier?: MembershipTier | null; // Only for upgrades
  expiry_date?: string; // New field
  verified_at: string | null;
  notes?: string;
  created_at: string;
}

const membershipTierOptions = Object.keys(tierData) as MembershipTier[];

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<PaymentType | "all">("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "ascending" | "descending";
  }>({ key: "created_at", direction: "descending" });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    refunded: 0,
  });

  interface AlertState {
    open: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    customContent?: React.ReactNode;
  }

  const [alert, setAlert] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setPayments(data);

        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter((p) => p.status === "pending").length,
          completed: data.filter((p) => p.status === "completed").length,
          failed: data.filter((p) => p.status === "failed").length,
          refunded: data.filter((p) => p.status === "refunded").length,
        });
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setNotification({
        type: "error",
        message: "Failed to load payments. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...payments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_type === typeFilter
      );
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.membership_tier === tierFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.transaction_id.toLowerCase().includes(term) ||
          payment.first_name.toLowerCase().includes(term) ||
          payment.last_name.toLowerCase().includes(term) ||
          payment.email.toLowerCase().includes(term) ||
          payment.amount.toString().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, typeFilter, tierFilter, sortConfig]);

  const handleSort = (key: keyof Payment) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
    setAlert({
      open: true,
      title: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Are you sure you want to mark this payment as ${status}?`,
      type: "confirm",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // First get the payment details
          const { data: paymentData } = await supabase
            .from("payments")
            .select("*")
            .eq("id", id)
            .single();

          if (!paymentData) throw new Error("Payment not found");

          // Update payment status
          const { error } = await supabase
            .from("payments")
            .update({
              status,
              verified_at: new Date().toISOString(),
              expiry_date:
                status === "completed"
                  ? paymentData.expiry_date ||
                    new Date(
                      Date.now() + 365 * 24 * 60 * 60 * 1000
                    ).toISOString()
                  : paymentData.expiry_date,
            })
            .eq("id", id);

          if (error) throw error;

          // If this is an application payment and status is completed,
          // update the application status if needed
          if (status === "completed" && paymentData.application_id) {
            await supabase
              .from("membership_applications")
              .update({ application_status: "approved" })
              .eq("id", paymentData.application_id);
          }

          // Send confirmation email if status is completed
          if (status === "completed") {
            await sendPaymentConfirmationEmail(paymentData);
          }

          await fetchPayments();
          setNotification({
            type: "success",
            message: `Payment marked as ${status} successfully!`,
          });
          setSelectedPayment(null);
        } catch (err) {
          console.error("Error updating payment status:", err);
          setNotification({
            type: "error",
            message: "Failed to update payment status. Please try again.",
          });
        } finally {
          setIsProcessing(false);
          setAlert({ ...alert, open: false });
        }
      },
      onCancel: () => setAlert({ ...alert, open: false }),
    });
  };

  const sendPaymentConfirmationEmail = async (payment: Payment) => {
    try {
      const templateParams = {
        to_name: `${payment.first_name} ${payment.last_name}`,
        to_email: payment.email,
        subject: `Your EACNA ${payment.membership_tier} Payment Has Been Verified`,
        message: `
          <p>Dear ${payment.first_name},</p>
          <p>We're pleased to inform you that your payment has been successfully verified by our team.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <div style="display: flex; margin-bottom: 8px;">
              <span style="font-weight: bold; width: 180px;">Transaction ID:</span>
              <span>${payment.transaction_id}</span>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <span style="font-weight: bold; width: 180px;">Amount:</span>
              <span>${
                payment.currency
              } ${payment.amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <span style="font-weight: bold; width: 180px;">Membership Tier:</span>
              <span>${tierData[payment.membership_tier].name}</span>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <span style="font-weight: bold; width: 180px;">Payment Method:</span>
              <span>${payment.payment_method.replace("_", " ")}</span>
            </div>
            <div style="display: flex;">
              <span style="font-weight: bold; width: 180px;">Payment Date:</span>
              <span>${format(
                new Date(payment.created_at),
                "MMM dd, yyyy"
              )}</span>
            </div>
          </div>
          
          <p>Your ${payment.membership_tier.toLowerCase()} membership is now active. You can now enjoy all the benefits of your EACNA membership.</p>
          
          <p>If you have any questions, please don't hesitate to contact us at members@eacna.org.</p>
          
          <p>Best regards,<br/>The EACNA Team</p>
        `,
      };

      await sendEmailViaBrevo(
        templateParams.to_name,
        templateParams.to_email,
        templateParams.subject,
        templateParams.message
      );
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
    }
  };

  const handleExport = async () => {
    try {
      const headers = [
        "Transaction ID",
        "First Name",
        "Last Name",
        "Email",
        "Amount",
        "Currency",
        "Payment Type",
        "Payment Method",
        "Status",
        "Membership Tier",
        "Date",
        "Verified At",
      ].join(",");

      const csvRows = filteredPayments.map((payment) =>
        [
          payment.transaction_id,
          payment.first_name,
          payment.last_name,
          payment.email,
          payment.amount,
          payment.currency,
          payment.payment_type,
          payment.payment_method,
          payment.status,
          payment.membership_tier,
          format(new Date(payment.created_at), "yyyy-MM-dd"),
          payment.verified_at
            ? format(new Date(payment.verified_at), "yyyy-MM-dd")
            : "",
        ].join(",")
      );

      const csvContent = [headers, ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `eacna-payments-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Payments exported successfully!",
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      setNotification({
        type: "error",
        message: "Failed to export payments. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      case "refunded":
        return <Badge variant="info">Refunded</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "mpesa":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-indigo-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-800">Payment Records</h1>
        <Button onClick={handleExport} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Payments
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Loader2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Refunded</p>
                <p className="text-2xl font-bold">{stats.refunded}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-md flex items-start justify-between mb-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            )}
            <p>{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by transaction, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Filters:</span>
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as PaymentStatus | "all")
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as PaymentType | "all")
                }
              >
                <option value="all">All Types</option>
                <option value="application">Application</option>
                <option value="renewal">Renewal</option>
                <option value="upgrade">Upgrade</option>
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="all">All Tiers</option>
                {membershipTierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {filteredPayments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    No payments found matching your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("first_name")}
                        >
                          <div className="flex items-center">
                            Member
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Transaction ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("payment_type")}
                        >
                          <div className="flex items-center">
                            Type
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("payment_method")}
                        >
                          <div className="flex items-center">
                            Method
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("membership_tier")}
                        >
                          <div className="flex items-center">
                            Tier
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {payment.first_name} {payment.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {payment.transaction_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                            {payment.payment_type}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {getMethodIcon(payment.payment_method)}
                              <span className="ml-2 text-sm text-gray-500 capitalize">
                                {payment.payment_method.replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${
                                  tierData[payment.membership_tier].color
                                }20`,
                                color: tierData[payment.membership_tier].color,
                              }}
                            >
                              {payment.membership_tier}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <Button
                              variant="outline"
                              className="border border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-primary-800">
                Payment Details
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Member Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">
                          {selectedPayment.first_name}
                          {selectedPayment.last_name}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium break-all">
                          {selectedPayment.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Membership Tier</p>
                        <p className="font-medium">
                          {tierData[selectedPayment.membership_tier].name}
                          {selectedPayment.membership_tier ===
                            "Honorary Membership" && (
                            <span className="text-xs text-gray-500 ml-1">
                              (by invitation only)
                            </span>
                          )}
                        </p>
                      </div>
                      {selectedPayment.payment_type === "upgrade" &&
                        selectedPayment.previous_tier && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">
                                Previous Tier
                              </p>
                              <p className="font-medium">
                                {selectedPayment.previous_tier}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">New Tier</p>
                              <p className="font-medium">
                                {selectedPayment.membership_tier}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Transaction Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Transaction ID</p>
                        <p className="font-mono font-medium">
                          {selectedPayment.transaction_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium">
                          {selectedPayment.currency}{" "}
                          {selectedPayment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Type</p>
                        <p className="font-medium capitalize">
                          {selectedPayment.payment_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="font-medium capitalize">
                          {selectedPayment.payment_method.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedPayment.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Dates & Verification
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Payment Date</p>
                        <p className="font-medium">
                          {formatDate(selectedPayment.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Verified At</p>
                        <p className="font-medium">
                          {selectedPayment.verified_at
                            ? formatDate(selectedPayment.verified_at)
                            : "Not verified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expiry Date</p>
                        <p className="font-medium">
                          {selectedPayment.expiry_date
                            ? formatDate(selectedPayment.expiry_date)
                            : "No expiry date"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Notes
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        {selectedPayment.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  (window.location.href = `mailto:${selectedPayment.email}`)
                }
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Member
              </Button>

              {selectedPayment.status === "pending" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() =>
                      updatePaymentStatus(selectedPayment.id, "failed")
                    }
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Mark as Failed
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() =>
                      updatePaymentStatus(selectedPayment.id, "completed")
                    }
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Verify Payment
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.open}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </div>
  );
};

export default Payments;
