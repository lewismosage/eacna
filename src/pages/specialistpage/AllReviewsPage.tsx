import React, { useState, useEffect } from "react";
import { useParams, } from "react-router-dom";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import Section from "../../components/common/Section";
import Card, { CardContent } from "../../components/common/Card";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const AllReviewsPage = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState<{
    data: Array<{
      id: number;
      user_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }>;
    count: number;
  }>({ data: [], count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">(
    "newest"
  );
  const reviewsPerPage = 5;

  const fetchReviews = async () => {
    try {
      setIsLoading(true);

      // Base query
      let query = supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .eq("specialist_id", id);

      // Apply rating filter if set
      if (ratingFilter) {
        query = query.eq("rating", ratingFilter);
      }

      // Apply search query if set
      if (searchQuery) {
        query = query.ilike("comment", `%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "highest":
          query = query.order("rating", { ascending: false });
          break;
        case "lowest":
          query = query.order("rating", { ascending: true });
          break;
      }

      // Apply pagination
      const from = (currentPage - 1) * reviewsPerPage;
      const to = from + reviewsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setReviews({
        data: data || [],
        count: count || 0,
      });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, currentPage, ratingFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(reviews.count / reviewsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRatingFilter = (rating: number | null) => {
    setRatingFilter(rating);
    setCurrentPage(1); 
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
  };

  if (isLoading && currentPage === 1) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      <Section className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              Patient Reviews
            </h1>
            <div className="text-lg">
              <span className="font-semibold">{reviews.count}</span>{" "}
              <span className="text-gray-600">total reviews</span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRatingFilter(null)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      ratingFilter === null
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Filter className="h-3 w-3 mr-1" /> All
                  </button>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingFilter(star)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        ratingFilter === star
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />{" "}
                      {star} Star{star !== 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort and Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "newest" | "highest" | "lowest"
                      )
                    }
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>

                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.data.length > 0 ? (
              reviews.data.map((review) => (
                <Card key={review.id}>
                  <CardContent>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                          <span className="font-medium">
                            {review.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No reviews found matching your criteria.
                    </p>
                    {ratingFilter || searchQuery ? (
                      <button
                        onClick={() => {
                          setRatingFilter(null);
                          setSearchQuery("");
                        }}
                        className="text-primary-600 hover:text-primary-800 mt-2 text-sm font-medium"
                      >
                        Clear filters
                      </button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {reviews.count > reviewsPerPage && (
            <div className="flex justify-center mt-8">
              <nav
                className="flex items-center gap-2"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        currentPage === page
                          ? "bg-primary-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default AllReviewsPage;