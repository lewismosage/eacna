import React from 'react';
import { Helmet } from 'react-helmet';

const TermsOfService = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Terms of Service | Pediatric Neurology Specialist Directory</title>
        <meta name="description" content="Terms and conditions governing the use of our pediatric neurology specialist directory services." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-800 p-6 text-white">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="p-6 sm:p-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using the East African Child Neurology Association (EACNA) Specialist Directory ("the Directory"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our services.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of the Directory after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              The Pediatric Neurology Specialist Directory provides:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>A platform for pediatric neurology specialists to create professional profiles</li>
              <li>A searchable directory for patients and healthcare providers to find specialists</li>
              <li>Tools for professional networking and collaboration</li>
              <li>Educational resources and practice management tools</li>
            </ul>
            <p>
              The Directory does not provide medical advice or establish doctor-patient relationships.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">3. User Accounts</h2>
            <h3 className="font-medium mb-2">3.1 Registration</h3>
            <p className="mb-4">
              To create a specialist profile, you must:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Be a qualified pediatric neurology specialist in good standing</li>
            </ul>

            <h3 className="font-medium mb-2">3.2 Account Responsibilities</h3>
            <p className="mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>All activities under your account</li>
              <li>Maintaining accurate and current profile information</li>
              <li>Complying with all applicable laws and professional standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">4. Membership Terms</h2>
            
            <h3 className="font-medium mb-2">4.1 Membership Eligibility</h3>
            <p className="mb-4">
              EACNA membership is available to qualified professionals and institutions meeting the following criteria:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Full Members: Certified pediatric neurologists practicing in East Africa</li>
              <li>Associate Members: Allied professionals or those in related fields</li>
              <li>Student Members: Currently enrolled in medical or neuroscience programs</li>
              <li>Institutional Members: Recognized medical or research institutions</li>
            </ul>

            <h3 className="font-medium mb-2">4.2 Membership Obligations</h3>
            <p className="mb-4">
              By becoming an EACNA member, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Maintain accurate and current professional information</li>
              <li>Adhere to the EACNA Code of Professional Conduct</li>
              <li>Pay membership fees promptly</li>
              <li>Notify EACNA of any changes affecting your membership status</li>
            </ul>

            <h3 className="font-medium mb-2">4.3 Membership Fees</h3>
            <p className="mb-2">
              Current annual membership fees (subject to change with 30 days notice):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Full Members: KSH 15,000</li>
              <li>Associate Members: KSH 10,000</li>
              <li>Student Members: KSH 5,000</li>
              <li>Institutional Members: KSH 5,000</li>
            </ul>
            <p>
              Fees are non-refundable except as required by Kenyan law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">5. Code of Conduct</h2>
            <p className="mb-4">
              All EACNA members must adhere to our professional standards:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain highest ethical standards in professional practice</li>
              <li>Respect patient confidentiality and data privacy</li>
              <li>Engage in respectful professional discourse</li>
              <li>Accurately represent qualifications and expertise</li>
              <li>Disclose conflicts of interest appropriately</li>
            </ul>
            <p className="mt-4">
              Violations may result in membership suspension or termination after review by the Ethics Committee.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">6. Fees and Payments</h2>
            <p className="mb-4">
              Basic profile listings are free. Premium services may require payment of fees as described on our website. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Pay all applicable fees</li>
              <li>Provide accurate billing information</li>
              <li>Notify us of any billing disputes within 30 days</li>
            </ul>
            <p>
              Fees are non-refundable except as required by law or at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">7. Disclaimer of Warranties</h2>
            <p className="mb-4">
              The Directory is provided "as is" without warranties of any kind. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The service will be uninterrupted or error-free</li>
              <li>The content is accurate or complete</li>
              <li>The service will meet your specific requirements</li>
            </ul>
            <p>
              We disclaim all warranties, express or implied, including implied warranties of merchantability and fitness for a particular purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, we shall not be liable for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data or profits</li>
              <li>Damages resulting from use or inability to use the service</li>
            </ul>
            <p>
              Our total liability for any claims related to these Terms shall not exceed the amount you paid us in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">9. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account at any time without notice for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violation of these Terms</li>
              <li>Requests by law enforcement</li>
              <li>Unexpected technical or security issues</li>
            </ul>
            <p>
              You may terminate your account at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">10. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by the laws of Kenya, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes shall be resolved in the courts of Nairobi, Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-700 mb-4">11. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <address className="mt-2 not-italic">
              5th Ngong Avenue<br />
              Avenue Suites
              6th Floor, Suite 8<br />
              Nairobi, Kenya<br />
              Email: info@eacna.co.ke<br />
              Phone: +254 700 123 456
            </address>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;