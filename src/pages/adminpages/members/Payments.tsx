import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Eye,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { getEmailTemplateHTML } from "../../../components/common/EmailTemplate";
import emailjs from "@emailjs/browser";
import AlertModal from "../../../components/common/AlertModal";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: "mpesa" | "bank_transfer" | "credit_card" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  member_id: string | null;
  application_id: string | null;
  renewal_id: string | null;
  member_name: string;
  member_email: string;
  payment_type: "application" | "renewal" | "upgrade" | "other";
  membership_type: string;
  new_tier: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "failed" | "refunded"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "application" | "renewal" | "upgrade"
  >("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "ascending" | "descending";
  } | null>({ key: "created_at", direction: "descending" });
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("payment_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPayments((data as Payment[]) || []);
      setFilteredPayments((data as Payment[]) || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setNotification({
        type: "error",
        message: "Failed to load payments. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...payments];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.transaction_id.toLowerCase().includes(lowercasedSearch) ||
          payment.member_name.toLowerCase().includes(lowercasedSearch) ||
          payment.member_email.toLowerCase().includes(lowercasedSearch) ||
          payment.amount.toString().includes(lowercasedSearch)
      );
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (
          aValue === undefined ||
          aValue === null ||
          bValue === undefined ||
          bValue === null
        ) {
          return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPayments(result);
  }, [payments, searchTerm, sortConfig]);

  const requestSort = (key: keyof Payment) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Payment) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const viewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewOpen(true);
  };

  const updatePaymentStatus = async (
    id: string,
    status: "completed" | "failed" | "refunded"
  ) => {
    setAlert({
      open: true,
      title: "Confirm Action",
      message: `Are you sure you want to mark this payment as ${status}?`,
      type: "confirm",
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: async () => {
        setAlert({ ...alert, open: false });
        setIsProcessing(true);
        try {
          const { error } = await supabase
            .from("payments")
            .update({
              status,
              verified_at: new Date().toISOString(),
              verified_by: (await supabase.auth.getUser()).data.user?.id,
            })
            .eq("id", id);

          if (error) throw error;

          // Send confirmation email if status is completed
          if (status === "completed") {
            const { data } = await supabase
              .from("payments")
              .select("*")
              .eq("id", id)
              .single();

            if (data) {
              await sendPaymentConfirmationEmail(data as Payment);
            }
          }

          await fetchPayments();
          setNotification({
            type: "success",
            message: `Payment marked as ${status} successfully!`,
          });
          setIsViewOpen(false);
        } catch (error) {
          console.error(`Error updating payment status:`, error);
          setNotification({
            type: "error",
            message: `Failed to update payment status. Please try again.`,
          });
        } finally {
          setIsProcessing(false);
        }
      },
      onCancel: () => setAlert({ ...alert, open: false }),
    });
  };

  const exportPayments = async () => {
    try {
      // Create CSV content
      const headers = [
        "Transaction ID",
        "Member",
        "Email",
        "Amount",
        "Type",
        "Method",
        "Status",
        "Date",
        "Verified",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredPayments.map(
          (payment) =>
            `"${payment.transaction_id}","${payment.member_name}","${
              payment.member_email
            }",${payment.amount},"${payment.payment_type}","${
              payment.payment_method
            }","${payment.status}","${formatDate(payment.created_at)}","${
              payment.verified_at
                ? formatDate(payment.verified_at)
                : "Not verified"
            }"`
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `eacna-payments-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Payments exported successfully!",
      });
    } catch (error) {
      console.error("Error exporting payments:", error);
      setNotification({
        type: "error",
        message: "Failed to export payments. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getMethodIcon = (method: string) => {
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

  const sendPaymentConfirmationEmail = async (payment: Payment) => {
    try {
      if (
        !import.meta.env.VITE_EMAILJS_SERVICE_ID ||
        !import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
        !import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ) {
        console.error("EmailJS configuration is missing");
        return false;
      }

      const templateParams = {
        from_name: "EACNA Payments",
        reply_to: "no-reply@eacna.org",
        to_name: payment.member_name,
        to_email: payment.member_email,
        subject: "Your Payment Has Been Verified",
        message: getPaymentConfirmationTemplate(payment),
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      return true;
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
      return false;
    }
  };

  const getPaymentConfirmationTemplate = (payment: Payment) => {
    const content = `
      <p>We're pleased to inform you that your payment has been successfully verified by our team.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-weight: bold; width: 150px;">Transaction ID:</span>
          <span>${payment.transaction_id}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-weight: bold; width: 150px;">Amount:</span>
          <span>${payment.currency} ${payment.amount.toLocaleString()}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-weight: bold; width: 150px;">Payment Method:</span>
          <span>${payment.payment_method.replace("_", " ")}</span>
        </div>
        <div style="display: flex;">
          <span style="font-weight: bold; width: 150px;">Payment Date:</span>
          <span>${new Date(payment.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <p>You can now enjoy all the benefits of your EACNA membership. If you have any questions, please don't hesitate to contact us.</p>
    `;

    return getEmailTemplateHTML({
      title: "Payment Confirmation",
      recipientName: payment.member_name,
      content: content,
      type: "payment",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and export button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Records</h1>
          <p className="text-gray-500 mt-1">
            {payments.length} total payments (
            {payments.filter((p) => p.status === "pending").length} pending
            verification)
          </p>
        </div>
        <Button onClick={exportPayments} className="flex items-center">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Notification display */}
      {notification && (
        <div
          className={`p-4 rounded-md flex items-start justify-between ${
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

      {/* Main card with filters and table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="application">Application</option>
                <option value="renewal">Renewal</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table headers */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("member_name")}
                  >
                    <div className="flex items-center">
                      <span>Member</span>
                      {getSortIcon("member_name")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("amount")}
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {getSortIcon("amount")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("payment_type")}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {getSortIcon("payment_type")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("payment_method")}
                  >
                    <div className="flex items-center">
                      <span>Method</span>
                      {getSortIcon("payment_method")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("created_at")}
                  >
                    <div className="flex items-center">
                      <span>Date</span>
                      {getSortIcon("created_at")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.member_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.member_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {payment.payment_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.payment_method)}
                        <span className="ml-2 text-sm text-gray-500 capitalize">
                          {payment.payment_method.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewPayment(payment)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Payment"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {payment.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updatePaymentStatus(payment.id, "completed")
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Completed"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                updatePaymentStatus(payment.id, "failed")
                              }
                              className="text-red-600 hover:text-red-800"
                              title="Mark as Failed"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
              <p className="text-gray-500">
                No payments match your search criteria.
              </p>
            ) : (
              <p className="text-gray-500">No payments found.</p>
            )}
          </div>
        )}
      </Card>

      {/* Payment View Modal */}
      {isViewOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Member Information
                  </h4>
                  <p className="font-medium text-gray-900">
                    {selectedPayment.member_name}
                  </p>
                  <p className="text-gray-600">
                    {selectedPayment.member_email}
                  </p>

                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Membership Type</p>
                    <p className="font-medium capitalize">
                      {selectedPayment.payment_type === "upgrade" &&
                      selectedPayment.new_tier
                        ? selectedPayment.new_tier
                        : selectedPayment.membership_type}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium">
                        {selectedPayment.currency}{" "}
                        {selectedPayment.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium capitalize">
                        {selectedPayment.payment_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Method</p>
                      <p className="font-medium capitalize">
                        {selectedPayment.payment_method.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          selectedPayment.status
                        )}`}
                      >
                        {selectedPayment.status.charAt(0).toUpperCase() +
                          selectedPayment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Transaction Dates
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="text-sm">
                        {formatDate(selectedPayment.created_at)}
                      </p>
                    </div>
                    {selectedPayment.verified_at && (
                      <div>
                        <p className="text-xs text-gray-500">
                          Verification Date
                        </p>
                        <p className="text-sm">
                          {formatDate(selectedPayment.verified_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Related Records
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Transaction ID</p>
                      <p className="text-sm font-mono font-semibold text-primary-600">
                        {selectedPayment.transaction_id}
                      </p>
                    </div>
                    {selectedPayment.renewal_id && (
                      <div>
                        <p className="text-xs text-gray-500">Renewal ID</p>
                        <p className="text-sm font-mono">
                          {selectedPayment.renewal_id}
                        </p>
                      </div>
                    )}
                    {selectedPayment.member_id && (
                      <div>
                        <p className="text-xs text-gray-500">Member ID</p>
                        <p className="text-sm font-mono">
                          {selectedPayment.member_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                {selectedPayment.status === "pending" && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updatePaymentStatus(selectedPayment.id, "failed")
                      }
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Mark as Failed
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() =>
                        updatePaymentStatus(selectedPayment.id, "completed")
                      }
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Verify Payment
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AlertModal for confirmations */}
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
}