import React from 'react';
import { BookOpen, Heart, Search, Users, Award, Globe } from 'lucide-react';

const values = [
  {
    icon: BookOpen,
    title: 'Education Excellence',
    description: 'Providing comprehensive training and educational resources for healthcare professionals across East Africa.',
  },
  {
    icon: Heart,
    title: 'Compassionate Care',
    description: 'Delivering patient-centered care with empathy and understanding for every child and family.',
  },
  {
    icon: Search,
    title: 'Innovation & Research',
    description: 'Advancing understanding of neurological conditions through groundbreaking collaborative research.',
  },
  {
    icon: Users,
    title: 'Community Impact',
    description: 'Building a supportive network of healthcare professionals, families, and advocates.',
  },
  {
    icon: Award,
    title: 'Clinical Excellence',
    description: 'Maintaining the highest standards of medical practice and patient care.',
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description: 'Partnering with international institutions to bring world-class expertise to East Africa.',
  },
];

export function CoreValues() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Our Core Values</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Guided by our commitment to excellence in child neurology care and education
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}