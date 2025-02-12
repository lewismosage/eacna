import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Mission() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-blue-500/[0.03] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80"
                alt="Medical professionals collaborating"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <blockquote className="text-white text-lg font-medium">
                  "Together, we're building a brighter future for children with neurological conditions in East Africa."
                </blockquote>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Our Mission & Vision</h2>
              <p className="text-lg text-gray-600 mb-8">
                We strive to revolutionize child neurology care in East Africa through excellence in education, research, and clinical practice.
              </p>
            </div>

            <div className="space-y-6">
              {[
                'Provide world-class neurological care to every child',
                'Train the next generation of pediatric neurologists',
                'Advance research in child neurology',
                'Build sustainable healthcare systems'
              ].map((item) => (
                <div key={item} className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            <button className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Learn About Our Approach
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}