import { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import Card from '../../components/common/Card';

interface SpecialistApplication {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  title: string;
  specialization: string;
  other_specialization: string;
  years_experience: number;
  hospital: string;
  city: string;
  country: string;
  photo_url?: string;
  languages: {
    english: boolean;
    swahili: boolean;
    french: boolean;
    kinyarwanda: boolean;
    luganda: boolean;
    luo: boolean;
    other: boolean;
    other_language?: string;
  };
  expertise: string[];
  affiliations: string[];
  bio: string;
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  experience: {
    role: string;
    institution: string;
    period: string;
    description: string;
  }[];
  certifications?: string;
  research_interests?: string[];
  services: {
    name: string;
    description: string;
    duration: string;
  }[];
  conditions_treated: string[];
  availability: 'available' | 'limited' | 'unavailable';
}

interface ApplicationsContentProps {
  supabase: SupabaseClient;
}

export default function ApplicationsContent({ supabase }: ApplicationsContentProps) {
  const [applications, setApplications] = useState<SpecialistApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<SpecialistApplication | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('specialist_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data as SpecialistApplication[] || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load applications. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewApplication = (application: SpecialistApplication) => {
    setSelectedApplication(application);
    setIsViewOpen(true);
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (confirm(`Are you sure you want to ${status} this application?`)) {
      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from('specialist_applications')
          .update({ status })
          .eq('id', id);

        if (error) throw error;

        // If approved, add to specialists directory
        if (status === 'approved') {
          const application = applications.find(app => app.id === id);
          if (application) {
            const { error: specialistError } = await supabase
              .from('specialists')
              .insert([{
                first_name: application.first_name,
                last_name: application.last_name,
                email: application.email,
                phone: application.phone,
                gender: application.gender,
                title: application.title,
                specialization: application.specialization === 'Other' ? 
                  application.other_specialization : application.specialization,
                years_experience: application.years_experience,
                hospital: application.hospital,
                city: application.city,
                country: application.country,
                photo_url: application.photo_url,
                languages: application.languages,
                expertise: application.expertise,
                affiliations: application.affiliations,
                bio: application.bio,
                education: application.education,
                experience: application.experience,
                certifications: application.certifications,
                research_interests: application.research_interests,
                services: application.services,
                conditions_treated: application.conditions_treated,
                availability: application.availability
              }]);

            if (specialistError) throw specialistError;
          }
        }

        fetchApplications();
        setNotification({
          type: 'success',
          message: `Application ${status} successfully!`
        });
        setIsViewOpen(false);
      } catch (error) {
        console.error(`Error ${status} application:`, error);
        setNotification({
          type: 'error',
          message: `Failed to ${status} application. Please try again.`
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = searchTerm === '' || 
      `${application.first_name} ${application.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (application.specialization === 'Other' && 
       application.other_specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      application.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportApplications = async () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Specialization', 'Hospital', 'City', 'Country', 'Status', 'Applied On'];
      const csvContent = [
        headers.join(','),
        ...filteredApplications.map(app => 
          `"${app.first_name} ${app.last_name}","${app.email}","${app.specialization === 'Other' ? app.other_specialization : app.specialization}","${app.hospital}","${app.city}","${app.country}","${app.status}","${new Date(app.created_at).toLocaleDateString()}"`
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eacna-applications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        type: 'success',
        message: 'Applications exported successfully!'
      });
    } catch (error) {
      console.error('Error exporting applications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to export applications. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specialist Applications</h1>
          <p className="text-gray-500 mt-1">
            {applications.length} total applications ({applications.filter(a => a.status === 'pending').length} pending)
          </p>
        </div>
        <button 
          onClick={exportApplications}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" /> Export
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-md flex items-start justify-between ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mr-2 text-green-600" />
            ) : (
              <X className="w-5 h-5 mr-2 text-red-600" />
            )}
            <p>{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Loading applications...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map(application => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.specialization === 'Other' ? 
                          application.other_specialization : application.specialization}
                      </div>
                      <div className="text-sm text-gray-500">{application.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.hospital}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.city}, {application.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => viewApplication(application)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Application"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              className="text-green-600 hover:text-green-800"
                              title="Approve Application"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-800"
                              title="Reject Application"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm || statusFilter !== 'all' ? (
              <p className="text-gray-500">No applications match your search criteria.</p>
            ) : (
              <p className="text-gray-500">No applications found.</p>
            )}
          </div>
        )}
      </Card>
      
      {/* Application View Modal */}
      {isViewOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Application from {selectedApplication.first_name} {selectedApplication.last_name}
              </h3>
              <button 
                onClick={() => setIsViewOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                  {selectedApplication.photo_url ? (
                    <img 
                      src={selectedApplication.photo_url} 
                      alt={`${selectedApplication.first_name} ${selectedApplication.last_name}`}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">{selectedApplication.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">{selectedApplication.title}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">
                        {selectedApplication.hospital}, {selectedApplication.city}, {selectedApplication.country}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Specialization</p>
                        <p className="text-gray-900">
                          {selectedApplication.specialization === 'Other' ? 
                            selectedApplication.other_specialization : selectedApplication.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                        <p className="text-gray-900">{selectedApplication.years_experience}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Languages Spoken</p>
                        <p className="text-gray-900">
                          {[
                            ...Object.entries(selectedApplication.languages)
                              .filter(([key, value]) => value && key !== 'other_language')
                              .map(([key]) => key === 'other' ? 
                                selectedApplication.languages.other_language : key),
                          ].join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Availability</p>
                        <p className="text-gray-900">
                          {selectedApplication.availability === 'available' ? 'Available for new patients' :
                           selectedApplication.availability === 'limited' ? 'Limited availability' :
                           'Not accepting new patients'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Areas of Expertise</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.expertise.map((expertise, index) => (
                          <span key={index} className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm">
                            {expertise}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Professional Affiliations</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.affiliations.length > 0 ? (
                          selectedApplication.affiliations.map((affiliation, index) => (
                            <span key={index} className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm">
                              {affiliation}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">None specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Education</h4>
                    <div className="space-y-4">
                      {selectedApplication.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-primary-500 pl-4 py-1">
                          <h4 className="font-medium text-gray-800">{edu.degree}</h4>
                          <p className="text-sm text-primary-600">{edu.institution}</p>
                          <p className="text-xs text-gray-500">{edu.period}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Experience</h4>
                    <div className="space-y-4">
                      {selectedApplication.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-primary-500 pl-4 py-1">
                          <h4 className="font-medium text-gray-800">{exp.role}</h4>
                          <p className="text-sm text-primary-600">{exp.institution}</p>
                          <p className="text-xs text-gray-500 mb-1">{exp.period}</p>
                          {exp.description && <p className="text-sm text-gray-700">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Professional Bio</h4>
                    <p className="text-gray-700">{selectedApplication.bio}</p>
                  </div>
                  
                  {selectedApplication.certifications && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary-800 mb-2">Certifications & Licenses</h4>
                      <p className="text-gray-700">{selectedApplication.certifications}</p>
                    </div>
                  )}
                  
                  {selectedApplication.research_interests && selectedApplication.research_interests.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary-800 mb-2">Research Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.research_interests.map((interest, index) => (
                          <span key={index} className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Services Offered</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-primary-700">{service.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <p className="text-xs text-gray-500">Duration: {service.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">Conditions Treated</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.conditions_treated.map((condition, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedApplication.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsViewOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    disabled={isProcessing}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Reject Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                    disabled={isProcessing}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Approve Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}