import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Eye, 
  Clock,
  FileText,
  User,
  AlertCircle,
  Loader2,
  Pencil,
  BookOpen
} from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  journal: string;
  year: string;
  status: 'draft' | 'submitted' | 'approved' | 'published' | 'rejected';
  submitted_by: string;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  keywords: string[];
  sections: {
    id: number;
    type: 'heading' | 'paragraph';
    content: string;
    level?: number;
  }[];
  references: string[];
}

interface AdminPublicationsReviewProps {
  supabase: SupabaseClient;
}

export default function AdminPublicationsReview({ supabase }: AdminPublicationsReviewProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Publication;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'submitted_at', direction: 'descending' });

  useEffect(() => {
    fetchPublications();
  }, [statusFilter]);

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('publications')
        .select('*')
        .or('status.eq.submitted,status.eq.approved,status.eq.rejected');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPublications(data as Publication[] || []);
      setFilteredPublications(data as Publication[] || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load publications. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...publications];
    
    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(pub => 
        pub.title.toLowerCase().includes(lowercasedSearch) ||
        pub.authors.toLowerCase().includes(lowercasedSearch) ||
        pub.abstract.toLowerCase().includes(lowercasedSearch) ||
        pub.keywords.some(kw => kw.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) {
          return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredPublications(result);
  }, [publications, searchTerm, sortConfig]);

  const requestSort = (key: keyof Publication) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Publication) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const viewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsViewOpen(true);
  };

  const updatePublicationStatus = async (id: string, status: 'approved' | 'published' | 'rejected') => {
    if (confirm(`Are you sure you want to ${status} this publication?`)) {
      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from('publications')
          .update({ 
            status,
            reviewed_by: 'admin', // In real app, use actual admin ID
            reviewed_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;

        fetchPublications();
        setNotification({
          type: 'success',
          message: `Publication ${status} successfully!`
        });
        setIsViewOpen(false);
      } catch (error) {
        console.error(`Error updating publication status:`, error);
        setNotification({
          type: 'error',
          message: `Failed to update publication status. Please try again.`
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const estimateReadTime = (sections: any[]) => {
    const contentLength = sections.reduce((acc, section) => acc + section.content.length, 0);
    const wordsPerMinute = 200;
    const minutes = Math.ceil(contentLength / 5 / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publications Review</h1>
          <p className="text-gray-500 mt-1">
            {publications.length} total submissions ({publications.filter(p => p.status === 'submitted').length} pending review)
          </p>
        </div>
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
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search publications..."
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
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredPublications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('title')}
                  >
                    <div className="flex items-center">
                      <span>Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('authors')}
                  >
                    <div className="flex items-center">
                      <span>Authors</span>
                      {getSortIcon('authors')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('submitted_at')}
                  >
                    <div className="flex items-center">
                      <span>Submitted</span>
                      {getSortIcon('submitted_at')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPublications.map(publication => (
                  <tr key={publication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{publication.title}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{estimateReadTime(publication.sections)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{publication.authors}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <User className="h-3 w-3 mr-1" />
                        <span>{publication.submitted_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(publication.submitted_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {publication.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                        {publication.keywords.length > 3 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            +{publication.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(publication.status)}`}>
                        {publication.status.charAt(0).toUpperCase() + publication.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => viewPublication(publication)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Publication"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {publication.status === 'submitted' && (
                          <>
                            <button 
                              onClick={() => updatePublicationStatus(publication.id, 'approved')}
                              className="text-green-600 hover:text-green-800"
                              title="Approve Publication"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => updatePublicationStatus(publication.id, 'rejected')}
                              className="text-red-600 hover:text-red-800"
                              title="Reject Publication"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {publication.status === 'approved' && (
                          <button 
                            onClick={() => updatePublicationStatus(publication.id, 'published')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Publish Publication"
                          >
                            <BookOpen className="w-5 h-5" />
                          </button>
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
              <p className="text-gray-500">No publications match your search criteria.</p>
            ) : (
              <p className="text-gray-500">No publications found.</p>
            )}
          </div>
        )}
      </Card>
      
      {/* Publication View Modal */}
      {isViewOpen && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPublication.title}
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
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Authors</h4>
                      <p className="text-gray-900">{selectedPublication.authors}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Submitted By</h4>
                      <p className="text-gray-900">{selectedPublication.submitted_by}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Submitted On</h4>
                      <p className="text-gray-900">{formatDate(selectedPublication.submitted_at)}</p>
                    </div>
                    
                    {selectedPublication.reviewed_at && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {selectedPublication.status === 'approved' ? 'Approved' : 'Rejected'} On
                        </h4>
                        <p className="text-gray-900">{formatDate(selectedPublication.reviewed_at)}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedPublication.status)}`}>
                        {selectedPublication.status.charAt(0).toUpperCase() + selectedPublication.status.slice(1)}
                      </span>
                    </div>
                    
                    {selectedPublication.journal && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Journal</h4>
                        <p className="text-gray-900">{selectedPublication.journal}</p>
                      </div>
                    )}
                    
                    {selectedPublication.year && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Year</h4>
                        <p className="text-gray-900">{selectedPublication.year}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication.keywords.map((keyword, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Abstract</h4>
                    <p className="text-gray-700">{selectedPublication.abstract}</p>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {selectedPublication.sections.map((section, index) => {
                      if (section.type === 'heading' && section.level === 1) {
                        return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{section.content}</h3>;
                      } else if (section.type === 'heading' && section.level === 2) {
                        return <h4 key={index} className="text-lg font-medium mt-5 mb-2">{section.content}</h4>;
                      } else if (section.type === 'heading' && section.level === 3) {
                        return <h5 key={index} className="text-base font-medium mt-4 mb-2">{section.content}</h5>;
                      } else {
                        return <p key={index} className="mb-3">{section.content}</p>;
                      }
                    })}
                  </div>
                  
                  {selectedPublication.references.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold mb-4">References</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        {selectedPublication.references.map((reference, index) => (
                          <li key={index} className="text-sm text-gray-700">{reference}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                >
                  Close
                </Button>
                
                {selectedPublication.status === 'submitted' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => updatePublicationStatus(selectedPublication.id, 'rejected')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => updatePublicationStatus(selectedPublication.id, 'approved')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
                
                {selectedPublication.status === 'approved' && (
                  <Button
                    variant="primary"
                    onClick={() => updatePublicationStatus(selectedPublication.id, 'published')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4 mr-2" />
                    )}
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}