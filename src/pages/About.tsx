import React from 'react';
import { Award, Brain, GraduationCap, Users, HeartHandshake, Globe } from 'lucide-react';

const teamMembers = [
  {
    name: "Dr. Samson Gwer",
    role: "President",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80",
    bio: "Leading pediatric neurologist with 15 years of experience in East Africa"
  },
  {
    name: "Elizabeth Ombech",
    role: "Director, Progams and Operations",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80",
    bio: "Results-driven leader with extensive experience in program development, operational strategy, and team management. Committed to driving impact through efficient program execution and organizational excellence."
  },
  {
    name: "Vanessa Akoth",
    role: "Communications Associate",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80",
    bio: "Dynamic communications professional with expertise in strategic messaging, content creation, and media relations. Passionate about crafting compelling narratives that enhance brand presence and engagement."
  },
];

const milestones = [
  {
    year: "2018",
    title: "Foundation",
    description: "EACNA was established with a vision to transform child neurology care"
  },
  {
    year: "2020",
    title: "First Conference",
    description: "Hosted the inaugural East African Child Neurology Conference"
  },
  {
    year: "2022",
    title: "Research Center",
    description: "Launched the region's first dedicated pediatric neurology research center"
  },
  {
    year: "2023",
    title: "Training Program",
    description: "Initiated the comprehensive training program for pediatric neurologists"
  }
];

export function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-blue-900/80" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-6">About EACNA</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Transforming child neurology care across East Africa through innovation,
            education, and compassionate healthcare delivery.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide our mission and vision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Excellence", desc: "Maintaining the highest standards in neurological care" },
              { icon: HeartHandshake, title: "Compassion", desc: "Treating every child with empathy and understanding" },
              { icon: GraduationCap, title: "Education", desc: "Continuous learning and professional development" },
              { icon: Users, title: "Collaboration", desc: "Working together to achieve better outcomes" },
              { icon: Award, title: "Innovation", desc: "Pioneering new approaches in child neurology" },
              { icon: Globe, title: "Accessibility", desc: "Making quality care available to all" }
            ].map((value) => (
              <div key={value.title} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all">
                <value.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Leadership Team</h2>
            <p className="mt-4 text-lg text-gray-600">
              Meet the experts leading our mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Journey</h2>
            <p className="mt-4 text-lg text-gray-600">
              Key milestones in our mission to transform child neurology care
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className="w-full md:w-5/12">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <span className="text-blue-600 font-bold">{milestone.year}</span>
                      <h3 className="text-xl font-semibold mt-2">{milestone.title}</h3>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}