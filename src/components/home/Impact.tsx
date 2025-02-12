import React from 'react';
import { Users, Stethoscope, GraduationCap, Activity } from 'lucide-react';

const stats = [
  { icon: Users, value: '2,500+', label: 'Children Helped', color: 'from-blue-500 to-blue-600' },
  { icon: Stethoscope, value: '15+', label: 'Partner Hospitals', color: 'from-cyan-500 to-cyan-600' },
  { icon: GraduationCap, value: '200+', label: 'Trained Professionals', color: 'from-indigo-500 to-indigo-600' },
  { icon: Activity, value: '85%', label: 'Success Rate', color: 'from-purple-500 to-purple-600' },
];

export function Impact() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Making a real difference in child neurology care across East Africa
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl transform rotate-6 group-hover:rotate-4 transition-transform duration-300" />
              <div className="relative p-8 bg-white rounded-2xl shadow-lg group-hover:translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} mb-6`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}