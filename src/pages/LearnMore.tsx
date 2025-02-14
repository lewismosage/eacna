import React from 'react';
import { Brain, Heart, Users, Award, BookOpen, Globe } from 'lucide-react';

export function LearnMore() {
  const sections = [
    {
      title: "Our Vision",
      content: "We envision a future where every child in East Africa has access to world-class neurological care. Through innovation, education, and collaboration, we're working to make this vision a reality.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80"
    },
    {
      title: "Our Impact",
      content: "Since our establishment, we've helped thousands of children, trained hundreds of medical professionals, and established partnerships with leading institutions worldwide.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80"
    },
    {
      title: "Our Community",
      content: "We're building a vibrant community of healthcare professionals, researchers, and advocates dedicated to advancing child neurology care in East Africa.",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80"
    }
  ];

  const highlights = [
    {
      icon: Brain,
      title: "Expert Care",
      description: "Providing specialized neurological care tailored to children's needs"
    },
    {
      icon: Heart,
      title: "Compassionate Approach",
      description: "Treating every child with empathy and understanding"
    },
    {
      icon: Users,
      title: "Collaborative Network",
      description: "Building strong partnerships across the medical community"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining the highest standards in medical care"
    },
    {
      icon: BookOpen,
      title: "Education",
      description: "Continuous learning and professional development"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Creating lasting change in East African healthcare"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Transforming Child Neurology Care
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover how we're revolutionizing neurological care for children across East Africa
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className={`flex flex-col ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            } items-center gap-12 mb-24`}
          >
            <div className="lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          </div>
        ))}

        {/* Highlights Grid */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose EACNA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className="h-12 w-12 text-blue-600 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{highlight.title}</h3>
                  <p className="text-gray-600">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}