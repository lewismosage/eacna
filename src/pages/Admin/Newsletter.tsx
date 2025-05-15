import { useState, useEffect } from 'react';
import { Send, Edit, Eye, Trash2, Clock, User, Check, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SupabaseClient } from '@supabase/supabase-js';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface NewsletterContentProps {
  supabase: SupabaseClient;
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  sent_at: string | null;
  created_at: string;
  status: 'draft' | 'sent' | 'scheduled';
  schedule_date: string | null;
  sender_name: string;
  recipient_count?: number;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
}

export default function NewsletterContent({ supabase }: NewsletterContentProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sender_name: '',
    status: 'draft' as 'draft' | 'sent' | 'scheduled',
    schedule_date: ''
  });

  useEffect(() => {
    fetchNewsletters();
    fetchSubscribers();
    // eslint-disable-next-line
  }, []);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNewsletters(data as Newsletter[] || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('id, email, name, subscribed_at, is_active')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      setSubscribers(data as Subscriber[] || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch subscribers'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newsletterData = {
        ...formData,
        status: formData.status,
        schedule_date: formData.status === 'scheduled' ? formData.schedule_date : null
      };
      
      let error;
      let savedNewsletter;
      
      if (selectedNewsletter) {
        const { data, error: updateError } = await supabase
          .from('newsletters')
          .update(newsletterData)
          .eq('id', selectedNewsletter.id)
          .select();
        error = updateError;
        savedNewsletter = data?.[0];
      } else {
        const { data, error: insertError } = await supabase
          .from('newsletters')
          .insert([newsletterData])
          .select();
        error = insertError;
        savedNewsletter = data?.[0];
      }
      
      if (error) throw error;
      
      if (formData.status === 'sent' && savedNewsletter) {
        await sendNewsletter(savedNewsletter);
      }
      
      resetForm();
      fetchNewsletters();
      
      setNotification({
        type: 'success',
        message: selectedNewsletter ? 'Newsletter updated successfully!' : 'Newsletter created successfully!'
      });
      
    } catch (error) {
      console.error('Error saving newsletter:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save newsletter. Please try again.'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      sender_name: '',
      status: 'draft',
      schedule_date: ''
    });
    setSelectedNewsletter(null);
    setIsFormOpen(false);
  };

  const editNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      content: newsletter.content,
      sender_name: newsletter.sender_name || '',
      status: newsletter.status || 'draft',
      schedule_date: newsletter.schedule_date || ''
    });
    setIsFormOpen(true);
  };

  const previewNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsPreviewOpen(true);
  };

  const deleteNewsletter = async (id: string) => {
    if (confirm('Are you sure you want to delete this newsletter?')) {
      try {
        const { error } = await supabase
          .from('newsletters')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchNewsletters();
        setNotification({
          type: 'success',
          message: 'Newsletter deleted successfully!'
        });
      } catch (error) {
        console.error('Error deleting newsletter:', error);
        setNotification({
          type: 'error',
          message: 'Failed to delete newsletter. Please try again.'
        });
      }
    }
  };

  const sendNewsletter = async (newsletter: Newsletter) => {
    if (subscribers.length === 0) {
      setNotification({
        type: 'error',
        message: 'No subscribers found. Cannot send newsletter.'
      });
      return;
    }
  
    if (confirm(`Are you sure you want to send this newsletter to ${subscribers.filter(s => s.is_active).length} subscribers?`)) {
      setIsSending(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          'https://grpsuzgqxpbdfpdvenqq.supabase.co/functions/v1/send-newsletter',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              newsletter_id: newsletter.id,
              test_mode: false
            }),
          }
        );
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to send newsletter');
        }
        
        fetchNewsletters();
        setNotification({
          type: 'success',
          message: `Newsletter sent to ${subscribers.filter(s => s.is_active).length} subscribers!`
        });
      } catch (error) {
        console.error('Error sending newsletter:', error);
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to send newsletter. Please try again.'
        });
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const testSendNewsletter = async (newsletter: Newsletter) => {
    const testEmail = prompt("Enter test email address:", "test@example.com");
    if (!testEmail) return;
  
    setIsSending(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Authentication required");
      }
  
      const response = await fetch(
        'https://grpsuzgqxpbdfpdvenqq.supabase.co/functions/v1/send-newsletter',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            newsletter_id: newsletter.id,
            test_mode: true,
            test_email: testEmail
          }),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email');
      }
      
      setNotification({
        type: 'success',
        message: `Test email sent to ${testEmail}`
      });
    } catch (error) {
      console.error('Error sending test newsletter:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send test email. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-gray-500 mt-1">
            Create and send newsletters to {subscribers.filter(s => s.is_active).length} active subscribers
          </p>
        </div>
        <button 
          onClick={() => {
            setSelectedNewsletter(null);
            setFormData({
              title: '',
              content: '',
              sender_name: '',
              status: 'draft',
              schedule_date: ''
            });
            setIsFormOpen(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" /> Create Newsletter
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-md flex items-start justify-between ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : notification.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mr-2 text-green-600" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
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
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : newsletters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent/Scheduled</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newsletters.map(newsletter => (
                  <tr key={newsletter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{newsletter.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {newsletter.content.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {newsletter.sender_name || 'No sender specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        newsletter.status === 'sent' 
                          ? 'bg-green-100 text-green-800' 
                          : newsletter.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {newsletter.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(newsletter.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {newsletter.sent_at 
                        ? new Date(newsletter.sent_at).toLocaleString() 
                        : newsletter.schedule_date 
                          ? new Date(newsletter.schedule_date).toLocaleString()
                          : 'Not sent yet'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {newsletter.status === 'draft' && (
                          <button 
                            onClick={() => sendNewsletter(newsletter)} 
                            disabled={isSending}
                            className="text-green-600 hover:text-green-800"
                            title="Send Newsletter"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => previewNewsletter(newsletter)} 
                          className="text-primary-600 hover:text-primary-800"
                          title="Preview Newsletter"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => editNewsletter(newsletter)} 
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Newsletter"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteNewsletter(newsletter.id)} 
                          className="text-red-600 hover:text-red-800"
                          title="Delete Newsletter"
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
            <p className="text-gray-500">No newsletters found. Create your first newsletter!</p>
          </div>
        )}
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedNewsletter ? 'Edit Newsletter' : 'Create New Newsletter'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Newsletter Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Monthly Updates - April 2025"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Sender Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="sender_name"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="EACNA Team"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Send Immediately</option>
                  </select>
                </div>
                
                {formData.status === 'scheduled' && (
                  <div>
                    <label htmlFor="schedule_date" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Schedule Date</span>
                      </div>
                    </label>
                    <input
                      type="datetime-local"
                      id="schedule_date"
                      name="schedule_date"
                      value={formData.schedule_date}
                      onChange={handleInputChange}
                      required={formData.status === 'scheduled'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown Supported)</label>
                <textarea
                  id="content"
                  name="content"
                  rows={15}
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`# Newsletter Heading\n\nHello everyone,\n\nWelcome to our monthly newsletter!\n\n## What's New\n\n- Feature 1: Description here\n- Feature 2: Description here\n\n[Visit our website](https://eacna.org)\n\nBest regards,\nThe EACNA Team`}
                />
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Content Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="prose max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({node, ...props}) => (
                          <img className="rounded-lg my-4" {...props} />
                        ),
                        a: ({node, ...props}) => (
                          <a className="text-primary-600 hover:text-primary-500" {...props} />
                        ),
                        p: ({node, ...props}) => (
                          <p className="mb-4" {...props} />
                        )
                      }}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {selectedNewsletter?.status === 'draft' && (
                  <>
                    <button
                      type="button"
                      onClick={() => testSendNewsletter(selectedNewsletter)}
                      disabled={isSending}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send Test
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, status: 'sent'});
                        handleSubmit(new Event('submit') as any);
                      }}
                      disabled={isSending}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send to All
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {selectedNewsletter ? 'Update Newsletter' : 'Create Newsletter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && selectedNewsletter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Newsletter Preview
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-8 rounded-lg shadow-inner">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedNewsletter.title}</h1>
                    <p className="text-gray-600">
                      From: {selectedNewsletter.sender_name || 'EACNA Team'} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="prose max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({node, ...props}) => (
                          <img className="rounded-lg my-4 mx-auto" {...props} />
                        ),
                        a: ({node, ...props}) => (
                          <a className="text-primary-600 hover:text-primary-500" {...props} />
                        ),
                        p: ({node, ...props}) => (
                          <p className="mb-4" {...props} />
                        ),
                        h1: ({node, ...props}) => (
                          <h1 className="text-xl font-bold mt-6 mb-4" {...props} />
                        ),
                        h2: ({node, ...props}) => (
                          <h2 className="text-lg font-bold mt-5 mb-3" {...props} />
                        )
                      }}
                    >
                      {selectedNewsletter.content}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                    <p>© 2025 EACNA. All rights reserved.</p>
                    <p className="mt-2">You're receiving this email because you subscribed to our newsletter.</p>
                    <p className="mt-1">
                      <a href="#" className="text-primary-600 hover:underline">Unsubscribe</a> • 
                      <a href="#" className="text-primary-600 hover:underline ml-2">Update preferences</a> • 
                      <a href="#" className="text-primary-600 hover:underline ml-2">View in browser</a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    editNewsletter(selectedNewsletter);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Newsletter
                </button>
                
                {selectedNewsletter.status === 'draft' && (
                  <>
                    <button
                      onClick={() => testSendNewsletter(selectedNewsletter)}
                      disabled={isSending}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send Test
                    </button>
                    <button
                      onClick={() => sendNewsletter(selectedNewsletter)}
                      disabled={isSending}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" /> {isSending ? 'Sending...' : 'Send to All'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}