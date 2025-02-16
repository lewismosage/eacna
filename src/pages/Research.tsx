import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Tag,
  Users,
  Brain,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { supabase } from "../../supabaseClient";

const Research = () => {
  interface Article {
    id: string;
    title: string;
    content: string;
    author: string;
    publishedAt: string;
    type: string;
    tags: string[];
    category: string;
  }

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, content, author, publishedAt, tags, category, type");


      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        const formattedData = data.map((article) => ({
          ...article,
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString() // Format Date
            : "N/A", // Handle null case
          tags: typeof article.tags === "string" ? JSON.parse(article.tags) : article.tags || [],
              }));
              setArticles(formattedData as Article[]);
            }
          };
      
          fetchArticles();
        }, [selectedCategory, searchQuery]);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "research":
        return Brain;
      case "case-study":
        return FileText;
      case "innovation":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const categories = [
    "All",
    "Clinical Research",
    "Development",
    "Intervention",
    "Technology",
    "Case Studies",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-16 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Research Articles
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Explore and contribute to the latest research in child neurology
              across East Africa
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
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

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => {
            const Icon = getIcon(article.type);
            return (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <span className="text-sm font-medium text-blue-600">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.content}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{article.publishedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-4 w-4 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Read Article
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Research;
