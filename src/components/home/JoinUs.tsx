import React from 'react';
import { ArrowRight } from 'lucide-react';

export function JoinUs() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-blue-900/90 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Join Us in Making a Difference
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're a medical professional, researcher, or supporter, there's a place for you in our mission to transform child neurology care in East Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-blue-900 bg-white hover:bg-blue-50 transition-colors">
              Become a Member
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-transparent border-2 border-white hover:bg-white/10 transition-colors">
              Support Our Cause
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}