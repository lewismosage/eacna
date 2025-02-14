import React from 'react';
import { ArrowRight, Heart, Users, Globe, Award, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export function JoinMission() {
  const opportunities = [
    {
      icon: Users,
      title: "Medical Professionals",
      description: "Join our network of dedicated healthcare providers and contribute to improving child neurology care across East Africa.",
      benefits: [
        "Access to specialized training programs",
        "Collaboration with regional experts",
        "Research opportunities",
        "Professional development resources"
      ]
    },
    {
      icon: Lightbulb,
      title: "Researchers",
      description: "Contribute to groundbreaking research in child neurology and help advance our understanding of neurological conditions.",
      benefits: [
        "Research funding opportunities",
        "Access to research facilities",
        "Publication support",
        "Collaborative projects"
      ]
    },
    {
      icon: Heart,
      title: "Volunteers",
      description: "Support our mission through volunteer work and help make a difference in children's lives.",
      benefits: [
        "Community outreach programs",
        "Event organization",
        "Patient support initiatives",
        "Administrative support"
      ]
    },
    {
      icon: Globe,
      title: "International Partners",
      description: "Partner with us to create global impact and foster knowledge exchange in child neurology.",
      benefits: [
        "Cross-border collaborations",
        "Knowledge sharing platforms",
        "Joint research initiatives",
        "Cultural exchange programs"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Be part of a transformative movement in East African child neurology. Together, we can make a lasting impact on children's lives.
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Ways to Get Involved</h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover how you can contribute to our mission and make a difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {opportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            return (
              <div key={opportunity.title} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900">{opportunity.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{opportunity.description}</p>
                <div className="space-y-3">
                  {opportunity.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center">
                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/membership"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Become a Member
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}