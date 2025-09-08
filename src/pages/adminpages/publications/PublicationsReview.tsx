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
  Clock,
  FileText,
  Loader2,
  BookOpen,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import Button from "../../../components/common/Button";
import AlertModal from "../../../components/common/AlertModal";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  journal?: string;
  year?: number;
  status: "draft" | "submitted" | "approved" | "published" | "rejected";
  submitted_by: string;
  submitted_at: string;
  reviewed_at: string | null;
  keywords: string[];
  sections: {
    id: number;
    type: "heading" | "paragraph";
    content: string;
    level?: number;
  }[];
  references: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
] as const;

type SortablePublicationKeys =
  | "title"
  | "submitted_by"
  | "submitted_at"
  | "status";

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

const getStatusBadge = (status: Publication["status"]) => {
  const styles = {
    draft: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    published: "bg-purple-100 text-purple-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const estimateReadTime = (sections: any[]) => {
  const contentLength = sections.reduce(
    (acc, section) => acc + (section.content?.length || 0),
    0
  );
  const wordsPerMinute = 200;
  const minutes = Math.ceil(contentLength / 5 / wordsPerMinute);
  return `${minutes} min read`;
};

const AdminPublicationsReview = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<
    Publication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "submitted" | "published" | "rejected"
  >("all");
  const [sortConfig, setSortConfig] = useState<{
    key: SortablePublicationKeys;
    direction: "ascending" | "descending";
  } | null>({ key: "submitted_at", direction: "descending" });
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "info" | "success" | "warning" | "error" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("publications")
        .select(
          `
          *,
          profiles:user_id (first_name, last_name)
        `
        )
        .or("status.eq.submitted,status.eq.approved,status.eq.rejected");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map the data to include the submitter's name
      const publicationsWithSubmitter = data.map((pub: any) => ({
        ...pub,
        submitted_by: pub.profiles
          ? `${pub.profiles.first_name} ${pub.profiles.last_name}`
          : "Unknown User",
      }));

      setPublications(publicationsWithSubmitter || []);
      setFilteredPublications(publicationsWithSubmitter || []);
    } catch (err) {
      console.error("Error fetching publications:", err);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to load publications. Please try again.",
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [statusFilter]);

  useEffect(() => {
    let result = [...publications];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (pub) =>
          pub.title.toLowerCase().includes(lowercasedSearch) ||
          pub.submitted_by.toLowerCase().includes(lowercasedSearch) ||
          pub.abstract.toLowerCase().includes(lowercasedSearch) ||
          pub.keywords.some((kw) => kw.toLowerCase().includes(lowercasedSearch))
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

    setFilteredPublications(result);
  }, [publications, searchTerm, sortConfig]);

  const requestSort = (key: SortablePublicationKeys) => {
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

  const getSortIcon = (key: SortablePublicationKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const viewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsViewOpen(true);
  };

  const updatePublicationStatus = async (
    id: string,
    status: "published" | "rejected"
  ) => {
    setAlertConfig({
      type: "confirm",
      title: "Confirm Action",
      message: `Are you sure you want to ${
        status === "published" ? "publish" : "reject"
      } this publication?`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const { error } = await supabase
            .from("publications")
            .update({
              status,
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", id);

          if (error) throw error;

          await fetchPublications();
          setIsViewOpen(false);
          setAlertConfig({
            type: "success",
            title: "Success",
            message: `Publication has been ${
              status === "published" ? "published" : "rejected"
            } successfully.`,
          });
          setShowAlert(true);
        } catch (err) {
          console.error(`Error updating publication status:`, err);
          setAlertConfig({
            type: "error",
            title: "Error",
            message: "Failed to update publication status. Please try again.",
          });
          setShowAlert(true);
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setShowAlert(true);
  };

  const exportPublicationsCSV = () => {
    const headers = [
      "Title",
      "Submitted By",
      "Status",
      "Submitted At",
      "Journal",
      "Year",
      "Keywords",
    ].join(",");

    const csvRows = publications.map((pub) =>
      [
        `"${pub.title}"`,
        `"${pub.submitted_by}"`,
        pub.status,
        formatDate(pub.created_at),
        pub.journal ? `"${pub.journal}"` : "",
        pub.year || "",
        `"${pub.keywords.join(", ")}"`,
      ].join(",")
    );

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `publications-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Publications Review
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchPublications}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={exportPublicationsCSV}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search publications..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="md:w-48">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "submitted"
                      | "published"
                      | "rejected"
                  )
                }
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Publications table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("title")}
                >
                  <div className="flex items-center">
                    <span>Title</span>
                    <div className="ml-1">{getSortIcon("title")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("submitted_by")}
                >
                  <div className="flex items-center">
                    <span>Submitted By</span>
                    <div className="ml-1">{getSortIcon("submitted_by")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("submitted_at")}
                >
                  <div className="flex items-center">
                    <span>Submitted</span>
                    <div className="ml-1">{getSortIcon("submitted_at")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    <div className="ml-1">{getSortIcon("status")}</div>
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPublications.length > 0 ? (
                filteredPublications.map((publication) => (
                  <tr key={publication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {publication.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{estimateReadTime(publication.sections)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {publication.submitted_by}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(publication.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(publication.status)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewPublication(publication)}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="View Publication"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {publication.status === "submitted" && (
                          <>
                            <button
                              onClick={() =>
                                updatePublicationStatus(
                                  publication.id,
                                  "published"
                                )
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Publish Publication"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                updatePublicationStatus(
                                  publication.id,
                                  "rejected"
                                )
                              }
                              className="text-red-600 hover:text-red-800"
                              title="Reject Publication"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No publications found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">
                  {filteredPublications.length}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredPublications.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                <button className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 -rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Publication View Modal */}
      {isViewOpen && selectedPublication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Publication Details
              </h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-1 space-y-6">
                {/* Publication Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Publication Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500">Title</p>
                        <p className="font-medium">
                          {selectedPublication.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Authors</p>
                        <p className="font-medium">
                          {selectedPublication.authors}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted By</p>
                        <p className="font-medium">
                          {selectedPublication.submitted_by}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted On</p>
                        <p className="font-medium">
                          {formatDate(selectedPublication.created_at)}
                        </p>
                      </div>
                      {selectedPublication.reviewed_at && (
                        <div>
                          <p className="text-xs text-gray-500">
                            {selectedPublication.status === "approved"
                              ? "Approved"
                              : "Rejected"}{" "}
                            On
                          </p>
                          <p className="font-medium">
                            {formatDate(selectedPublication.reviewed_at)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedPublication.status)}
                        </div>
                      </div>
                      {selectedPublication.journal && (
                        <div>
                          <p className="text-xs text-gray-500">Journal</p>
                          <p className="font-medium">
                            {selectedPublication.journal}
                          </p>
                        </div>
                      )}
                      {selectedPublication.year && (
                        <div>
                          <p className="text-xs text-gray-500">Year</p>
                          <p className="font-medium">
                            {selectedPublication.year}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Keywords
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Abstract */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Abstract
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">
                      {selectedPublication.abstract}
                    </p>
                  </div>
                </div>

                {/* Full Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Full Content
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="prose prose-sm max-w-none">
                      {selectedPublication.sections.map((section, index) => {
                        if (section.type === "heading" && section.level === 1) {
                          return (
                            <h3
                              key={index}
                              className="text-xl font-semibold mt-6 mb-3"
                            >
                              {section.content}
                            </h3>
                          );
                        } else if (
                          section.type === "heading" &&
                          section.level === 2
                        ) {
                          return (
                            <h4
                              key={index}
                              className="text-lg font-medium mt-5 mb-2"
                            >
                              {section.content}
                            </h4>
                          );
                        } else if (
                          section.type === "heading" &&
                          section.level === 3
                        ) {
                          return (
                            <h5
                              key={index}
                              className="text-base font-medium mt-4 mb-2"
                            >
                              {section.content}
                            </h5>
                          );
                        } else {
                          return (
                            <p key={index} className="mb-3">
                              {section.content}
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>

              {selectedPublication.status === "submitted" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      updatePublicationStatus(
                        selectedPublication.id,
                        "rejected"
                      )
                    }
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() =>
                      updatePublicationStatus(
                        selectedPublication.id,
                        "published"
                      )
                    }
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.type === "confirm" ? "Confirm" : "OK"}
        cancelText={alertConfig.type === "confirm" ? "Cancel" : undefined}
      />
    </div>
  );
};

export default AdminPublicationsReview;