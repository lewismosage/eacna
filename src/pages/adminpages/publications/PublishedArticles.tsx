import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Clock,
  Share2,
  RefreshCw,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";

// Initialize Supabase client
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
  status: "published";
  submitted_by: string;
  submitted_at: string;
  updated_at: string;
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
}

type SortablePublicationKeys = "title" | "authors" | "updated_at" | "year";

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

const getStatusBadge = () => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      Published
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

const PublicationsDirectory = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<
    Publication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortablePublicationKeys;
    direction: "ascending" | "descending";
  } | null>({ key: "updated_at", direction: "descending" });
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("publications")
        .select(
          `
          *,
          profiles:user_id (first_name, last_name)
        `
        )
        .eq("status", "published")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Map the data to include the submitter's name
      const publicationsWithSubmitter = data.map((pub: any) => ({
        ...pub,
        submitted_by: pub.profiles
          ? `${pub.profiles.first_name} ${pub.profiles.last_name}`
          : "Unknown Author",
      }));

      setPublications(publicationsWithSubmitter || []);
      setFilteredPublications(publicationsWithSubmitter || []);
    } catch (err) {
      console.error("Error fetching publications:", err);
      setError("Failed to load publications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  useEffect(() => {
    let result = [...publications];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (pub) =>
          pub.title.toLowerCase().includes(lowercasedSearch) ||
          pub.authors.toLowerCase().includes(lowercasedSearch) ||
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

  const exportPublicationsCSV = () => {
    const headers = [
      "Title",
      "Authors",
      "Updated At",
      "Journal",
      "Year",
      "Keywords",
    ].join(",");

    const csvRows = publications.map((pub) =>
      [
        `"${pub.title}"`,
        `"${pub.authors}"`,
        formatDate(pub.updated_at),
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
      `publications-directory-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePublication = (publication: Publication) => {
    const url = `${window.location.origin}/publications/${publication.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: publication.title,
          text: `Check out this publication: ${publication.title}`,
          url,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Publications Directory
          </h1>
          <p className="text-gray-600 mt-1">
            Browse all published research works
          </p>
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

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search publications by title, author, or keyword..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Publications List */}
      <Card>
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
                  onClick={() => requestSort("authors")}
                >
                  <div className="flex items-center">
                    <span>Authors</span>
                    <div className="ml-1">{getSortIcon("authors")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("updated_at")}
                >
                  <div className="flex items-center">
                    <span>Updated</span>
                    <div className="ml-1">{getSortIcon("updated_at")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
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
                        {publication.authors}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        <span>Submitted by {publication.submitted_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(publication.updated_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {publication.keywords
                          .slice(0, 3)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
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
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewPublication(publication)}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View Publication"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => sharePublication(publication)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Share Publication"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
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
                    {searchTerm
                      ? "No publications match your search criteria"
                      : "No publications found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Publication View Modal */}
      {isViewOpen && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Publication Details</h2>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedPublication.title}
                </h1>

                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>By {selectedPublication.authors}</span>
                  </div>
                  {selectedPublication.journal && (
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{selectedPublication.journal}</span>
                    </div>
                  )}
                  {selectedPublication.year && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{selectedPublication.year}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Updated {formatDate(selectedPublication.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
                  <h2 className="font-semibold text-gray-900 mb-2">Abstract</h2>
                  <p className="text-gray-700">
                    {selectedPublication.abstract}
                  </p>
                </div>

                {selectedPublication.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPublication.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Main Content */}
              <div className="prose max-w-none">
                {selectedPublication.sections.map((section, index) => {
                  if (section.type === "heading") {
                    switch (section.level) {
                      case 1:
                        return (
                          <h2
                            key={index}
                            className="text-2xl font-bold mt-8 mb-4"
                          >
                            {section.content}
                          </h2>
                        );
                      case 2:
                        return (
                          <h3
                            key={index}
                            className="text-xl font-semibold mt-6 mb-3"
                          >
                            {section.content}
                          </h3>
                        );
                      case 3:
                        return (
                          <h4
                            key={index}
                            className="text-lg font-medium mt-4 mb-2"
                          >
                            {section.content}
                          </h4>
                        );
                      default:
                        return (
                          <h2
                            key={index}
                            className="text-2xl font-bold mt-8 mb-4"
                          >
                            {section.content}
                          </h2>
                        );
                    }
                  } else {
                    return (
                      <p key={index} className="mb-4 text-gray-700">
                        {section.content}
                      </p>
                    );
                  }
                })}
              </div>

              {/* References */}
              {selectedPublication.references?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-bold mb-4">References</h2>
                  <ol className="list-decimal pl-5 space-y-2">
                    {selectedPublication.references.map((reference, index) => (
                      <li key={index} className="text-gray-700 text-sm">
                        {reference}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => sharePublication(selectedPublication)}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Publication
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsDirectory;
