import React, { useEffect, useState } from "react";
import { Shield, Award, Users, BookOpen, Heart, Star } from "lucide-react";
import { Register } from "./Register"; // Import the Register component

export function Membership() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); // Ensures the page opens at the top
  }, []);

  const benefits = [
    {
      icon: Shield,
      title: "Professional Recognition",
      description:
        "Join a respected community of child neurology professionals",
    },
    {
      icon: Award,
      title: "Exclusive Access",
      description: "Get access to specialized resources and research materials",
    },
    {
      icon: Users,
      title: "Networking",
      description: "Connect with peers and experts in the field",
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access continuing education and training materials",
    },
    {
      icon: Heart,
      title: "Community Impact",
      description:
        "Contribute to improving child neurology care in East Africa",
    },
    {
      icon: Star,
      title: "Events & Conferences",
      description: "Priority registration and discounts for events",
    },
  ];

  const membershipTiers = [
    {
      name: "Associate Member",
      price: "KSH 10,000/year",
      description: "For early-career professionals and residents",
      features: [
        "Access to online resources",
        "Newsletter subscription",
        "Networking opportunities",
        "Discounted event tickets",
      ],
    },
    {
      name: "Full Member",
      price: "KSH 20,000/year",
      description: "For established healthcare professionals",
      features: [
        "All Associate benefits",
        "Voting rights",
        "Research collaboration opportunities",
        "Committee participation",
        "Publication opportunities",
      ],
    },
    {
      name: "Fellow Member",
      price: "KSH 30,000/year",
      description: "For senior professionals and leaders",
      features: [
        "All Full Member benefits",
        "Leadership opportunities",
        "Mentorship program access",
        "Priority speaking opportunities",
        "Research grant eligibility",
      ],
    },
  ];

  if (showRegisterForm) {
    return <Register />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Become a Member
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join our community of dedicated professionals working to improve
              child neurology care in East Africa
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Membership Benefits
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover the advantages of being part of EACNA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <Icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Membership Tiers */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Membership Tiers</h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the membership level that best suits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {membershipTiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tier.name}
                </h3>
                <p className="text-4xl font-bold text-blue-600 mb-6">
                  {tier.price}
                </p>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-gray-700"
                    >
                      <Shield className="h-5 w-5 text-blue-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowRegisterForm(true)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
