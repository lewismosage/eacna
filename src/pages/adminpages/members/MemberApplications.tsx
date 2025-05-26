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
import emailjs from "@emailjs/browser";
import AlertModal from "../../../components/common/AlertModal";

// Initialize emailjs
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

type ApplicationStatus = "pending" | "approved" | "rejected";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Application {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  nationality: string;
  country_of_residence: string;
  id_number: string;
  membership_type: string;
  current_profession: string;
  institution: string;
  work_address: string;
  registration_number: string;
  highest_degree: string;
  university: string;
  created_at: string;
  application_status: ApplicationStatus;
  certify_info: boolean;
  consent_data: boolean;
}

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    first_name?: string;
    last_name?: string;
  };
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application;
    direction: "ascending" | "descending";
  }>({ key: "created_at", direction: "descending" });
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
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

  useEffect(() => {
    fetchApplications();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...applications];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.application_status === statusFilter
      );
    }

    if (membershipFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.membership_type === membershipFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.first_name.toLowerCase().includes(term) ||
          app.last_name.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          (app.institution && app.institution.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle null/undefined values by treating them as empty strings for comparison
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

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, membershipFilter, sortConfig]);

  const handleSort = (key: keyof Application) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sendApprovalEmail = async (application: Application) => {
    try {
      const templateParams = {
        to_name: `${application.first_name} ${application.last_name}`,
        to_email: application.email,
        subject: "Your EACNA Membership Application Has Been Approved",
        message: `
          <p>Dear ${application.first_name},</p>
          <p>We are pleased to inform you that your application for ${getMembershipLabel(
            application.membership_type
          )} membership with EACNA has been approved!</p>
          <p>Next steps:</p>
          <ol>
            <li>Complete your membership payment (you will receive payment instructions separately)</li>
            <li>Once payment is confirmed, you will receive your membership details</li>
            <li>Access member resources on our portal</li>
            <li>Connect with other members</li>
          </ol>
          <p>If you have any questions, please contact us at members@eacna.org.</p>
          <p>Welcome to EACNA!</p>
        `,
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

  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    if (newStatus === "approved") {
      setAlert({
        open: true,
        title: "Approve Application",
        message:
          "This will approve the application.Continue?",
        type: "confirm",
        confirmText: "Approve",
        cancelText: "Cancel",
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            // Get the application first to access email
            const { data: applicationData } = await supabase
              .from("membership_applications")
              .select("*")
              .eq("id", id)
              .single();

            if (!applicationData) throw new Error("Application not found");

            // Update application status
            const { error } = await supabase
              .from("membership_applications")
              .update({
                application_status: "approved",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            // Send approval email (without membership ID)
            await sendApprovalEmail({
              ...applicationData,
              application_status: "approved",
            });

            // Refresh applications
            await fetchApplications();

            setNotification({
              type: "success",
              message:
                "Application approved!",
            });
          } catch (err) {
            console.error("Error approving application:", err);
            setNotification({
              type: "error",
              message: "Failed to approve application. Please try again.",
            });
          } finally {
            setIsProcessing(false);
            setAlert({ ...alert, open: false });
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    } else {
      // For rejections
      setAlert({
        open: true,
        title: "Reject Application",
        message: "Are you sure you want to reject this application?",
        type: "confirm",
        confirmText: "Reject",
        cancelText: "Cancel",
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            const { error } = await supabase
              .from("membership_applications")
              .update({
                application_status: "rejected",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            // Refresh applications
            await fetchApplications();

            setNotification({
              type: "success",
              message: "Application has been rejected.",
            });
          } catch (err) {
            console.error("Error rejecting application:", err);
            setNotification({
              type: "error",
              message: "Failed to reject application. Please try again.",
            });
          } finally {
            setIsProcessing(false);
            setAlert({ ...alert, open: false });
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const getMembershipLabel = (type: string) => {
    const labels: Record<string, string> = {
      ordinary: "Full Member",
      associate: "Associate Member",
      student: "Student Member",
      institutional: "Institutional Member",
      honorary: "Honorary Member",
    };
    return labels[type] || type;
  };

  const handleExport = async () => {
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Membership Type",
        "Nationality",
        "Profession",
        "Institution",
        "Status",
        "Date Submitted",
      ].join(",");

      const csvRows = filteredApplications.map((app) =>
        [
          app.id,
          `"${app.first_name} ${app.middle_name ? app.middle_name + " " : ""}${
            app.last_name
          }"`,
          app.email,
          app.phone,
          getMembershipLabel(app.membership_type),
          app.nationality,
          app.current_profession,
          app.institution,
          app.application_status,
          formatDate(app.created_at),
        ].join(",")
      );

      const csvContent = [headers, ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `eacna-applications-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Applications exported successfully!",
      });
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
                placeholder="Search applications..."
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
                            <div className="text-sm text-gray-900">
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
                                application.application_status
                              )}`}
                            >
                              {application.application_status
                                .charAt(0)
                                .toUpperCase() +
                                application.application_status.slice(1)}
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
                              {application.application_status === "pending" && (
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
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Personal Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedApplication.first_name}{" "}
                      {selectedApplication.middle_name}{" "}
                      {selectedApplication.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedApplication.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedApplication.phone}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {selectedApplication.gender}
                    </p>
                    <p>
                      <span className="font-medium">Nationality:</span>{" "}
                      {selectedApplication.nationality}
                    </p>
                    <p>
                      <span className="font-medium">Country of Residence:</span>{" "}
                      {selectedApplication.country_of_residence}
                    </p>
                    <p>
                      <span className="font-medium">ID/Passport:</span>{" "}
                      {selectedApplication.id_number}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Membership Details
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {getMembershipLabel(selectedApplication.membership_type)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          selectedApplication.application_status
                        )}`}
                      >
                        {selectedApplication.application_status
                          .charAt(0)
                          .toUpperCase() +
                          selectedApplication.application_status.slice(1)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDate(selectedApplication.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Professional Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Profession:</span>{" "}
                      {selectedApplication.current_profession}
                    </p>
                    <p>
                      <span className="font-medium">Institution:</span>{" "}
                      {selectedApplication.institution}
                    </p>
                    <p>
                      <span className="font-medium">Work Address:</span>{" "}
                      {selectedApplication.work_address}
                    </p>
                    <p>
                      <span className="font-medium">Registration Number:</span>{" "}
                      {selectedApplication.registration_number || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Education
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Highest Degree:</span>{" "}
                      {selectedApplication.highest_degree}
                    </p>
                    <p>
                      <span className="font-medium">University:</span>{" "}
                      {selectedApplication.university}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>

              {selectedApplication.application_status === "pending" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      handleStatusChange(selectedApplication.id, "rejected")
                    }
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
                    onClick={() =>
                      handleStatusChange(selectedApplication.id, "approved")
                    }
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
