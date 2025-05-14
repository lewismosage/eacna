import { useState, useEffect } from 'react';
import { Mail, User, Trash2, Download, X, AlertCircle, Check } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import Card from '../../components/common/Card';

interface Subscriber {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface SubscribersContentProps {
  supabase: SupabaseClient;
}

export default function SubscribersContent({ supabase }: SubscribersContentProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubscribers(data as Subscriber[] || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load subscribers. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      try {
        const { error } = await supabase
          .from('subscribers')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchSubscribers();
        setNotification({
          type: 'success',
          message: 'Subscriber deleted successfully!'
        });
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        setNotification({
          type: 'error',
          message: 'Failed to delete subscriber. Please try again.'
        });
      }
    }
  };

  const exportSubscribers = async () => {
    try {
      // Create CSV content
      const headers = ['Full Name', 'Email', 'Subscribed On'];
      const csvContent = [
        headers.join(','),
        ...subscribers.map(sub => 
          `"${sub.full_name || ''}","${sub.email}","${new Date(sub.created_at).toLocaleDateString()}"`
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eacna-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        type: 'success',
        message: 'Subscribers exported successfully!'
      });
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      setNotification({
        type: 'error',
        message: 'Failed to export subscribers. Please try again.'
      });
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => 
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscriber.full_name && subscriber.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500 mt-1">
            {subscribers.length} total subscribers
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportSubscribers}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Loading subscribers...</p>
          </div>
        ) : filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map(subscriber => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscriber.full_name || 'No name provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm text-gray-900">
                            {subscriber.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => deleteSubscriber(subscriber.id)} 
                        className="text-red-600 hover:text-red-800"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm ? (
              <p className="text-gray-500">No subscribers match your search criteria.</p>
            ) : (
              <p className="text-gray-500">No subscribers found.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}