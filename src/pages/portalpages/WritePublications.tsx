import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  FileText,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  HelpCircle,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Publication {
  title: string;
  authors: string;
  abstract: string;
  journal?: string;
  year?: string;
  pages?: string;
  keywords: string[];
  sections: {
    id: number;
    type: "heading" | "paragraph";
    content: string;
    level?: number | null;
  }[];
  references: string[];
}

export const savePublication = async (
  publication: Publication,
  userId: string,
  isDraft = true,
  publicationId?: string
) => {
  const publicationData = {
    user_id: userId,
    title: publication.title,
    authors: publication.authors,
    abstract: publication.abstract,
    journal: publication.journal,
    year: publication.year ? parseInt(publication.year) : null,
    pages: publication.pages,
    keywords: publication.keywords,
    sections: publication.sections,
    publication_references: publication.references.filter((ref) => ref.trim()),
    status: isDraft ? "draft" : "submitted",
    updated_at: new Date().toISOString(),
  };

  if (publicationId) {
    const { data, error } = await supabase
      .from("publications")
      .update(publicationData)
      .eq("id", publicationId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  const { data, error } = await supabase
    .from("publications")
    .insert([publicationData])
    .select();

  if (error) throw error;
  return data?.[0];
};

const WritePublications = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const { id } = useParams();

  // Publication form state
  const [publication, setPublication] = useState<Publication>({
    title: "",
    authors: "",
    abstract: "",
    journal: "",
    year: new Date().getFullYear().toString(),
    pages: "",
    keywords: [],
    sections: [
      { id: 1, type: "heading", level: 1, content: "Introduction" },
      { id: 2, type: "paragraph", content: "" },
      { id: 3, type: "heading", level: 1, content: "Methods" },
      { id: 4, type: "paragraph", content: "" },
      { id: 5, type: "heading", level: 1, content: "Results" },
      { id: 6, type: "paragraph", content: "" },
      { id: 7, type: "heading", level: 1, content: "Discussion" },
      { id: 8, type: "paragraph", content: "" },
      { id: 9, type: "heading", level: 1, content: "Conclusion" },
      { id: 10, type: "paragraph", content: "" },
    ],
    references: [""],
  });

  // Form sections state
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [sections, setSections] = useState<
    {
      id: number;
      type: "heading" | "paragraph";
      content: string;
      level?: number | null;
    }[]
  >([
    { id: 1, type: "heading", level: 1, content: "Introduction" },
    { id: 2, type: "paragraph", content: "" },
    { id: 3, type: "heading", level: 1, content: "Methods" },
    { id: 4, type: "paragraph", content: "" },
    { id: 5, type: "heading", level: 1, content: "Results" },
    { id: 6, type: "paragraph", content: "" },
    { id: 7, type: "heading", level: 1, content: "Discussion" },
    { id: 8, type: "paragraph", content: "" },
    { id: 9, type: "heading", level: 1, content: "Conclusion" },
    { id: 10, type: "paragraph", content: "" },
  ]);

  const [references, setReferences] = useState([""]);
  const [showPreview, setShowPreview] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<keyof Publication | "sections" | "references", string | null>
    >
  >({});
  const [submitStatus, setSubmitStatus] = useState<
    "submitting" | "success" | "error" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load publication if editing
  useEffect(() => {
    const loadPublication = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("publications")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Publication not found");

        setPublication({
          title: data.title,
          authors: data.authors,
          abstract: data.abstract,
          journal: data.journal || "",
          year: data.year?.toString() || "",
          pages: data.pages || "",
          keywords: data.keywords || [],
          sections: data.sections || [],
          references: data.publication_references || [""],
        });

        setSections(data.sections || []);
        setReferences(data.publication_references || [""]);
      } catch (error) {
        console.error("Error loading publication:", error);
        setErrorMessage("Failed to load publication. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPublication();
  }, [id]);

  // Handle basic input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPublication({
      ...publication,
      [name]: value,
    });

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Handle keyword additions
  const handleAddKeyword = () => {
    if (
      currentKeyword.trim() &&
      !publication.keywords.includes(currentKeyword.trim())
    ) {
      setPublication({
        ...publication,
        keywords: [...publication.keywords, currentKeyword.trim()],
      });
      setCurrentKeyword("");
    }
  };

  // Handle keyword removals
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setPublication({
      ...publication,
      keywords: publication.keywords.filter(
        (keyword) => keyword !== keywordToRemove
      ),
    });
  };

  // Handle section content changes
  const handleSectionChange = (id: number, field: string, value: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  // Add new section
  const handleAddSection = (type: "heading" | "paragraph", afterId: number) => {
    const newId = Math.max(...sections.map((s) => s.id)) + 1;
    const afterIndex = sections.findIndex((s) => s.id === afterId);

    const newSection = {
      id: newId,
      type: type,
      content: type === "heading" ? "New Section" : "",
      level: type === "heading" ? 2 : null,
    };

    const updatedSections = [
      ...sections.slice(0, afterIndex + 1),
      newSection,
      ...sections.slice(afterIndex + 1),
    ];

    setSections(updatedSections);
  };

  // Remove section
  const handleRemoveSection = (id: number) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  // Handle references
  const handleReferenceChange = (index: number, value: string) => {
    const newReferences = [...references];
    newReferences[index] = value;
    setReferences(newReferences);
  };

  // Add new reference
  const handleAddReference = () => {
    setReferences([...references, ""]);
  };

  // Remove reference
  const handleRemoveReference = (index: number) => {
    const newReferences = [...references];
    newReferences.splice(index, 1);
    setReferences(newReferences);
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: Partial<
      Record<keyof Publication | "sections" | "references", string>
    > = {};
    if (!publication.title.trim()) errors.title = "Title is required";
    if (!publication.authors.trim()) errors.authors = "Authors are required";
    if (!publication.abstract.trim()) errors.abstract = "Abstract is required";
    if (publication.keywords.length === 0)
      errors.keywords = "At least one keyword is required";

    // Check if sections have content
    const emptySections = sections.filter(
      (s) => s.type === "paragraph" && !s.content.trim()
    );
    if (emptySections.length > 0)
      errors.sections = "All sections must have content";

    // Check if at least one valid reference exists
    const validReferences = references.filter((ref) => ref.trim());
    if (validReferences.length === 0)
      errors.references = "At least one reference is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setSubmitStatus("submitting");
    setIsLoading(true);

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save the publication
      const savedPublication = await savePublication(
        {
          ...publication,
          sections,
          references: references.filter((ref) => ref.trim()),
        },
        user.id,
        false, // Not a draft
        id // Pass the ID if editing
      );

      
      setSubmitStatus("success");
    } catch (error) {
      console.error("Error submitting publication:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit publication"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save draft functionality
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save the publication as draft
      const savedPublication = await savePublication(
        {
          ...publication,
          sections,
          references: references.filter((ref) => ref.trim()),
        },
        user.id,
        true, // Is draft
        id // Pass the ID if editing
      );

      console.log("Draft saved:", savedPublication);
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      window.scrollTo(0, 0);
    }
  };

  // Format current date
  const formatDate = (date: Date) => {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  // Estimated read time based on content length
  const estimateReadTime = () => {
    const contentLength = sections.reduce(
      (acc, section) => acc + section.content.length,
      0
    );
    const wordsPerMinute = 200;
    const minutes = Math.ceil(contentLength / 5 / wordsPerMinute);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  // Render different components based on view mode
  const renderContent = () => {
    if (showPreview) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              {publication.title || "Untitled Publication"}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{estimateReadTime()} read</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>By {publication.authors || "Unknown Authors"}</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">Abstract</h2>
              <p className="text-gray-700">
                {publication.abstract || "No abstract provided."}
              </p>
            </div>

            {publication.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {publication.keywords.map((keyword, index) => (
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

          {/* Paper content preview */}
          <div className="prose prose-primary prose-lg max-w-none">
            {sections.map((section, index) => {
              if (section.type === "heading" && section.level === 1) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {section.content}
                  </h2>
                );
              } else if (section.type === "heading" && section.level === 2) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                    {section.content}
                  </h3>
                );
              } else {
                return (
                  <p key={index} className="mb-4">
                    {section.content || "Empty paragraph"}
                  </p>
                );
              }
            })}

            {/* References section */}
            {references.filter((ref) => ref.trim()).length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-6">References</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  {references
                    .filter((ref) => ref.trim())
                    .map((reference, index) => (
                      <li key={index} className="text-gray-700">
                        {reference}
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Publication Details Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Publication Details
          </h2>

          {Object.keys(formErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {Object.entries(formErrors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={publication.title}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2 border ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Enter publication title"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
              )}
            </div>

            {/* Authors */}
            <div>
              <label
                htmlFor="authors"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Authors <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authors"
                name="authors"
                value={publication.authors}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2 border ${
                  formErrors.authors ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="e.g., Njeri S, Omondi B, et al."
              />
              {formErrors.authors && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.authors}
                </p>
              )}
            </div>

            {/* Abstract */}
            <div>
              <label
                htmlFor="abstract"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                id="abstract"
                name="abstract"
                value={publication.abstract}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 sm:px-4 py-2 border ${
                  formErrors.abstract ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Provide a concise summary of your publication"
              />
              {formErrors.abstract && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.abstract}
                </p>
              )}
            </div>

            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Keywords <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="text"
                  id="keywords"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  className={`flex-1 px-3 sm:px-4 py-2 border ${
                    formErrors.keywords ? "border-red-500" : "border-gray-300"
                  } rounded-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  placeholder="Enter a keyword"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddKeyword())
                  }
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg sm:rounded-l-none hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mx-auto" />
                </button>
              </div>
              {formErrors.keywords && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.keywords}
                </p>
              )}

              {publication.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {publication.keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 text-primary-500 hover:text-primary-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publication Details - Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="journal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Journal Name
                </label>
                <input
                  type="text"
                  id="journal"
                  name="journal"
                  value={publication.journal}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., East African Medical Journal"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={publication.year}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2023"
                />
              </div>

              <div>
                <label
                  htmlFor="pages"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pages
                </label>
                <input
                  type="text"
                  id="pages"
                  name="pages"
                  value={publication.pages}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 124-152"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paper Content Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Paper Content
            </h2>
            <div className="text-sm text-gray-500 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                Tip: Add sections to organize your content
              </span>
              <span className="sm:hidden">
                Add sections to organize content
              </span>
            </div>
          </div>

          {formErrors.sections && (
            <p className="mt-1 mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">
              {formErrors.sections}
            </p>
          )}

          <div className="space-y-4 sm:space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4"
              >
                {section.type === "heading" ? (
                  <div className="mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:mb-2">
                      <select
                        value={section.level ?? ""}
                        onChange={(e) =>
                          handleSectionChange(
                            section.id,
                            "level",
                            parseInt(e.target.value).toString()
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded sm:mr-2 w-full sm:w-auto"
                      >
                        <option value={1}>Heading 1</option>
                        <option value={2}>Heading 2</option>
                        <option value={3}>Heading 3</option>
                      </select>
                      <input
                        type="text"
                        value={section.content}
                        onChange={(e) =>
                          handleSectionChange(
                            section.id,
                            "content",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-1 border border-gray-300 rounded font-semibold w-full sm:w-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      handleSectionChange(section.id, "content", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded resize-vertical focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter section content..."
                  />
                )}

                {/* Section actions */}
                <div className="flex flex-wrap justify-end mt-2 gap-2 text-sm">
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      className="text-red-600 hover:text-red-800 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />{" "}
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddSection("heading", section.id)}
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />{" "}
                    <span className="hidden sm:inline">Add Heading</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSection("paragraph", section.id)}
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />{" "}
                    <span className="hidden sm:inline">Add Paragraph</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* References Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            References
          </h2>

          {formErrors.references && (
            <p className="mt-1 mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">
              {formErrors.references}
            </p>
          )}

          <div className="space-y-4">
            {references.map((reference, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start gap-2 sm:gap-0"
              >
                <span className="text-gray-500 font-medium sm:mr-2 mt-2">
                  {index + 1}.
                </span>
                <textarea
                  value={reference}
                  onChange={(e) => handleReferenceChange(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded resize-vertical focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter reference..."
                />
                {references.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(index)}
                    className="sm:ml-2 text-red-600 hover:text-red-800 p-2 self-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddReference}
              className="text-primary-600 hover:text-primary-800 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Reference
            </button>
          </div>
        </div>

        {/* Upload Supporting Files (Optional) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Supporting Files (Optional)
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-2">
              Drag and drop files here or click to browse
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Upload PDF, Word, Excel, or image files (max 10MB each)
            </p>
            <Button variant="outline" className="mx-auto">
              <Upload className="h-4 w-4 mr-2" /> Browse Files
            </Button>
          </div>
        </div>

        {/* Submission Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              type="button"
              variant={showPreview ? "primary" : "outline"}
              onClick={togglePreview}
              disabled={isLoading}
            >
              <BookOpen className="h-4 w-4 mr-2" />{" "}
              {showPreview ? "Continue Editing" : "Preview"}
            </Button>
          </div>

          {!showPreview && (
            <Button
              type="submit"
              variant="primary"
              disabled={submitStatus === "submitting"}
              className="w-full sm:w-auto sm:ml-auto"
            >
              {submitStatus === "submitting" ? (
                <>Submitting...</>
              ) : (
                <>Submit for Review</>
              )}
            </Button>
          )}
        </div>
      </form>
    );
  };

  // Success message after submission
  const renderSuccessMessage = () => (
    <motion.div
      className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {id ? "Publication Updated!" : "Publication Submitted!"}
      </h2>
      <p className="text-gray-600 mb-6">
        {id
          ? "Your changes have been saved."
          : "Your publication has been submitted for review. Our editorial team will review it and get back to you within 5-7 working days."}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/portal/my-publications">
          <Button variant="outline">View My Publications</Button>
        </Link>
      </div>
    </motion.div>
  );

  if (isLoading && id) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Loading publication...</span>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link
            to="/portal/my-publications"
            className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Publications
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Section>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary-800">
              {id ? "Edit Publication" : "Write New Publication"}
            </h1>
          </div>

          {submitStatus === "success" ? (
            renderSuccessMessage()
          ) : submitStatus === "error" ? (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Submission Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage ||
                  "There was an error submitting your publication. Please try again."}
              </p>
              <Button variant="primary" onClick={() => setSubmitStatus(null)}>
                Try Again
              </Button>
            </motion.div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {id ? "Edit Publication" : "New Publication Draft"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Last saved: {formatDate(new Date()) || "N/A"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button
                    variant={showPreview ? "primary" : "outline"}
                    onClick={togglePreview}
                    disabled={isLoading}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />{" "}
                    {showPreview ? "Continue Editing" : "Preview"}
                  </Button>
                </div>
              </div>

              {renderContent()}
            </div>
          )}
        </motion.div>
      </Section>
    </>
  );
};

export default WritePublications;
