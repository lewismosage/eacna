import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  BookOpen,
  Download,
  Share2,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Define types for your publication data
type PublicationStatus = "draft" | "submitted" | "published" | "rejected";

interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  journal?: string;
  year?: number;
  status: PublicationStatus;
  keywords: string[];
  created_at: string;
  updated_at: string;
  sections: any[]; // Replace with proper type if needed
  publication_references: string[];
  user_id: string;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const MyPublicationsPage = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<
    Publication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Load publications
  useEffect(() => {
    loadPublications();
  }, []);

  // Filter and search publications
  useEffect(() => {
    let filtered = [...publications];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((pub) => pub.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Publication];
      const bValue = b[sortBy as keyof Publication];
      if (typeof aValue === "undefined" || typeof bValue === "undefined") {
        return 0;
      }
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPublications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [publications, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadPublications = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("user_id", user.id)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Error loading publications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPublications((prev) => prev.filter((pub) => pub.id !== id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting publication:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: PublicationStatus) => {
    const styles = {
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      published: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const icons = {
      draft: <Edit className="h-3 w-3 mr-1" />,
      submitted: <Clock className="h-3 w-3 mr-1" />,
      published: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPublicationStats = () => {
    const stats = publications.reduce(
      (acc, pub) => {
        acc[pub.status] = (acc[pub.status] || 0) + 1;
        acc.total++;
        return acc;
      },
      { total: 0, draft: 0, submitted: 0, published: 0, rejected: 0 }
    );

    return stats;
  };

  const stats = getPublicationStats();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPublications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const PreviewModal = ({
    publication,
    onClose,
  }: {
    publication: Publication;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Publication Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              {publication.title}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>By {publication.authors}</span>
              </div>
              {publication.journal && (
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{publication.journal}</span>
                </div>
              )}
              {publication.year && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{publication.year}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">Abstract</h2>
              <p className="text-gray-700">{publication.abstract}</p>
            </div>

            {publication.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {publication.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </header>

          {publication.publication_references?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold mb-4">References</h2>
              <ol className="list-decimal pl-5 space-y-2">
                {publication.publication_references.map((reference, index) => (
                  <li key={index} className="text-gray-700 text-sm">
                    {reference}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DeleteModal = ({
    publication,
    onConfirm,
    onCancel,
    isDeleting,
  }: {
    publication: Publication;
    onConfirm: (id: string) => void;
    onCancel: () => void;
    isDeleting: boolean;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Publication
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "{publication?.title}"? This will
          permanently remove the publication and all associated data.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(publication.id)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Member Portal
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Publications
              </h1>
              <p className="text-gray-600">
                Manage your research publications and track their status
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </div>
              <div className="text-sm text-gray-500">Drafts</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {stats.submitted}
              </div>
              <div className="text-sm text-gray-500">Submitted</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
              <div className="text-sm text-gray-500">Published</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as PublicationStatus | "all")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Drafts</option>
                  <option value="submitted">Submitted</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("_") as [
                      string,
                      "asc" | "desc"
                    ];
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updated_at_desc">Recently Updated</option>
                  <option value="created_at_desc">Recently Created</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="year_desc">Year (Newest)</option>
                  <option value="year_asc">Year (Oldest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Publications List */}
          {filteredPublications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No matching publications found"
                  : "No publications yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((publication) => (
                <motion.div
                  key={publication.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {publication.title}
                          </h3>
                          {getStatusBadge(publication.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3 gap-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{publication.authors}</span>
                        </div>
                        {publication.journal && (
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{publication.journal}</span>
                          </div>
                        )}
                        {publication.year && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{publication.year}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            Updated {formatDate(publication.updated_at)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {publication.abstract}
                      </p>

                      {publication.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {publication.keywords
                            .slice(0, 3)
                            .map((keyword, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          {publication.keywords.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{publication.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => {
                          setSelectedPublication(publication);
                          setShowPreview(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {publication.status === "draft" && (
                        <button
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() =>
                            navigate(`/publications/edit/${publication.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}

                      {publication.status === "published" && (
                        <>
                          <button
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedPublication(publication);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredPublications.length)}
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
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="h-5 w-5 rotate-90" />
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showPreview && selectedPublication && (
        <PreviewModal
          publication={selectedPublication}
          onClose={() => {
            setShowPreview(false);
            setSelectedPublication(null);
          }}
        />
      )}

      {showDeleteModal && selectedPublication && (
        <DeleteModal
          publication={selectedPublication}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedPublication(null);
          }}
          isDeleting={deletingId === selectedPublication.id}
        />
      )}
    </div>
  );
};

export default MyPublicationsPage;
