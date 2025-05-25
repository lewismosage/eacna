// components/admin/Applications.tsx
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
} from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import { createClient } from "@supabase/supabase-js";
import { getEmailTemplateHTML } from "../../../components/common/EmailTemplate";
import emailjs from "@emailjs/browser";
import AlertModal from "../../../components/common/AlertModal";

// Initialize emailjs (add to your env variables)
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Application status types
type ApplicationStatus = "pending" | "approved" | "rejected";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Update your Application interface to match your database schema
interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  nationality: string;
  current_profession: string;
  institution: string;
  created_at: string;
  status: ApplicationStatus;
  // Add other fields from your table as needed
}

const Applications = () => {
  // State for applications data
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application | null;
    direction: "ascending" | "descending";
  }>({ key: "created_at", direction: "descending" });

  // State for selected application to view details
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [filterLoading, setFilterLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

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

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("membership_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setApplications(data);
          setFilteredApplications(data);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setNotification({
          type: "error",
          message: "Failed to load applications. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply filters and search
  useEffect(() => {
    const fetchFilteredApplications = async () => {
      setFilterLoading(true);
      try {
        let query = supabase.from("membership_applications").select("*");

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        if (membershipFilter !== "all") {
          query = query.eq("membership_type", membershipFilter);
        }

        if (searchTerm) {
          query = query.or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          console.error("Error fetching filtered applications:", error);
          setFilteredApplications([]);
        } else {
          setFilteredApplications(data || []);
        }
      } catch (err) {
        console.error("Error in fetchFilteredApplications:", err);
        setFilteredApplications([]);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilteredApplications();
  }, [applications, searchTerm, statusFilter, membershipFilter]);

  // Handle sorting column click
  const handleSort = (key: keyof Application) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  // Send approval email
  const sendApprovalEmail = async (application: Application) => {
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
        from_name: "EACNA Membership",
        reply_to: "no-reply@eacna.org",
        to_name: `${application.first_name} ${application.last_name}`,
        to_email: application.email,
        subject: "Your Membership Application Has Been Approved",
        message: getApprovalEmailTemplate(application),
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      return true;
    } catch (error) {
      console.error("Error sending approval email:", error);
      return false;
    }
  };

  // Generate approval email template
  const getApprovalEmailTemplate = (application: Application) => {
    const content = `
      <p>We're pleased to inform you that your membership application has been approved!</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-weight: bold; width: 150px;">Membership Type:</span>
          <span>${getMembershipLabel(application.membership_type)}</span>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-weight: bold; width: 150px;">Application Date:</span>
          <span>${formatDate(application.created_at)}</span>
        </div>
      </div>
      
      <p>To complete your membership registration, please proceed with the payment of your membership fees. You can make the payment through our secure payment portal.</p>
      
      <p>Once your payment is received and verified, you'll gain full access to all member benefits.</p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
    `;

    return getEmailTemplateHTML({
      title: "Application Approved",
      recipientName: `${application.first_name} ${application.last_name}`,
      content: content,
      type: "application",
    });
  };

  // Update handleStatusChange to update the database and send emails
  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    if (newStatus === "approved") {
      setAlert({
        open: true,
        title: "Approve Application",
        message: "Are you sure you want to approve this application? An approval email will be sent to the applicant.",
        type: "confirm",
        confirmText: "Yes, Approve",
        cancelText: "Cancel",
        onConfirm: async () => {
          setAlert({ ...alert, open: false });
          setIsProcessing(true);
          try {
            // Update status in database
            const { error } = await supabase
              .from("membership_applications")
              .update({ status: newStatus })
              .eq("id", id);

            if (error) throw error;

            // Get the updated application
            const { data } = await supabase
              .from("membership_applications")
              .select("*")
              .eq("id", id)
              .single();

            if (data) {
              // Update local state
              const updatedApplications = applications.map((app) =>
                app.id === id ? { ...app, status: newStatus } : app
              );

              setApplications(updatedApplications);

              if (selectedApplication && selectedApplication.id === id) {
                setSelectedApplication({
                  ...selectedApplication,
                  status: newStatus,
                });
              }

              // Send approval email
              await sendApprovalEmail(data as Application);

              setNotification({
                type: "success",
                message: "Application approved and confirmation email sent!",
              });
            }
          } catch (err) {
            console.error("Error updating application status:", err);
            setNotification({
              type: "error",
              message: "Failed to approve application. Please try again.",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    } else {
      // For rejections (no email needed)
      setAlert({
        open: true,
        title: "Reject Application",
        message: "Are you sure you want to reject this application?",
        type: "confirm",
        confirmText: "Yes, Reject",
        cancelText: "Cancel",
        onConfirm: async () => {
          setAlert({ ...alert, open: false });
          setIsProcessing(true);
          try {
            const { error } = await supabase
              .from("membership_applications")
              .update({ status: newStatus })
              .eq("id", id);

            if (error) throw error;

            // Update local state
            const updatedApplications = applications.map((app) =>
              app.id === id ? { ...app, status: newStatus } : app
            );

            setApplications(updatedApplications);

            if (selectedApplication && selectedApplication.id === id) {
              setSelectedApplication({
                ...selectedApplication,
                status: newStatus,
              });
            }

            setNotification({
              type: "success",
              message: "Application status updated successfully!",
            });
          } catch (err) {
            console.error("Error updating application status:", err);
            setNotification({
              type: "error",
              message: "Failed to update application status. Please try again.",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color class
  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Update the getMembershipLabel helper function to show "Full Member" for "ordinary"
  const getMembershipLabel = (type: string) => {
    if (type === "ordinary") return "Full Member";
    // Add more mappings if needed
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle export to CSV
  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("membership_applications")
        .select("*");

      if (error) throw error;

      if (data) {
        const headers = Object.keys(data[0]).join(",");
        const csvContent = [
          headers,
          ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "applications.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setNotification({
          type: "success",
          message: "Applications exported successfully!",
        });
      }
    } catch (err) {
      console.error("Error exporting data:", err);
      setNotification({
        type: "error",
        message: "Failed to export applications. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-800">
          Membership Applications
        </h1>
        <Button onClick={handleExport} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Notification display */}
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
            {/* Search box */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Filters:</span>
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ApplicationStatus | "all")
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
              >
                <option value="all">All Memberships</option>
                <option value="ordinary">Full Member</option>
                <option value="associate">Associate</option>
                <option value="student">Student</option>
                <option value="institutional">Institutional</option>
                <option value="honorary">Honorary</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {filteredApplications.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    No applications found matching your filters.
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
                          onClick={() => handleSort("last_name")}
                        >
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("membership_type")}
                        >
                          <div className="flex items-center">
                            Membership Type
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Profession
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("created_at")}
                        >
                          <div className="flex items-center">
                            Submitted On
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
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {application.first_name} {application.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 capitalize">
                              {getMembershipLabel(application.membership_type)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {application.current_profession}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.institution}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(application.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                application.status
                              )}`}
                            >
                              {application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              {application.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        application.id,
                                        "approved"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Check className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        application.id,
                                        "rejected"
                                      )
                                    }
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <X className="h-5 w-5" />
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-primary-800">
                Application Details
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Personal Information
                </h4>
                <p className="font-semibold text-lg">
                  {selectedApplication.first_name}{" "}
                  {selectedApplication.last_name}
                </p>
                <p className="text-gray-600">
                  Email: {selectedApplication.email}
                </p>
                <p className="text-gray-600">
                  Phone: {selectedApplication.phone}
                </p>
                <p className="text-gray-600">
                  Nationality:{" "}
                  <span className="capitalize">
                    {selectedApplication.nationality}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Application Details
                </h4>
                <p className="text-gray-600">
                  Membership Type:{" "}
                  <span className="capitalize">
                    {getMembershipLabel(selectedApplication.membership_type)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Submitted On: {formatDate(selectedApplication.created_at)}
                </p>
                <p className="text-gray-600">
                  Current Status:
                  <span
                    className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Professional Information
              </h4>
              <p className="text-gray-800">
                Current Profession: {selectedApplication.current_profession}
              </p>
              <p className="text-gray-800">
                Institution: {selectedApplication.institution}
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>

              {selectedApplication.status === "pending" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "rejected");
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "approved");
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </>
              )}
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
};

export default Applications;