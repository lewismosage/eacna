import React, { useState } from "react";
import {
  FileText,
  Video,
  BookOpen,
  Download,
  ExternalLink,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const resources = [
  {
    title: "Pediatric Epilepsy Guidelines",
    type: "pdf",
    category: "Clinical Guidelines",
    description:
      "Comprehensive guidelines for diagnosing and treating pediatric epilepsy",
    downloadUrl: "#",
  },
  {
    title: "Neurological Examination Techniques",
    type: "video",
    category: "Training",
    description:
      "Video series on proper neurological examination techniques for children",
    videoUrl: "#",
  },
  {
    title: "Research Methodology Workshop",
    type: "pdf",
    category: "Research",
    description: "Materials from our latest research methodology workshop",
    downloadUrl: "#",
  },
  {
    title: "Case Studies in Child Neurology",
    type: "article",
    category: "Education",
    description:
      "Collection of interesting case studies from East African hospitals",
    url: "#",
  },
  {
    title: "Research Hub: Articles & Resources",
    
    category: "Research",
    description:
      "Access a curated collection of research articles, and insightful resources contributed by our members. Explore the latest studies, techniques, and expert insights to enhance your research journey.",
      url: "#",
  },
];

const categories = [
  "All",
  "Clinical Guidelines",
  "Training",
  "Research",
  "Education",
];

export function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return FileText;
      case "video":
        return Video;
      case "article":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const handleResourceClick = (resource: any) => {
    if (resource.title === "Research Hub: Articles & Resources") {
      navigate("/research");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Educational Resources
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Access our comprehensive collection of educational materials,
              research papers, and clinical guidelines.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7x2 mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => {
            const Icon = getIcon(resource.type);
            return (
              <div
                key={resource.title}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <span className="text-sm font-medium text-blue-600">
                        {resource.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex justify-end">
                    {resource.type === "pdf" && (
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
                        <Download className="h-5 w-5 mr-2" />
                        Download PDF
                      </button>
                    )}
                    {resource.type === "video" && (
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Watch Video
                      </button>
                    )}
                    {resource.type === "article" && (
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Read Article
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
