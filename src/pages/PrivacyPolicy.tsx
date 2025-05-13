import React from 'react';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy | East African Child Neurology Association (EACNA) Specialist Directory</title>
        <meta name="description" content="Learn how we collect, use, and protect your personal information on our pediatric neurology specialist directory." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-800 p-6 text-white">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="p-6 sm:p-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to the East African Child Neurology Association (EACNA) Specialist Directory ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our directory services.
            </p>
            <p>
              By accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">2. Information We Collect</h2>
            <h3 className="font-medium mb-2">2.1 Personal Information</h3>
            <p className="mb-4">
              We may collect the following personal information when you register as a specialist or use our directory:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Full name, contact details (email, phone number)</li>
              <li>Professional credentials and qualifications</li>
              <li>Work history and educational background</li>
              <li>Practice location and availability</li>
              <li>Payment information for premium services</li>
              <li>Profile photo and professional biography</li>
            </ul>

            <h3 className="font-medium mb-2">2.2 Non-Personal Information</h3>
            <p>
              We automatically collect certain technical information when you visit our website:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on site</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and maintain your professional profile in our directory</li>
              <li>To facilitate connections between specialists and patients</li>
              <li>To improve and personalize our services</li>
              <li>To communicate with you about your account or our services</li>
              <li>To process payments for premium services</li>
              <li>To comply with legal obligations and protect our rights</li>
              <li>For research and analytics to improve our platform</li>
            </ul>

            <section className="mb-8 mt-8"> 
              <h2 className="text-xl font-semibold text-primary-700 mb-4">3.2 Membership Data Processing</h2>
              <p className="mb-4">
                For EACNA members, we process additional professional information to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Verify your professional credentials and qualifications</li>
                <li>Maintain membership records and status</li>
                <li>Process membership fees and renewals</li>
                <li>Provide member-specific services and benefits</li>
                <li>Facilitate professional networking opportunities</li>
              </ul>
              
              <h3 className="font-medium mb-2">Membership Categories Data Requirements:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Membership Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Data Collected</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Full Member</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        Medical credentials, certification documents, practice details, payment information
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">5 years after membership ends</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Associate Member</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        Professional qualifications, reference contacts, area of interest
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">3 years after membership ends</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Student Member</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        Proof of enrollment, academic supervisor contact
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">2 years after membership ends</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With patients:</strong> Your professional profile information will be visible to users searching our directory</li>
              <li><strong>Service providers:</strong> With third parties who assist in operating our website and services</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our legal rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Secure server infrastructure with encryption</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no internet transmission or electronic storage is completely secure, so we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">6. Your Rights</h2>
            <p className="mb-4">Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to access and receive a copy of your data</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to request deletion of your data</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@pedneurodirectory.org.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-700 mb-4">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
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

export default PrivacyPolicy;