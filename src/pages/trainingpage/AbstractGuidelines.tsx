// src/components/abstract/AbstractGuidelines.tsx
import React, { forwardRef } from 'react';
import Section from '../../components/common/Section';
import eacnaLogo from '../../assets/eacnaLogo.jpg';

const AbstractGuidelines = forwardRef<HTMLDivElement>((props, ref) => (
  <Section background="light">
    <div ref={ref} className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
      {/* Header with logo and title for print */}
      <div className="print-header p-6 text-center">
        <div className="flex justify-center mb-4">
          <img 
            src={eacnaLogo}
            alt="EACNA Logo" 
            className="h-16"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Abstract Submission Guidelines</h1>
        <p className="text-gray-600">Annual EACNA Conference - <strong>Dar es Salaam, Tanzania.</strong></p>
      </div>

      <div className="p-6 print:p-0">
        <div className="prose max-w-none print:max-w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">General Information</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Abstracts must be submitted by November 30, 2025.</li>
            <li>Abstracts must be original work that has not been published previously.</li>
            <li>All abstracts must be submitted in English.</li>
            <li>The abstract text should be no more than 300 words (excluding title and authors).</li>
            <li>You will receive notification of acceptance by December 5, 2025.</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Abstract Structure</h3>
          <p className="mb-4">
            Abstracts should be structured with the following sections (for research studies):
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Background:</strong> Clearly state the purpose of the study</li>
            <li><strong>Methods:</strong> Describe the methods used</li>
            <li><strong>Results:</strong> Summarize the results obtained</li>
            <li><strong>Conclusions:</strong> State the conclusions reached</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Review Process</h3>
          <p className="mb-4">
            Abstracts will be peer-reviewed by the Scientific Committee. The following criteria will be considered:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Scientific merit and originality</li>
            <li>Clarity of presentation</li>
            <li>Relevance to pediatric neurology in East Africa</li>
            <li>Potential impact on clinical practice or research</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Presentation Formats</h3>
          <p className="mb-4">
            Accepted abstracts may be selected for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Oral Presentation:</strong> 10-minute presentation followed by 5-minute discussion</li>
            <li><strong>Poster Presentation:</strong> Displayed throughout the conference with dedicated viewing times</li>
          </ul>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            For any questions regarding abstract submission, please contact:
          </p>
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 print:bg-transparent print:border-0">
            <p className="font-medium text-primary-800 print:text-gray-900">EACNA Scientific Committee</p>
            <p className="text-primary-700 print:text-gray-700">Email: abstracts@eacna.org</p>
            <p className="text-primary-700 print:text-gray-700">Phone: +254 700 123 456</p>
          </div>
        </div>

        {/* Footer for print */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500 print:mt-16">
          <p>EACNA - East African Child Neurology Association</p>
          <p>www.eacna.org | info@eacna.org</p>
          <p className="mt-2">Document generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  </Section>
));

export default AbstractGuidelines;