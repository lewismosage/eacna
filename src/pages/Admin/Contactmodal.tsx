import { useState, useEffect } from 'react';
import { X, Mail, Phone, Send, Save, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

interface ContactTemplateType {
  id: string;
  title: string;
  subject: string;
  message: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  preferredContactMethod?: string;
  subjectContext?: string;
  messageContext?: string;
  supabase: SupabaseClient;
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Alert Modal Component
function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b border-gray-200 flex items-center ${
          type === 'success' ? 'text-green-600' : 
          type === 'error' ? 'text-red-600' : 
          'text-primary-600'
        }`}>
          {type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : 
           type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : 
           <AlertCircle className="w-5 h-5 mr-2" />}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactModal({
  isOpen,
  onClose,
  recipientName,
  recipientEmail,
  recipientPhone,
  preferredContactMethod,
  subjectContext,
  messageContext,
  supabase
}: ContactModalProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>(
    preferredContactMethod === 'phone' && recipientPhone ? 'phone' : 'email'
  );
  const [subject, setSubject] = useState(subjectContext || '');
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState<ContactTemplateType[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [sentHistory, setSentHistory] = useState<{date: string, method: string, recipient: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  // Helper function to show alerts
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };
  
  // Close alert modal
  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchContactHistory();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_templates')
        .select('*')
        .order('title', { ascending: true });
        
      if (error) throw error;
      setTemplates(data as ContactTemplateType[] || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showAlert('Error', 'Failed to load templates', 'error');
    }
  };
  
  const fetchContactHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('recipient_email', recipientEmail)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      if (data) {
        setSentHistory(data.map(item => ({
          date: new Date(item.created_at).toLocaleString(),
          method: item.contact_method,
          recipient: item.recipient_name
        })));
      }
    } catch (error) {
      console.error('Error fetching contact history:', error);
      showAlert('Error', 'Failed to load contact history', 'error');
    }
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const selected = templates.find(t => t.id === templateId);
      if (selected) {
        setSubject(selected.subject);
        setMessage(selected.message);
      }
    }
  };

  const saveTemplate = async () => {
    if (!templateTitle.trim()) {
      showAlert('Missing Information', 'Please enter a template title', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('contact_templates')
        .insert([
          {
            title: templateTitle,
            subject,
            message
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Update the templates list with the new template
      if (data) {
        setTemplates([...templates, data[0] as ContactTemplateType]);
        setSaveAsTemplate(false);
        setTemplateTitle('');
        showAlert('Success', 'Template saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showAlert('Error', 'Failed to save template', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendContactMessage = async () => {
    // Validation
    if (contactMethod === 'email' && (!subject.trim() || !message.trim())) {
      showAlert('Missing Information', 'Please enter both subject and message', 'error');
      return;
    }
    
    if (contactMethod === 'phone' && (!message.trim() || !recipientPhone)) {
      showAlert('Missing Information', 'Please enter a message and ensure phone number is provided', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (contactMethod === 'email') {
        // EmailJS implementation
        const templateParams = {
          to_name: recipientName,
          to_email: recipientEmail, 
          from_name: 'EACNA',
          subject: subject,
          message: message,
          reply_to: recipientEmail 
        };
  
        // Send email using EmailJS
        const response = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
  
        if (response.status !== 200) {
          throw new Error('Email failed to send');
        }
      } 
      // SMS service
      else if (contactMethod === 'phone' && recipientPhone) {
        const { error } = await supabase.functions.invoke('send-sms', {
          body: JSON.stringify({
            to: recipientPhone,
            message: message
          })
        });
        
        if (error) throw error;
      }
  
      // Log the contact in the database
      const { error: historyError } = await supabase
      .from('contact_history')
      .insert({
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        recipient_phone: recipientPhone,
        contact_method: contactMethod,
        subject: contactMethod === 'email' ? subject : null,
        message: message,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (historyError) {
        console.error('Database insert error:', historyError);
        throw new Error('Failed to save contact record');
      }
      
      // Success notification
      showAlert(
        'Message Sent', 
        `${contactMethod === 'email' ? 'Email' : 'SMS'} sent successfully to ${recipientName}`,
        'success'
      );
      
      // Close the contact modal after successful send
      setTimeout(() => {
        closeAlert();
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      }
      
      showAlert('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Contact Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Contact {recipientName}
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Recipient Info */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700">To:</span>
                <span className="ml-2 text-gray-900">{recipientName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="ml-2 text-gray-800">{recipientEmail}</span>
                </div>
                {recipientPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="ml-2 text-gray-800">{recipientPhone}</span>
                  </div>
                )}
              </div>
              {preferredContactMethod && (
                <div className="mt-2 text-sm text-primary-600">
                  Preferred contact method: {preferredContactMethod}
                </div>
              )}
            </div>
            
            {/* Contact Method Toggle */}
            {recipientPhone && (
              <div className="mb-6">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setContactMethod('email')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      contactMethod === 'email'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      contactMethod === 'phone'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone/SMS
                  </button>
                </div>
              </div>
            )}
            
            {/* Template Selector */}
            <div className="mb-6">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Use Template
              </label>
              <select
                id="template"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={selectedTemplate}
                onChange={handleTemplateSelect}
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Contact Form */}
            {contactMethod === 'email' && (
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={8}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your message to ${recipientName}...`}
              ></textarea>
            </div>
            
            {/* Save as Template Option */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  id="save-template"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={saveAsTemplate}
                  onChange={() => setSaveAsTemplate(!saveAsTemplate)}
                />
                <label htmlFor="save-template" className="ml-2 block text-sm text-gray-700">
                  Save as template for future use
                </label>
              </div>
              
              {saveAsTemplate && (
                <div className="mt-2 pl-6">
                  <input
                    type="text"
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    placeholder="Template title"
                  />
                </div>
              )}
            </div>
            
            {/* Contact History */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center text-sm text-primary-600 hover:underline"
              >
                <Clock className="w-4 h-4 mr-1" />
                {showHistory ? 'Hide contact history' : 'Show contact history'}
              </button>
              
              {showHistory && sentHistory.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent communications</h4>
                  <ul className="space-y-2">
                    {sentHistory.map((record, index) => (
                      <li key={index} className="text-xs text-gray-600">
                        {record.date} - {record.method} to {record.recipient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {showHistory && sentHistory.length === 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">No previous communication found.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer with buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            
            {/* Other action buttons */}
            {saveAsTemplate && (
              <button
                type="button"
                onClick={saveTemplate}
                disabled={isLoading}
                className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Template
              </button>
            )}
            
            <button
              type="button"
              onClick={sendContactMessage}
              disabled={isLoading}
              className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Send {contactMethod === 'email' ? 'Email' : 'SMS'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Modal */}
      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={closeAlert} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type} 
      />
    </>
  );
}