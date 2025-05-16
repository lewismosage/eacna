import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Trash2,
  Pencil,
  BookOpen,
  User,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  journal: string;
  year: string;
  status: 'published' | 'archived';
  published_by: string;
  published_at: string;
  submitted_by: string;
  submitted_at: string;
  keywords: string[];
  sections: {
    id: number;
    type: 'heading' | 'paragraph';
    content: string;
    level?: number;
  }[];
  references: string[];
}

interface AdminPublishedPublicationsProps {
  supabase: SupabaseClient;
}

export default function AdminPublishedPublications({ supabase }: AdminPublishedPublicationsProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  } | null>({ key: 'published_at', direction: 'descending' });

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

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

        if (aValue === undefined || bValue === undefined) {
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

  const archivePublication = async (id: string) => {
    if (confirm('Are you sure you want to archive this publication? It will no longer be visible to members.')) {
      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from('publications')
          .update({ 
            status: 'archived',
            published_at: null
          })
          .eq('id', id);

        if (error) throw error;

        fetchPublications();
        setNotification({
          type: 'success',
          message: 'Publication archived successfully!'
        });
        setIsViewOpen(false);
      } catch (error) {
        console.error('Error archiving publication:', error);
        setNotification({
          type: 'error',
          message: 'Failed to archive publication. Please try again.'
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

  const estimateReadTime = (sections: any[]) => {
    const contentLength = sections.reduce((acc, section) => acc + section.content.length, 0);
    const wordsPerMinute = 200;
    const minutes = Math.ceil(contentLength / 5 / wordsPerMinute);
    return `${minutes} min read`;
  };

  const exportPublications = async () => {
    try {
      // Create CSV content
      const headers = ['Title', 'Authors', 'Journal', 'Year', 'Published By', 'Published On', 'Keywords'];
      const csvContent = [
        headers.join(','),
        ...filteredPublications.map(pub => 
          `"${pub.title}","${pub.authors}","${pub.journal || ''}","${pub.year || ''}","${pub.published_by}","${formatDate(pub.published_at)}","${pub.keywords.join('; ')}"`
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eacna-publications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        type: 'success',
        message: 'Publications exported successfully!'
      });
    } catch (error) {
      console.error('Error exporting publications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to export publications. Please try again.'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Published Publications</h1>
          <p className="text-gray-500 mt-1">
            {publications.length} total publications
          </p>
        </div>
        <Button 
          onClick={exportPublications}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
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
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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
                    onClick={() => requestSort('published_at')}
                  >
                    <div className="flex items-center">
                      <span>Published</span>
                      {getSortIcon('published_at')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
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
                        <span>Submitted by {publication.submitted_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(publication.published_at)}</span>
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
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => viewPublication(publication)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Publication"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => archivePublication(publication.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Archive Publication"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm ? (
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
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Published By</h4>
                      <p className="text-gray-900">{selectedPublication.published_by}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Published On</h4>
                      <p className="text-gray-900">{formatDate(selectedPublication.published_at)}</p>
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
                <Button
                  variant="secondary"
                  onClick={() => archivePublication(selectedPublication.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Archive Publication
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}