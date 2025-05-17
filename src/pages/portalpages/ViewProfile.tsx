import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Calendar, BookOpen, Award, Download, Printer, ExternalLink, Edit } from 'lucide-react';

// Mock user data for demonstration
const MOCK_USER = {
  firstName: "Lewis",
  lastName: "Mosage",
  email: "lewis.mosage@example.com",
  profileImage: null,
  role: "Associate Member",
  joinDate: "May 2024",
  country: "Kenya",
  city: "Nairobi",
  specialization: "Pediatric Neurology",
  institution: "Nairobi Children's Hospital",
  bio: "Pediatric neurologist specializing in childhood epilepsy treatment and research. Passionate about improving access to quality neurological care across East Africa.",
  education: [
    {
      degree: "MD, Medicine",
      institution: "University of Nairobi",
      year: "2015"
    },
    {
      degree: "Fellowship in Pediatric Neurology",
      institution: "Aga Khan University Hospital",
      year: "2019"
    }
  ],
  publications: [
    {
      title: "Childhood Epilepsy Management in Resource-Limited Settings",
      journal: "East African Medical Journal",
      year: "2023",
      url: "#"
    },
    {
      title: "Telemedicine for Epilepsy Follow-up in Rural Kenya",
      journal: "Digital Health",
      year: "2022",
      url: "#"
    }
  ],
  certifications: [
    {
      title: "PET1 Certification",
      organization: "EACNA",
      year: "2022"
    },
    {
      title: "PET2 Certification",
      organization: "EACNA",
      year: "2023"
    }
  ]
};

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const ProfileHeader = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Profile Image */}
        <div className="relative">
          {MOCK_USER.profileImage ? (
            <img 
              src={MOCK_USER.profileImage} 
              alt={`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-4xl border-4 border-white shadow">
              {MOCK_USER.firstName.charAt(0)}{MOCK_USER.lastName.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            Dr. {MOCK_USER.firstName} {MOCK_USER.lastName}
          </h1>
          <p className="text-primary-600 font-medium">{MOCK_USER.role}</p>
          <p className="text-gray-600 mt-1">{MOCK_USER.specialization}</p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{MOCK_USER.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{MOCK_USER.city}, {MOCK_USER.country}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Member since {MOCK_USER.joinDate}</span>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Button */}
        <Link 
          to="/portal/profile/settings" 
          className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-primary-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </Link>
      </div>
      
      {/* Bio */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="font-medium text-gray-700 mb-2">About</h3>
        <p className="text-gray-600">{MOCK_USER.bio}</p>
      </div>
    </div>
  );
  
  const ProfileTabs = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'education'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Education
        </button>
        <button
          onClick={() => setActiveTab('publications')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'publications'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Publications
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'certifications'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Certifications
        </button>
      </div>
    </div>
  );
  
  const Overview = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Overview</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Current Position</h3>
          <p className="text-gray-600">
            {MOCK_USER.specialization} at {MOCK_USER.institution}
          </p>
        </div>
      
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Education</h3>
          <div className="space-y-2">
            {MOCK_USER.education.map((edu, index) => (
              <div key={index} className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600">
                  {edu.degree}, {edu.institution}, {edu.year}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Certifications</h3>
          <div className="space-y-2">
            {MOCK_USER.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600">
                  {cert.title}, {cert.organization}, {cert.year}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Recent Publications</h3>
          <div className="space-y-2">
            {MOCK_USER.publications.slice(0, 2).map((pub, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="pt-1">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{pub.title}</p>
                  <p className="text-gray-600 text-sm">
                    {pub.journal}, {pub.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const Education = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Education & Training</h2>
      
      <div className="space-y-6">
        {MOCK_USER.education.map((edu, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                <p className="text-gray-600">{edu.institution}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {edu.year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const Publications = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Publications</h2>
      
      <div className="space-y-6">
        {MOCK_USER.publications.map((pub, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <h3 className="font-medium text-gray-800">{pub.title}</h3>
            <p className="text-gray-600 mt-1">{pub.journal}, {pub.year}</p>
            <a 
              href={pub.url} 
              className="text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Publication</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
  
  const Certifications = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Certifications</h2>
      
      <div className="space-y-6">
        {MOCK_USER.certifications.map((cert, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{cert.title}</h3>
                <p className="text-gray-600">{cert.organization}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {cert.year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">Member Profile</h1>
      
      <ProfileHeader />
      <ProfileTabs />
      
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'education' && <Education />}
      {activeTab === 'publications' && <Publications />}
      {activeTab === 'certifications' && <Certifications />}
    </div>
  );
};

export default ViewProfile;