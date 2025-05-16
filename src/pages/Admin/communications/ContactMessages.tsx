import { useState, useEffect } from 'react';
import { Trash2, Eye, X, Mail, RefreshCw } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import ContactModal from './Contactmodal';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

// Define the type for a message
interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  created_at: string;
  phone?: string;
  preferred_contact_method?: string;
}

interface MessagesContentProps {
  supabase: SupabaseClient;
}

export default function MessagesContent({ supabase }: MessagesContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data as Message[] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewMessage = async (message: Message) => {
    setSelectedMessage(message);
    
    if (!message.read) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .update({ read: true })
          .eq('id', message.id);
        
        if (error) throw error;
        
        setMessages(messages.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    
    setIsViewOpen(true);
  };

  const deleteMessage = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  const refreshData = () => {
    fetchMessages();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <button 
          onClick={refreshData}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map(message => (
                  <tr 
                    key={message.id} 
                    className={`${!message.read ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {message.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{message.subject || 'No Subject'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        message.read 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-primary-100 text-primary-800'
                      }`}>
                        {message.read ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => viewMessage(message)}
                          className="text-primary-600 hover:text-primary-800"
                          title="View message"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteMessage(message.id)} 
                          className="text-red-600 hover:text-red-800"
                          title="Delete message"
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
            <p className="text-gray-500">No messages found.</p>
          </div>
        )}
      </Card>
      
      {/* Message View Modal */}
      {isViewOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Message from {selectedMessage.name}
              </h3>
              <button 
                onClick={() => setIsViewOpen(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">From</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedMessage.subject || 'No Subject'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Message</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer with buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  openContactModal();
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Sender
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Modal */}
      {isContactModalOpen && selectedMessage && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={closeContactModal}
          recipientName={selectedMessage.name}
          recipientEmail={selectedMessage.email}
          recipientPhone={selectedMessage.phone}
          preferredContactMethod={selectedMessage.preferred_contact_method}
          subjectContext={`Re: ${selectedMessage.subject || 'Your message'}`}
          messageContext={`Hello ${selectedMessage.name},\n\nThank you for your message regarding "${selectedMessage.subject || 'your inquiry'}".\n\n`}
          supabase={supabase}
        />
      )}
    </div>
  );
}