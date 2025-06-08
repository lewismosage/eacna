import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Card, { CardContent } from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { createClient } from "@supabase/supabase-js";
import ReviewForm from "./ReviewForm";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const SpecialistProfileView = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState<{
    id: number;
    uuid: string;
    prefix: string | null;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
    specialization: string | null;
    photo_url: string | null;
    hospital: string | null;
    location: {
      city: string | null;
      country: string | null;
      address: string | null;
    };
    rating: number;
    reviewCount: number;
    reviewDistribution: Record<number, number>;
    years_experience: number | null;
    languages: Record<string, boolean>;
    availability: string | null;
    gender: string | null;
    bio: string | null;
    strengths: string | null;
    expertise: string[];
    experience: {
      role: string;
      institution: string;
      period: string;
      description: string;
    }[];
    education: {
      degree: string;
      institution: string;
      period: string;
    }[];
    services: {
      name: string;
      description: string;
      duration: string;
    }[];
    conditions_treated: string[];
    reviews: {
      name: string;
      date: string;
      rating: number;
      comment: string;
    }[];
    research_interests: string[];
    phone: string | null;
    email: string | null;
    website: string | null;
    rates: {
      inPerson: number;
      video: number;
      chat: number;
    };
  } | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchSpecialist = async () => {
    try {
      setIsLoading(true);

      // Fetch specialist data
      const { data: specialistData, error: specialistError } = await supabase
        .from("specialists")
        .select("*")
        .eq("id", id)
        .single();

      if (specialistError) throw specialistError;

      // Fetch reviews separately
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("specialist_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      if (specialistData) {
        // Calculate rating and distribution from reviews
        const reviewCount = reviewsData?.length || 0;
        let rating = 0;
        const reviewDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (reviewCount > 0) {
          const totalRating =
            reviewsData?.reduce((sum, review) => {
              reviewDistribution[
                review.rating as keyof typeof reviewDistribution
              ]++;
              return sum + review.rating;
            }, 0) || 0;

          rating = parseFloat((totalRating / reviewCount).toFixed(1));
        }

        // Transform the data to match our SpecialistType
        const transformedData = {
          id: specialistData.id,
          uuid: specialistData.uuid,
          prefix: specialistData.prefix,
          first_name: specialistData.first_name,
          last_name: specialistData.last_name,
          title: specialistData.title,
          specialization: specialistData.specialization,
          photo_url: specialistData.photo_url,
          hospital: specialistData.hospital,
          location: {
            city: specialistData.city,
            country: specialistData.country,
            address: specialistData.address,
          },
          rating: rating,
          reviewCount: reviewCount,
          reviewDistribution: reviewDistribution,
          years_experience: specialistData.years_experience,
          languages: specialistData.languages || {},
          availability: specialistData.availability,
          gender: specialistData.gender,
          bio: specialistData.bio,
          strengths: specialistData.strengths,
          expertise: specialistData.expertise || [],
          experience: specialistData.experience || [],
          education: specialistData.education || [],
          services: specialistData.services || [],
          conditions_treated: specialistData.conditions_treated || [],
          reviews:
            reviewsData?.map((review) => ({
              name: review.user_name,
              date: new Date(review.created_at).toLocaleDateString(),
              rating: review.rating,
              comment: review.comment,
            })) || [],
          research_interests: specialistData.research_interests || [],
          phone: specialistData.phone,
          email: specialistData.email,
          website: specialistData.website,
          rates: specialistData.rates || {
            inPerson: 0,
            video: 0,
            chat: 0,
          },
        };

        setSpecialist(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch specialist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialist();
  }, [id]);

  const toggleExpertiseDisplay = () => {
    setShowAllExpertise(!showAllExpertise);
  };

  if (isLoading) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </Section>
    );
  }

  if (!specialist) {
    return (
      <Section>
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Specialist Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The requested specialist profile could not be found.
          </p>
          <Link to="/find-specialist">
            <Button variant="primary">Back to Specialists</Button>
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/find-specialist"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Specialists
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={
                    specialist.photo_url ||
                    "https://images.pexels.com/photos/5214956/pexels-photo-5214956.jpeg?auto=compress&cs=tinysrgb&w=600"
                  }
                  alt={`${specialist.first_name} ${specialist.last_name}`}
                  className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute bottom-2 right-2 bg-primary-500 text-white rounded-full p-1.5">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {specialist.prefix && `${specialist.prefix} `}
                      {specialist.first_name} {specialist.last_name}
                    </h1>
                    <Badge color="primary">Verified</Badge>
                    {specialist.availability === "available" && (
                      <Badge color="success">Available</Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    {specialist.title}
                  </p>
                  {specialist.specialization && (
                    <p className="text-primary-600">
                      Specializes in {specialist.specialization}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-primary-50 text-primary-800 rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-semibold">{specialist.rating}</span>
                    <span className="text-gray-500 ml-1 text-sm">
                      ({specialist.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-6">
                {specialist.hospital && specialist.location.city && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>
                      {specialist.hospital}, {specialist.location.city}
                    </span>
                  </div>
                )}
                {specialist.years_experience && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{specialist.years_experience} years experience</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>
                    Speaks:{" "}
                    {Object.entries(specialist.languages || {})
                      .filter(([_, isActive]) => isActive)
                      .map(([language]) => language)
                      .join(", ") || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Expertise */}
              {specialist.expertise && specialist.expertise.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {specialist.expertise
                      .slice(
                        0,
                        showAllExpertise ? specialist.expertise.length : 3
                      )
                      .map((item, idx) => (
                        <Badge key={idx} color="secondary">
                          {item}
                        </Badge>
                      ))}
                    {specialist.expertise.length > 3 && (
                      <button
                        onClick={toggleExpertiseDisplay}
                        className="text-primary-600 text-sm flex items-center hover:text-primary-800"
                      >
                        {showAllExpertise ? (
                          <>
                            Show less <ChevronUp className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            +{specialist.expertise.length - 3} more{" "}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: "about", label: "About" },
              { id: "experience", label: "Experience" },
              { id: "services", label: "Services" },
              {
                id: "reviews",
                label: "Reviews",
                count: specialist.reviewCount,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Section className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Tab */}
            {activeTab === "about" && (
              <>
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      About {specialist.prefix && `${specialist.prefix} `}
                      {specialist.first_name} {specialist.last_name}
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      <p className="mb-4">"{specialist.bio}"</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Areas of Expertise
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specialist.expertise.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <>
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Professional Experience
                    </h2>
                    <div className="space-y-6">
                      {specialist.experience.map((exp, index) => (
                        <div key={index} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className="bg-primary-100 text-primary-800 p-2 rounded-full">
                              <Clock className="h-5 w-5" />
                            </div>
                            {index !== specialist.experience.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h3 className="font-semibold text-gray-900">
                              {exp.role}
                            </h3>
                            <p className="text-primary-600">
                              {exp.institution}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              {exp.period}
                            </p>
                            <p className="text-gray-700">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Education
                    </h2>
                    <div className="space-y-6">
                      {specialist.education.map((edu, index) => (
                        <div key={index} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className="bg-primary-100 text-primary-800 p-2 rounded-full">
                              <Award className="h-5 w-5" />
                            </div>
                            {index !== specialist.education.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h3 className="font-semibold text-gray-900">
                              {edu.degree}
                            </h3>
                            <p className="text-primary-600">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-gray-500">
                              {edu.period}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <>
                <Card>
                  <CardContent>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Services Offered
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {specialist.services.map((service, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-semibold text-primary-700 mb-2">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {service.description}
                          </p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              Duration: {service.duration}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBookingModal(true)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Conditions Treated
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specialist.conditions_treated.map((condition, index) => (
                        <Badge key={index} color="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <>
                <Card>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
                        Patient Reviews
                      </h2>
                      <div className="flex items-center bg-primary-50 text-primary-800 rounded-full px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold">
                          {specialist.rating}
                        </span>
                        <span className="text-gray-500 ml-1 text-sm">
                          ({specialist.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                      <div className="md:col-span-2 bg-primary-50 rounded-lg p-6 text-center">
                        <div className="text-5xl font-bold text-primary-800 mb-2">
                          {specialist.rating}
                        </div>
                        <div className="flex justify-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-6 w-6 ${
                                i < Math.floor(specialist.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on {specialist.reviewCount} reviews
                        </p>
                      </div>

                      <div className="md:col-span-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const percentage = Math.round(
                            (specialist.reviewDistribution[star] /
                              specialist.reviewCount) *
                              100
                          );
                          return (
                            <div key={star} className="flex items-center mb-2">
                              <span className="w-8 text-sm text-gray-600">
                                {star}
                              </span>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-2" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-primary-500 h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-12 text-right text-sm text-gray-600">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Show only the most recent review */}
                    {specialist.reviews.length > 0 && (
                      <div className="border-b border-gray-200 pb-6 mb-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {specialist.reviews[0].name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {specialist.reviews[0].date}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < specialist.reviews[0].rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{specialist.reviews[0].comment}</p>
                      </div>
                    )}

                    <div className="flex justify-center mt-8">
                      <Link to={`/specialists/${id}/reviews`}>
                        <Button variant="outline">View All Reviews</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <ReviewForm
                  specialistId={specialist.id}
                  onReviewSubmitted={() => {
                    // Refresh reviews after submission
                    fetchSpecialist();
                  }}
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-800 p-2 rounded-full mr-3">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800">{specialist.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-800 p-2 rounded-full mr-3">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{specialist.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-800 p-2 rounded-full mr-3">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">{specialist.hospital}</p>
                      <p className="text-sm text-gray-600">
                        {specialist.location.address}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Card */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Book an Appointment
                </h3>
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="font-medium text-primary-700">
                        Next Available
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {specialist.availability === "available"
                        ? "Tomorrow at 10:00 AM"
                        : "Currently unavailable for new appointments"}
                    </p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowBookingModal(true)}
                      disabled={specialist.availability !== "available"}
                    >
                      Book Appointment
                    </Button>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>Typically replies within 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Book Appointment
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option>In-Person Visit</option>
                    <option>Video Consultation</option>
                    <option>Chat Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Calendar className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Visit
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Briefly describe the reason for your appointment"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <Button variant="primary" className="w-full">
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistProfileView;
