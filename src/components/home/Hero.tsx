import React from 'react';
import { ArrowRight, Brain, HeartPulse, Stethoscope } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 z-0 scale-105 transform transition-transform duration-1000"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-blue-950/95" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-300/20">
              <span className="text-blue-200 text-sm font-medium">Transforming Child Neurology Care</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Empowering the Future of
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text"> Child Neurology</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-xl">
              Join us in revolutionizing neurological care for children across East Africa through cutting-edge education, research, and advocacy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                Join Our Mission
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-6 p-8">
            {[
              { icon: Brain, title: 'Expert Care', desc: 'Specialized pediatric neurology services' },
              { icon: HeartPulse, title: 'Research', desc: 'Advancing treatment methods' },
              { icon: Stethoscope, title: 'Training', desc: 'Professional development' },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <item.icon className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-blue-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-10" />
    </div>
  );
}