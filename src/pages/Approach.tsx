import React, { useEffect } from 'react';
import { Stethoscope, GraduationCap, Users, BookOpen, LineChart, Globe } from 'lucide-react';

export function Approach() {
  useEffect(() => {
    window.scrollTo(0, 0); // Ensures the page opens at the top
  }, []);

  const pillars = [
    {
      icon: Stethoscope,
      title: "Clinical Excellence",
      description: "Our approach to clinical care combines evidence-based practices with personalized attention to each child's unique needs.",
      points: [
        "Comprehensive neurological assessments",
        "Individualized treatment plans",
        "Regular monitoring and evaluation",
        "Family-centered care approach"
      ]
    },
    {
      icon: GraduationCap,
      title: "Education & Training",
      description: "We invest heavily in education and professional development to build a strong foundation of expertise in child neurology.",
      points: [
        "Specialized training programs",
        "Continuous professional development",
        "Mentorship opportunities",
        "Skills enhancement workshops"
      ]
    },
    {
      icon: LineChart,
      title: "Research & Innovation",
      description: "Our research initiatives focus on advancing understanding and treatment of neurological conditions affecting children in East Africa.",
      points: [
        "Clinical research programs",
        "Data-driven decision making",
        "Innovation in treatment methods",
        "Regional health studies"
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
              Our Approach
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              A comprehensive strategy to transform child neurology care in East Africa
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Comprehensive Care Framework
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our approach combines clinical excellence, education, and research to provide comprehensive neurological care for children across East Africa. We believe in sustainable, long-term solutions that build capacity within the region.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{pillar.title}</h3>
                <p className="text-gray-600 mb-6">{pillar.description}</p>
                <ul className="space-y-3">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-start">
                      <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Implementation Strategy */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Implementation Strategy</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Short-term Goals</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Establish regional training centers</span>
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Implement telemedicine programs</span>
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Launch research initiatives</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Long-term Vision</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Create centers of excellence</span>
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Develop regional expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">Establish sustainable programs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}