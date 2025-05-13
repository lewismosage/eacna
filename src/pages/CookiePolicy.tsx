import React from 'react';
import { Helmet } from 'react-helmet';

const CookiePolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Cookie Policy | Pediatric Neurology Specialist Directory</title>
        <meta name="description" content="Information about how we use cookies and similar technologies on our pediatric neurology specialist directory." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-800 p-6 text-white">
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
          <p className="mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="p-6 sm:p-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">1. What Are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files stored on your device when you visit websites. They help websites remember information about your visit, which can make the site more useful and improve your experience.
            </p>
            <p>
              Our Pediatric Neurology Specialist Directory uses cookies and similar tracking technologies to enhance functionality and analyze site usage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">2. Types of Cookies We Use</h2>
            <h3 className="font-medium mb-2">2.1 Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to your actions (e.g., logging in or filling forms).
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Session management</li>
              <li>Authentication</li>
              <li>Security features</li>
            </ul>

            <h3 className="font-medium mb-2">2.2 Performance Cookies</h3>
            <p className="mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Google Analytics</li>
              <li>Page load times</li>
              <li>Navigation paths</li>
            </ul>

            <h3 className="font-medium mb-2">2.3 Functionality Cookies</h3>
            <p className="mb-4">
              These cookies enable enhanced features and personalization. They may be set by us or third-party providers.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Language preferences</li>
              <li>Region-specific settings</li>
              <li>Remembering search filters</li>
            </ul>

            <h3 className="font-medium mb-2">2.4 Targeting/Advertising Cookies</h3>
            <p className="mb-4">
              These cookies may be set through our site by advertising partners to build a profile of your interests.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Social media integration</li>
              <li>Remarketing campaigns</li>
              <li>Interest-based advertising</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">3. Managing Cookies</h2>
            <p className="mb-4">
              You can control and/or delete cookies as you wish. Most web browsers allow some control of cookies through browser settings. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Delete all cookies from your browser</li>
              <li>Block all cookies</li>
              <li>Set preferences for certain websites</li>
            </ul>
            <p>
              However, if you disable essential cookies, parts of our website may not work properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We may use services from third parties that set their own cookies, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Payment processors for subscription services</li>
              <li>Social media platforms for sharing features</li>
              <li>Advertising networks for relevant promotions</li>
            </ul>
            <p>
              We do not control these third-party cookies. Please refer to the respective privacy policies of these providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting the new policy on our website with a new "Last Updated" date. We recommend reviewing this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">6. Membership Portal Cookies</h2>
            <p className="mb-4">
              Our membership portal uses additional cookies to enhance your experience:
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Cookie Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Purpose</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">eacna_auth</td>
                    <td className="px-4 py-2 text-sm text-gray-700">Maintains your membership login session</td>
                    <td className="px-4 py-2 text-sm text-gray-700">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">eacna_prefs</td>
                    <td className="px-4 py-2 text-sm text-gray-700">Stores your membership portal preferences</td>
                    <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">eacna_renew</td>
                    <td className="px-4 py-2 text-sm text-gray-700">Tracks membership renewal status</td>
                    <td className="px-4 py-2 text-sm text-gray-700">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="mt-4">
              These essential cookies cannot be disabled as they are required for membership portal functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-700 mb-4">7. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
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

export default CookiePolicy;