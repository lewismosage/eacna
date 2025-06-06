import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Globe,
  FileText,
  Star,
  Bookmark,
  Share2,
  Clock,
  Users,
  Award,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Video,
  User,
  Info,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Card, { CardContent } from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const SpecialistProfileView = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState<{
    id: number;
    name: string;
    title: string;
    specialization: string;
    photo: string;
    hospital: string;
    location: {
      city: string;
      country: string;
      address: string;
    };
    rating: number;
    reviewCount: number;
    reviewDistribution: Record<number, number>;
    yearsExperience: number;
    languages: string[];
    availability: string;
    gender: string;
    bio: string;
    strengths: string;
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
    conditionsTreated: string[];
    reviews: {
      name: string;
      date: string;
      rating: number;
      comment: string;
    }[];
    researchInterests: string[];
    phone: string;
    email: string;
    website: string;
    rates: {
      inPerson: number;
      video: number;
      chat: number;
    };
  } | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchSpecialist = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/specialists/${id}`);
        // const data = await response.json();

        // Using mock data for demonstration
        setTimeout(() => {
          const foundSpecialist = specialists.find(
            (s) => s.id === parseInt(id ?? "0")
          );
          setSpecialist(foundSpecialist || null);
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error("Failed to fetch specialist:", error);
        setIsLoading(false);
      }
    };

    fetchSpecialist();
  }, [id]);

  const handleSaveSpecialist = () => {
    setIsSaved(!isSaved);
    // Add API call to save to favorites in a real app
  };

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
                  src={specialist.photo}
                  alt={specialist.name}
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
                      {specialist.name}
                    </h1>
                    <Badge color="primary">Verified</Badge>
                    {specialist.availability === "available" && (
                      <Badge color="success">Available</Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    {specialist.title}
                  </p>
                  <p className="text-primary-600">
                    Specializes in {specialist.specialization}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-primary-50 text-primary-800 rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-semibold">{specialist.rating}</span>
                    <span className="text-gray-500 ml-1 text-sm">
                      ({specialist.reviewCount})
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      isSaved ? "text-primary-600 border-primary-600" : ""
                    }
                    onClick={handleSaveSpecialist}
                  >
                    <Bookmark
                      className={`h-4 w-4 mr-1 ${
                        isSaved ? "fill-primary-600" : ""
                      }`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>
                    {specialist.hospital}, {specialist.location.city}
                  </span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>{specialist.yearsExperience} years experience</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>Speaks: {specialist.languages.join(", ")}</span>
                </div>
              </div>

              {/* Expertise */}
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
                      About Dr. {specialist.name.split(" ")[1]}
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      <p className="mb-4">{specialist.bio}</p>
                      <p>
                        {specialist.gender === "female" ? "Dr." : "Dr."}{" "}
                        {specialist.name.split(" ")[1]} has over{" "}
                        {specialist.yearsExperience} years of experience
                        specializing in{" "}
                        {specialist.specialization.toLowerCase()}.{" "}
                        {specialist.gender === "female" ? "She" : "He"} is known
                        for {specialist.strengths}.
                      </p>
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
                      {specialist.conditionsTreated.map((condition, index) => (
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

                    <div className="space-y-6">
                      {specialist.reviews.map((review, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-6 last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {review.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center mt-8">
                      <Button variant="outline">View All Reviews</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Share Your Experience
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">
                        Help others by sharing your experience with Dr.{" "}
                        {specialist.name.split(" ")[1]}
                      </p>
                      <Button variant="primary">Write a Review</Button>
                    </div>
                  </CardContent>
                </Card>
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

// Mock data - replace with your actual data source
const specialists = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Pediatric Neurologist",
    specialization: "Child Neurology",
    photo:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    hospital: "Nairobi Children's Hospital",
    location: {
      city: "Nairobi",
      country: "Kenya",
      address: "123 Medical Plaza, 2nd Floor",
    },
    rating: 4.8,
    reviewCount: 124,
    reviewDistribution: { 5: 90, 4: 25, 3: 7, 2: 1, 1: 1 },
    yearsExperience: 15,
    languages: ["English", "Swahili", "French"],
    availability: "available",
    gender: "female",
    bio: "Dr. Sarah Johnson is a board-certified pediatric neurologist with extensive experience in treating neurological disorders in children. She completed her fellowship at Johns Hopkins Hospital and has been practicing in East Africa for the past 8 years.",
    strengths:
      "her patience, thorough examinations, and ability to explain complex conditions in simple terms",
    expertise: [
      "Epilepsy management",
      "Autism spectrum disorders",
      "Cerebral palsy",
      "Developmental delays",
      "Headache disorders",
      "Neuromuscular disorders",
      "Neurogenetic conditions",
      "EEG interpretation",
    ],
    experience: [
      {
        role: "Senior Pediatric Neurologist",
        institution: "Nairobi Children's Hospital",
        period: "2015 - Present",
        description:
          "Leading the pediatric neurology department, overseeing diagnosis and treatment of complex neurological cases in children.",
      },
      {
        role: "Pediatric Neurologist",
        institution: "Aga Khan University Hospital",
        period: "2010 - 2015",
        description:
          "Provided specialized care for children with neurological disorders and trained medical residents.",
      },
    ],
    education: [
      {
        degree: "Fellowship in Pediatric Neurology",
        institution: "Johns Hopkins Hospital, USA",
        period: "2008 - 2010",
      },
      {
        degree: "Residency in Pediatrics",
        institution: "University of Nairobi, Kenya",
        period: "2005 - 2008",
      },
      {
        degree: "MD, Medicine",
        institution: "University of Nairobi, Kenya",
        period: "1998 - 2004",
      },
    ],
    services: [
      {
        name: "Initial Consultation",
        description:
          "Comprehensive evaluation including medical history review and neurological examination",
        duration: "60 mins",
      },
      {
        name: "Follow-up Visit",
        description: "Progress evaluation and treatment plan adjustment",
        duration: "30 mins",
      },
      {
        name: "EEG Interpretation",
        description: "Analysis of electroencephalogram results",
        duration: "45 mins",
      },
      {
        name: "Developmental Assessment",
        description:
          "Evaluation of developmental milestones and potential delays",
        duration: "90 mins",
      },
    ],
    conditionsTreated: [
      "Epilepsy",
      "Seizure disorders",
      "Autism",
      "ADHD",
      "Cerebral palsy",
      "Muscular dystrophy",
      "Tourette syndrome",
      "Migraines",
      "Neurodevelopmental disorders",
    ],
    reviews: [
      {
        name: "James Mwangi",
        date: "2 weeks ago",
        rating: 5,
        comment:
          "Dr. Johnson was incredibly patient with my son who has autism. She took the time to explain everything clearly and made us feel comfortable throughout the process.",
      },
      {
        name: "Amina Hassan",
        date: "1 month ago",
        rating: 4,
        comment:
          "Very knowledgeable and professional. The only reason I didn't give 5 stars is because the wait time was a bit long.",
      },
    ],
    researchInterests: [
      "Epilepsy in developing countries",
      "Neurodevelopmental outcomes of childhood illnesses",
      "Autism spectrum disorders in Africa",
      "EEG biomarkers for neurological conditions",
    ],
    phone: "+254 712 345 678",
    email: "s.johnson@nairobichildrens.org",
    website: "https://nairobichildrens.org/doctors/sjohnson",
    rates: {
      inPerson: 120,
      video: 90,
      chat: 60,
    },
  },
];

export default SpecialistProfileView;
