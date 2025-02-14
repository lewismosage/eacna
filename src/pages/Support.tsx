import React, { useEffect } from 'react';
import { Heart, Gift, Users, Coins, Calendar, HandHeart } from 'lucide-react';

export function Support() {
  useEffect(() => {
    window.scrollTo(0, 0); // Ensures the page opens at the top
  }, []);
  const ways = [
    {
      icon: Gift,
      title: "Make a Donation",
      description: "Support our programs through financial contributions",
      action: "Donate Now",
      href: "#donate"
    },
    {
      icon: Users,
      title: "Corporate Partnership",
      description: "Partner with us to create lasting impact",
      action: "Become a Partner",
      href: "#partner"
    },
    {
      icon: Calendar,
      title: "Fundraising Events",
      description: "Organize or participate in fundraising events",
      action: "View Events",
      href: "#events"
    }
  ];

  const impactAreas = [
    {
      title: "Medical Equipment",
      description: "Help us provide essential medical equipment to hospitals and clinics",
      amount: "$10,000",
      progress: 65
    },
    {
      title: "Training Programs",
      description: "Support professional development programs for healthcare workers",
      amount: "$25,000",
      progress: 40
    },
    {
      title: "Research Initiatives",
      description: "Fund critical research in child neurology",
      amount: "$50,000",
      progress: 25
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Support Our Cause
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Help us make quality neurological care accessible to every child in East Africa
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Ways to Support */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Ways to Support</h2>
          <p className="mt-4 text-lg text-gray-600">
            Every contribution makes a difference in a child's life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {ways.map((way) => {
            const Icon = way.icon;
            return (
              <div key={way.title} className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{way.title}</h3>
                <p className="text-gray-600 mb-6">{way.description}</p>
                <a
                  href={way.href}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {way.action}
                </a>
              </div>
            );
          })}
        </div>

        {/* Current Initiatives */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Current Initiatives</h3>
          <div className="space-y-8">
            {impactAreas.map((area) => (
              <div key={area.title} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{area.title}</h4>
                    <p className="text-gray-600">{area.description}</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{area.amount}</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {area.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${area.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Make a Donation</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Donation Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <HandHeart className="h-5 w-5 mr-2" />
                Complete Donation </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}