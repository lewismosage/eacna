import React, { useState } from "react";
import { FileText, Plus, Search, Tag } from "lucide-react";

const Research = () => {
  const [articles, setArticles] = useState([
    {
      id: "1",
      title: "Advances in Pediatric Epilepsy Treatment",
      abstract: "Recent developments in treating childhood epilepsy...",
      author: "Dr. Sarah Kimani",
      status: "published",
      tags: ["Epilepsy", "Treatment", "Pediatric"],
      publishedAt: "2024-03-15",
    },
    // More articles...
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Research Articles
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Share and explore the latest research in child neurology
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              New Article
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search articles..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>All Categories</option>
                <option>Epilepsy</option>
                <option>Development</option>
                <option>Treatment</option>
              </select>
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Sort by: Latest</option>
                <option>Most Viewed</option>
                <option>Most Cited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="mt-8 space-y-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    {article.title}
                  </h3>
                </div>
                <p className="mt-3 text-gray-600">{article.abstract}</p>
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Research;
