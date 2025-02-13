import React from 'react';

export function LearnMore() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Learn More About EACNA</h1>
        
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-lg text-gray-700">
            The East African Child Neurology Association (EACNA) is a professional network dedicated to advancing pediatric neurology across East Africa. Our mission is to support medical professionals, researchers, and caregivers in understanding, diagnosing, and treating neurological conditions affecting children.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
            <li>Enhance awareness and education about childhood neurological disorders.</li>
            <li>Promote research and knowledge-sharing among medical professionals.</li>
            <li>Support families and caregivers in managing neurological conditions.</li>
            <li>Advocate for improved healthcare policies for children with neurological needs.</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">1. Research & Knowledge Sharing</h3>
              <p className="text-lg text-gray-700">
                We facilitate research and the exchange of medical findings, best practices, and case studies through our Research Library and Member Portal. Members can upload and access research papers, presentations, and reports on various neurological topics.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">2. Training & Capacity Building</h3>
              <p className="text-lg text-gray-700">
                EACNA organizes workshops, webinars, and training programs to equip medical professionals with the latest advancements in pediatric neurology. Our educational initiatives help strengthen neurology care across the region.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">3. Community & Advocacy</h3>
              <p className="text-lg text-gray-700">
                We work closely with policymakers, healthcare providers, and patient advocacy groups to raise awareness and improve the standards of care for children with neurological conditions.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">4. Events & Conferences</h3>
              <p className="text-lg text-gray-700">
                EACNA hosts annual conferences and networking events where experts and members discuss emerging trends, treatments, and breakthroughs in child neurology.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Join Us</h2>
          <p className="text-lg text-gray-700 mb-8">
            Be part of a growing network of professionals and researchers dedicated to transforming child neurology care in East Africa. Whether you’re a doctor, researcher, student, or caregiver, EACNA offers valuable resources and collaboration opportunities.
          </p>
          <button className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Become a Member
          </button>
        </section>
      </div>
    </div>
  );
}