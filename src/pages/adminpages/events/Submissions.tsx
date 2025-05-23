// src/pages/admin/SubmissionsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Video, User, Mail, Phone, Building, Search, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import Section from '../../../components/common/Section';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertModal from '../../../components/common/AlertModal';
import { format } from 'date-fns';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AbstractSubmission {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  institution: string;
  country: string;
  abstract_title: string;
  abstract_text: string;
  presentation_preference: 'oral' | 'poster' | 'no-preference';
  file_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

interface EventRegistration {
  id: string;
  created_at: string;
  event_id: string;
  event_title: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  special_requirements: string;
  status: 'registered' | 'attended' | 'cancelled';
}

interface WebinarRegistration {
  id: string;
  created_at: string;
  webinar_id: string;
  webinar_title: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  status: 'registered' | 'attended' | 'cancelled';
}

type SubmissionTab = 'abstracts' | 'events' | 'webinars';

const SubmissionsDashboard = () => {
  const [activeTab, setActiveTab] = useState<SubmissionTab>('abstracts');
  const [abstracts, setAbstracts] = useState<AbstractSubmission[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [webinarRegistrations, setWebinarRegistrations] = useState<WebinarRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, message: '' });

  // Fetch all data when component mounts or tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'abstracts') {
          const { data, error } = await supabase
            .from('abstract_submissions')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setAbstracts(data as AbstractSubmission[]);
        } else if (activeTab === 'events') {
          const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setEventRegistrations(data as EventRegistration[]);
        } else if (activeTab === 'webinars') {
          const { data, error } = await supabase
            .from('webinar_registrations')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setWebinarRegistrations(data as WebinarRegistration[]);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredAbstracts = abstracts.filter(abstract => 
  (abstract.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (abstract.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (abstract.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (abstract.abstract_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

const filteredEventRegistrations = eventRegistrations.filter(registration => 
  (registration.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (registration.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (registration.event_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

const filteredWebinarRegistrations = webinarRegistrations.filter(registration => 
  (registration.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (registration.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (registration.webinar_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

  const toggleExpandSubmission = (id: string) => {
    setExpandedSubmission(expandedSubmission === id ? null : id);
  };

  const handleStatusChange = async (type: SubmissionTab, id: string, newStatus: string) => {
    try {
      let tableName = '';
      if (type === 'abstracts') tableName = 'abstract_submissions';
      if (type === 'events') tableName = 'event_registrations';
      if (type === 'webinars') tableName = 'webinar_registrations';

      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      if (type === 'abstracts') {
        setAbstracts(abstracts.map(abstract => 
          abstract.id === id ? { ...abstract, status: newStatus as any } : abstract
        ));
      } else if (type === 'events') {
        setEventRegistrations(eventRegistrations.map(reg => 
          reg.id === id ? { ...reg, status: newStatus as any } : reg
        ));
      } else if (type === 'webinars') {
        setWebinarRegistrations(webinarRegistrations.map(reg => 
          reg.id === id ? { ...reg, status: newStatus as any } : reg
        ));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setAlert({
        open: true,
        title: 'Update Failed',
        message: 'There was an error updating the submission status.',
      });
    }
  };

  const handleDeleteSubmission = async (type: SubmissionTab, id: string) => {
    setAlert({
      open: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this submission? This action cannot be undone.',
      onConfirm: async () => {
        try {
          let tableName = '';
          if (type === 'abstracts') tableName = 'abstract_submissions';
          if (type === 'events') tableName = 'event_registrations';
          if (type === 'webinars') tableName = 'webinar_registrations';

          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Update local state
          if (type === 'abstracts') {
            setAbstracts(abstracts.filter(abstract => abstract.id !== id));
          } else if (type === 'events') {
            setEventRegistrations(eventRegistrations.filter(reg => reg.id !== id));
          } else if (type === 'webinars') {
            setWebinarRegistrations(webinarRegistrations.filter(reg => reg.id !== id));
          }
        } catch (err) {
          console.error("Error deleting submission:", err);
          setAlert({
            open: true,
            title: 'Deletion Failed',
            message: 'There was an error deleting the submission.',
          });
        }
      }
    });
  };

  const downloadSubmissions = async (type: SubmissionTab) => {
    try {
      let data: any[] = [];
      let filename = '';
      
      if (type === 'abstracts') {
        data = abstracts;
        filename = 'abstract_submissions.csv';
      } else if (type === 'events') {
        data = eventRegistrations;
        filename = 'event_registrations.csv';
      } else if (type === 'webinars') {
        data = webinarRegistrations;
        filename = 'webinar_registrations.csv';
      }

      // Convert data to CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const escaped = ('' + row[header as keyof typeof row]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      // Download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading submissions:", err);
      setAlert({
        open: true,
        title: 'Download Failed',
        message: 'There was an error downloading the submissions.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'attended':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'registered':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submissions Dashboard</h1>
        <p className="text-gray-600">View and manage all abstract submissions and event registrations</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('abstracts')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'abstracts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FileText className="inline mr-2 h-4 w-4" />
            Abstract Submissions ({abstracts.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'events' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Calendar className="inline mr-2 h-4 w-4" />
            Event Registrations ({eventRegistrations.length})
          </button>
          <button
            onClick={() => setActiveTab('webinars')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'webinars' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Video className="inline mr-2 h-4 w-4" />
            Webinar Registrations ({webinarRegistrations.length})
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => downloadSubmissions(activeTab)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>

      {/* Abstracts Tab Content */}
{activeTab === 'abstracts' && (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    {filteredAbstracts.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500">No abstract submissions found.</p>
      </div>
    ) : (
      <ul className="divide-y divide-gray-200">
        {filteredAbstracts.map((abstract) => (
          <li key={abstract.id} className="hover:bg-gray-50">
            <div 
              className="px-4 py-4 sm:px-6 cursor-pointer"
              onClick={() => toggleExpandSubmission(abstract.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-primary-600 truncate">
                    {abstract.abstract_title || 'Untitled Abstract'}
                  </p>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(abstract.status)}`}>
                    {abstract.status}
                  </span>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  {expandedSubmission === abstract.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {abstract.first_name} {abstract.last_name}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                    <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {abstract.institution}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <p>
                    Submitted on {format(new Date(abstract.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
            {expandedSubmission === abstract.id && (
              <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Author Information</h3>
                    <div className="mt-1 text-sm text-gray-900 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-semibold">First Name:</p>
                          <p>{abstract.first_name}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Last Name:</p>
                          <p>{abstract.last_name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">Email:</p>
                        <p>{abstract.email}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Phone:</p>
                        <p>{abstract.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Institution:</p>
                        <p>{abstract.institution}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Country:</p>
                        <p>{abstract.country}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Abstract Details</h3>
                    <div className="mt-1 text-sm text-gray-900 space-y-2">
                      <div>
                        <p className="font-semibold">Title:</p>
                        <p>{abstract.abstract_title}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Presentation Preference:</p>
                        <p className="capitalize">{abstract.presentation_preference?.replace('-', ' ')}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="font-semibold mr-2">Status:</p>
                        <select
                          value={abstract.status}
                          onChange={(e) => handleStatusChange('abstracts', abstract.id, e.target.value)}
                          className={`rounded-md ${getStatusColor(abstract.status)} px-2 py-1 text-xs font-medium`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      {abstract.file_path && (
                        <div>
                          <p className="font-semibold">Attachment:</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = supabase.storage
                                .from('abstract_files')
                                .getPublicUrl(abstract.file_path!).data.publicUrl;
                              window.open(url, '_blank');
                            }}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Abstract Text</h3>
                  <div className="mt-2 p-4 bg-white rounded border border-gray-200 whitespace-pre-wrap">
                    {abstract.abstract_text}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubmission('abstracts', abstract.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Submission
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
)}

      {/* Event Registrations Tab Content */}
      {activeTab === 'events' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredEventRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No event registrations found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredEventRegistrations.map((registration) => (
                <li key={registration.id} className="hover:bg-gray-50">
                  <div 
                    className="px-4 py-4 sm:px-6 cursor-pointer"
                    onClick={() => toggleExpandSubmission(registration.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {registration.name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {expandedSubmission === registration.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {registration.email}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {registration.organization || 'Not provided'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>
                          Registered for <span className="font-medium">{registration.event_title}</span> on {format(new Date(registration.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {expandedSubmission === registration.id && (
                    <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                          <div className="mt-1 text-sm text-gray-900 space-y-1">
                            <p><strong>Name:</strong> {registration.name}</p>
                            <p><strong>Email:</strong> {registration.email}</p>
                            <p><strong>Phone:</strong> {registration.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organization Details</h3>
                          <div className="mt-1 text-sm text-gray-900 space-y-1">
                            <p><strong>Organization:</strong> {registration.organization || 'Not provided'}</p>
                            <p><strong>Position:</strong> {registration.position || 'Not provided'}</p>
                            <p><strong>Status:</strong> 
                              <select
                                value={registration.status}
                                onChange={(e) => handleStatusChange('events', registration.id, e.target.value)}
                                className={`ml-2 rounded-md ${getStatusColor(registration.status)} px-2 py-1 text-xs font-medium`}
                              >
                                <option value="registered">Registered</option>
                                <option value="attended">Attended</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </p>
                          </div>
                        </div>
                      </div>
                      {registration.special_requirements && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-500">Special Requirements</h3>
                          <div className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
                            {registration.special_requirements}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex justify-end space-x-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSubmission('events', registration.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Webinar Registrations Tab Content */}
      {activeTab === 'webinars' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredWebinarRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No webinar registrations found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredWebinarRegistrations.map((registration) => (
                <li key={registration.id} className="hover:bg-gray-50">
                  <div 
                    className="px-4 py-4 sm:px-6 cursor-pointer"
                    onClick={() => toggleExpandSubmission(registration.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {registration.name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {expandedSubmission === registration.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {registration.email}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {registration.organization || 'Not provided'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>
                          Registered for <span className="font-medium">{registration.webinar_title}</span> on {format(new Date(registration.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {expandedSubmission === registration.id && (
                    <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                          <div className="mt-1 text-sm text-gray-900 space-y-1">
                            <p><strong>Name:</strong> {registration.name}</p>
                            <p><strong>Email:</strong> {registration.email}</p>
                            <p><strong>Phone:</strong> {registration.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organization Details</h3>
                          <div className="mt-1 text-sm text-gray-900 space-y-1">
                            <p><strong>Organization:</strong> {registration.organization || 'Not provided'}</p>
                            <p><strong>Position:</strong> {registration.position || 'Not provided'}</p>
                            <p><strong>Status:</strong> 
                              <select
                                value={registration.status}
                                onChange={(e) => handleStatusChange('webinars', registration.id, e.target.value)}
                                className={`ml-2 rounded-md ${getStatusColor(registration.status)} px-2 py-1 text-xs font-medium`}
                              >
                                <option value="registered">Registered</option>
                                <option value="attended">Attended</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSubmission('webinars', registration.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Alert modal */}
      <AlertModal
        isOpen={alert.open}
        title={alert.title || 'Alert'}
        message={alert.message}
        onConfirm={() => {
          if (alert.onConfirm) alert.onConfirm();
          setAlert({ ...alert, open: false });
        }}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Section>
  );
};

export default SubmissionsDashboard;