// src/pages/admin/WebinarsManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Search, Clock, Users, FileText, ImageIcon, Tag, X, Check, AlertCircle, Video, Link as LinkIcon, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertModal from '../../../components/common/AlertModal';
import Card from '../../../components/common/Card';
import { SupabaseClient } from '@supabase/supabase-js';

interface Webinar {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string;
  tags: string[];
  start_time: string;
  end_time: string;
  agenda: {
    time: string;
    topic: string;
    speaker?: string;
  }[];
  speakers: {
    name: string;
    title: string;
    image_url?: string;
  }[];
  registration_link: string;
  webinar_link: string;
  recording_url: string;
  is_live: boolean;
  has_recording: boolean;
  status: 'draft' | 'published' | 'completed';
  created_at: string;
  updated_at: string;
}

interface WebinarsManagementProps {
  supabase: SupabaseClient;
}

const WebinarsManagement: React.FC<WebinarsManagementProps> = ({ supabase }) => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ open: false, message: '' });

  const [formData, setFormData] = useState<Omit<Webinar, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    date: '',
    description: '',
    image_url: '',
    tags: [],
    start_time: '',
    end_time: '',
    agenda: [],
    speakers: [],
    registration_link: '',
    webinar_link: '',
    recording_url: '',
    is_live: false,
    has_recording: false,
    status: 'draft'
  });

  const [newTag, setNewTag] = useState<string>('');
  const [newAgendaItem, setNewAgendaItem] = useState<{ time: string; topic: string; speaker?: string }>({
    time: '',
    topic: '',
    speaker: ''
  });
  const [newSpeaker, setNewSpeaker] = useState<{ name: string; title: string; image_url?: string }>({
    name: '',
    title: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWebinars(data as Webinar[] || []);
    } catch (error) {
      console.error("Error fetching webinars:", error);
      setNotification({
        type: 'error',
        message: 'Failed to load webinars'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredWebinars = webinars.filter(webinar => 
    webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/webinar-images/${fileName}`;
      
      // Upload with public ACL
      const { data, error } = await supabase.storage
        .from('webinar-assets')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type
        });
      
      if (error) throw error;
  
      // Get permanent public URL
      const { data: { publicUrl } } = supabase.storage
        .from('webinar-assets')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAgendaItem = () => {
    if (newAgendaItem.time.trim() && newAgendaItem.topic.trim()) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, { ...newAgendaItem }]
      }));
      setNewAgendaItem({ time: '', topic: '', speaker: '' });
    }
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const addSpeaker = () => {
    if (newSpeaker.name.trim() && newSpeaker.title.trim()) {
      setFormData(prev => ({
        ...prev,
        speakers: [...prev.speakers, { ...newSpeaker }]
      }));
      setNewSpeaker({ name: '', title: '', image_url: '' });
    }
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const openEditForm = (webinar: Webinar | null) => {
    setSelectedWebinar(webinar);
    if (webinar) {
      setFormData({
        title: webinar.title,
        date: webinar.date,
        description: webinar.description,
        image_url: webinar.image_url,
        tags: webinar.tags,
        start_time: webinar.start_time,
        end_time: webinar.end_time,
        agenda: webinar.agenda,
        speakers: webinar.speakers,
        registration_link: webinar.registration_link,
        webinar_link: webinar.webinar_link,
        recording_url: webinar.recording_url,
        is_live: webinar.is_live,
        has_recording: webinar.has_recording,
        status: webinar.status
      });
      if (webinar.image_url) {
        setImagePreview(webinar.image_url);
      }
    } else {
      setFormData({
        title: '',
        date: '',
        description: '',
        image_url: '',
        tags: [],
        start_time: '',
        end_time: '',
        agenda: [],
        speakers: [],
        registration_link: '',
        webinar_link: '',
        recording_url: '',
        is_live: false,
        has_recording: false,
        status: 'draft'
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.description) {
        setNotification({
          type: 'error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      // Upload image if there's a new one
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }
      
      const webinarData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };
      
      if (selectedWebinar) {
        // Update existing webinar
        const { error } = await supabase
          .from('webinars')
          .update(webinarData)
          .eq('id', selectedWebinar.id);
        
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Webinar updated successfully'
        });
      } else {
        // Create new webinar
        const { data, error } = await supabase
          .from('webinars')
          .insert([{
            ...webinarData,
            created_at: new Date().toISOString()
          }])
          .select();
        
        if (error) throw error;
        
        setNotification({
          type: 'success',
          message: 'Webinar created successfully'
        });
      }
      
      fetchWebinars();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving webinar:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save webinar'
      });
    }
  };

  const confirmDelete = (id: string) => {
    setAlert({
      open: true,
      title: 'Delete Webinar',
      message: 'Are you sure you want to delete this webinar?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('webinars')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          setWebinars(prev => prev.filter(w => w.id !== id));
          setNotification({
            type: 'success',
            message: 'Webinar deleted successfully'
          });
        } catch (error) {
          console.error('Error deleting webinar:', error);
          setNotification({
            type: 'error',
            message: 'Failed to delete webinar'
          });
        } finally {
          setAlert({ ...alert, open: false });
        }
      }
    });
  };

  const publishWebinar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webinars')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      setWebinars(prev => prev.map(w => 
        w.id === id ? { ...w, status: 'published' } : w
      ));
      setNotification({
        type: 'success',
        message: 'Webinar published successfully'
      });
    } catch (error) {
      console.error('Error publishing webinar:', error);
      setNotification({
        type: 'error',
        message: 'Failed to publish webinar'
      });
    }
  };

  const formatWebinarDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webinars & Online Events</h1>
          <p className="text-gray-500 mt-1">
            Manage all webinars and online events for healthcare professionals
          </p>
        </div>
        <button 
          onClick={() => openEditForm(null)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Webinar
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
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search webinars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredWebinars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Webinar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWebinars.map(webinar => (
                  <tr key={webinar.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={webinar.image_url} 
                            alt={webinar.title} 
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{webinar.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {webinar.description.substring(0, 100)}{webinar.description.length > 100 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-primary-600 mt-0.5 mr-1 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-900">{formatWebinarDate(webinar.date)}</div>
                          <div className="text-sm text-gray-500 flex items-start mt-1">
                            <Clock className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                            <span>{webinar.start_time} - {webinar.end_time}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        webinar.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : webinar.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {webinar.status}
                      </span>
                      {webinar.is_live && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Live
                        </span>
                      )}
                      {webinar.has_recording && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Recording
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatWebinarDate(webinar.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {webinar.status === 'draft' && (
                          <button 
                            onClick={() => publishWebinar(webinar.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Publish Webinar"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedWebinar(webinar);
                            setIsPreviewOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Webinar"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openEditForm(webinar)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Webinar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(webinar.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Webinar"
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
            <p className="text-gray-500">
              {searchTerm 
                ? "No webinars match your search. Try a different search term."
                : "No webinars found. Create your first webinar!"}
            </p>
          </div>
        )}
      </Card>

      {/* Webinar Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedWebinar ? 'Edit Webinar' : 'Create New Webinar'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Webinar Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Management of Status Epilepticus in Children"
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Webinar Date *</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Start Time *</span>
                    </div>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Webinar Link */}
                <div className="col-span-2">
                  <label htmlFor="webinarLink" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <span>Webinar Link (Zoom/Teams/etc.)</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="webinarLink"
                    name="webinar_link"
                    value={formData.webinar_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>

                {/* Registration Link */}
                <div className="col-span-2">
                  <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <span>Registration Link</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="registrationLink"
                    name="registration_link"
                    value={formData.registration_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://forms.gle/example"
                  />
                </div>

                {/* Recording URL */}
                <div className="col-span-2">
                  <label htmlFor="recordingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span>Recording URL (after event)</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="recordingUrl"
                    name="recording_url"
                    value={formData.recording_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://youtube.com/example"
                  />
                </div>

                {/* Status Flags */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isLive"
                      name="is_live"
                      checked={formData.is_live}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isLive" className="ml-2 block text-sm text-gray-700">
                      Currently live (show as active webinar)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasRecording"
                      name="has_recording"
                      checked={formData.has_recording}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasRecording" className="ml-2 block text-sm text-gray-700">
                      Has recording available
                    </label>
                  </div>
                </div>

                {/* Image */}
                <div className="col-span-2">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>Webinar Image</span>
                    </div>
                  </label>
                  <div className="mt-2 flex flex-col space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Webinar preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="image-upload"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <Upload className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                      </div>
                    )}
                    {isUploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${isUploading ? 100 : 0}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Description *</span>
                  </div>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the webinar content, objectives, and target audience..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-primary-600 px-4 py-2 text-white rounded-r-md hover:bg-primary-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webinar Agenda
                </label>
                <div className="space-y-2 mb-4">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div>
                        <span className="font-medium">{item.time}</span>
                        <span className="mx-2">-</span>
                        <span>{item.topic}</span>
                        {item.speaker && (
                          <span className="ml-2 text-gray-500">({item.speaker})</span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAgendaItem(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={newAgendaItem.time}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="Time (e.g. 9:00 - 10:30)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={newAgendaItem.topic}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Topic"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex">
                    <input
                      type="text"
                      value={newAgendaItem.speaker || ''}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, speaker: e.target.value }))}
                      placeholder="Speaker (optional)"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      disabled={!newAgendaItem.time || !newAgendaItem.topic}
                      className="bg-primary-600 px-4 py-2 text-white rounded-r-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Speakers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Speakers</span>
              </div>
            </label>
            <div className="space-y-4 mb-4">
              {formData.speakers.map((speaker, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between border-b border-gray-200 pb-4"
                >
                  <div>
                    <div className="font-medium">{speaker.name}</div>
                    <div className="text-gray-600">{speaker.title}</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeSpeaker(index)}
                    className="text-gray-500 hover:text-red-500 mt-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div>
                <label htmlFor="speakerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Name
                </label>
                <input
                  type="text"
                  id="speakerName"
                  value={newSpeaker.name}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="speakerTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Title
                </label>
                <input
                  type="text"
                  id="speakerTitle"
                  value={newSpeaker.title}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="speakerImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Image URL (optional)
                </label>
                <input
                  type="text"
                  id="speakerImage"
                  value={newSpeaker.image_url || ''}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/speaker.jpg"
                />
              </div>
              <button
                type="button"
                onClick={addSpeaker}
                disabled={!newSpeaker.name || !newSpeaker.title}
                className="bg-primary-600 px-4 py-2 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Speaker
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              {selectedWebinar ? 'Update Webinar' : 'Create Webinar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Preview Modal */}
  {isPreviewOpen && selectedWebinar && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            Webinar Details
          </h3>
          <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Header with image */}
          <div className="relative mb-8">
            <div className="h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={selectedWebinar.image_url || 'https://via.placeholder.com/800x300?text=No+Image'} 
                alt={selectedWebinar.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <h2 className="text-2xl font-bold text-white">
                {selectedWebinar.title}
              </h2>
            </div>
          </div>

          {/* Webinar details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this Webinar</h3>
                <p className="text-gray-700">{selectedWebinar.description}</p>
              </div>

              {selectedWebinar.agenda.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Webinar Agenda</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speaker</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedWebinar.agenda.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.time}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.topic}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.speaker || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedWebinar.speakers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Speakers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedWebinar.speakers.map((speaker, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md flex items-start">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 mr-3">
                          {speaker.image_url ? (
                            <img src={speaker.image_url} alt={speaker.name} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <Users className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{speaker.name}</h4>
                          <p className="text-sm text-gray-600">{speaker.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">{formatWebinarDate(selectedWebinar.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Time</p>
                      <p className="text-gray-600">{selectedWebinar.start_time} - {selectedWebinar.end_time}</p>
                    </div>
                  </div>
                  {selectedWebinar.tags.length > 0 && (
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedWebinar.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Participation</h3>
                {selectedWebinar.is_live ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      This webinar is currently live. Join now to participate.
                    </p>
                    <a 
                      href={selectedWebinar.webinar_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 text-center"
                    >
                      Join Live Webinar
                    </a>
                  </>
                ) : selectedWebinar.has_recording ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      This webinar has concluded, but you can watch the recording.
                    </p>
                    <a 
                      href={selectedWebinar.recording_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-center"
                    >
                      Watch Recording
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 mb-4">
                      Register for this webinar to receive participation details.
                    </p>
                    <a 
                      href={selectedWebinar.registration_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-center"
                    >
                      Register Now
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Alert Modal */}
  <AlertModal
    isOpen={alert.open}
    title={alert.title ?? 'Alert'}
    message={alert.message}
    onConfirm={alert.onConfirm}
    onCancel={() => setAlert({ ...alert, open: false })}
    onClose={() => setAlert({ ...alert, open: false })}
    confirmText={alert.confirmText}
    cancelText={alert.cancelText}
  />
</div>
);
};

export default WebinarsManagement;