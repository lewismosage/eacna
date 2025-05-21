import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Search, Clock, Users, FileText, Image, Tag, X, Check, AlertCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertModal from '../../../components/common/AlertModal';
import Card from '../../../components/common/Card';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  tags: string[];
  startTime: string;
  endTime: string;
  agenda: {
    time: string;
    activity: string;
  }[];
  speakers: {
    name: string;
    title: string;
    image?: string;
  }[];
  organizers: string[];
  registrationLink: string;
  isFull: boolean;
  status: 'draft' | 'published' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const TrainingEvents = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent | null>(null);
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

  const [formData, setFormData] = useState<Omit<TrainingEvent, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    date: '',
    location: '',
    description: '',
    image: '',
    tags: [],
    startTime: '',
    endTime: '',
    agenda: [],
    speakers: [],
    organizers: [],
    registrationLink: '',
    isFull: false,
    status: 'draft'
  });

  const [newTag, setNewTag] = useState<string>('');
  const [newOrganizer, setNewOrganizer] = useState<string>('');
  const [newAgendaItem, setNewAgendaItem] = useState<{ time: string; activity: string }>({
    time: '',
    activity: ''
  });
  const [newSpeaker, setNewSpeaker] = useState<{ name: string; title: string; image?: string }>({
    name: '',
    title: '',
    image: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for training events
      const mockEvents: TrainingEvent[] = [
        {
          id: '1',
          title: "PET1 Training in Nairobi",
          date: "2024-09-15",
          location: "Gertrude's Children's Hospital, Nairobi",
          description: "The Pediatric Epilepsy Training (PET1) course is designed for healthcare professionals involved in the care of children with epilepsy.",
          image: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg",
          tags: ["epilepsy", "pediatric neurology", "training"],
          startTime: "08:00",
          endTime: "17:00",
          agenda: [
            { time: "8:00 - 8:30", activity: "Registration & Morning Coffee" },
            { time: "8:30 - 10:30", activity: "Introduction to Pediatric Epilepsy" },
            { time: "10:30 - 10:45", activity: "Coffee Break" },
            { time: "10:45 - 12:30", activity: "Seizure Types and Classifications" },
            { time: "12:30 - 13:30", activity: "Lunch" },
            { time: "13:30 - 15:30", activity: "Treatment Approaches & Case Studies" },
            { time: "15:30 - 15:45", activity: "Coffee Break" },
            { time: "15:45 - 17:00", activity: "Practical Session & Q&A" }
          ],
          speakers: [
            { name: "Dr. Sarah Kimani", title: "Pediatric Neurologist, EACNA President" },
            { name: "Dr. James Mwangi", title: "Head of Neurology, Gertrude's Children's Hospital" }
          ],
          organizers: ["East African Child Neurology Association", "Gertrude's Children's Hospital"],
          registrationLink: "/register/pet1-nairobi",
          isFull: false,
          status: 'published',
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z"
        },
        {
          id: '2',
          title: "PET2 Advanced Epilepsy Training",
          date: "2025-01-20",
          location: "Muhimbili University, Dar es Salaam",
          description: "Advanced epilepsy training for healthcare professionals with prior experience.",
          image: "https://images.pexels.com/photos/6129500/pexels-photo-6129500.jpeg",
          tags: ["epilepsy", "advanced", "training"],
          startTime: "08:30",
          endTime: "17:30",
          agenda: [
            { time: "Day 1", activity: "Advanced Diagnostics" },
            { time: "Day 2", activity: "Treatment Modalities" },
            { time: "Day 3", activity: "Case Studies & Practical Sessions" }
          ],
          speakers: [
            { name: "Prof. David Kariuki", title: "Keynote Speaker, University of Nairobi" }
          ],
          organizers: ["East African Child Neurology Association"],
          registrationLink: "/register/pet2-dar",
          isFull: false,
          status: 'draft',
          createdAt: "2024-02-10T14:15:00Z",
          updatedAt: "2024-02-10T14:15:00Z"
        }
      ];
      
      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setNotification({
        type: 'error',
        message: 'Failed to load training events'
      });
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
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

  const addOrganizer = () => {
    if (newOrganizer.trim() && !formData.organizers.includes(newOrganizer.trim())) {
      setFormData(prev => ({
        ...prev,
        organizers: [...prev.organizers, newOrganizer.trim()]
      }));
      setNewOrganizer('');
    }
  };

  const removeOrganizer = (organizerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      organizers: prev.organizers.filter(organizer => organizer !== organizerToRemove)
    }));
  };

  const addAgendaItem = () => {
    if (newAgendaItem.time.trim() && newAgendaItem.activity.trim()) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, { ...newAgendaItem }]
      }));
      setNewAgendaItem({ time: '', activity: '' });
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
      setNewSpeaker({ name: '', title: '', image: '' });
    }
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const openEditForm = (event: TrainingEvent | null) => {
    setSelectedEvent(event);
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        image: event.image,
        tags: event.tags,
        startTime: event.startTime,
        endTime: event.endTime,
        agenda: event.agenda,
        speakers: event.speakers,
        organizers: event.organizers,
        registrationLink: event.registrationLink,
        isFull: event.isFull,
        status: event.status
      });
    } else {
      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
        image: '',
        tags: [],
        startTime: '',
        endTime: '',
        agenda: [],
        speakers: [],
        organizers: [],
        registrationLink: '',
        isFull: false,
        status: 'draft'
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.location || !formData.description) {
        setNotification({
          type: 'error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date().toISOString();
      
      if (selectedEvent) {
        // Update existing event
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id ? 
          { ...e, ...formData, updatedAt: now } : 
          e
        ));
        setNotification({
          type: 'success',
          message: 'Training event updated successfully'
        });
      } else {
        // Create new event
        const newEvent: TrainingEvent = {
          ...formData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: now,
          updatedAt: now
        };
        setEvents(prev => [newEvent, ...prev]);
        setNotification({
          type: 'success',
          message: 'Training event created successfully'
        });
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save training event'
      });
    }
  };

  const confirmDelete = (id: string) => {
    setAlert({
      open: true,
      title: 'Delete Training Event',
      message: 'Are you sure you want to delete this training event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setEvents(prev => prev.filter(e => e.id !== id));
        setNotification({
          type: 'success',
          message: 'Training event deleted successfully'
        });
        setAlert({ ...alert, open: false });
      }
    });
  };

  const publishEvent = (id: string) => {
    setEvents(prev => prev.map(e => 
      e.id === id ? { ...e, status: 'published' } : e
    ));
    setNotification({
      type: 'success',
      message: 'Training event published successfully'
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Events</h1>
          <p className="text-gray-500 mt-1">
            Manage all training events for healthcare professionals
          </p>
        </div>
        <button 
          onClick={() => openEditForm(null)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Training
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
              placeholder="Search training events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">
                            {event.startTime} - {event.endTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-primary-600 mt-0.5 mr-1 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-900">{formatEventDate(event.date)}</div>
                          <div className="text-sm text-gray-500 flex items-start mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : event.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                      {event.isFull && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Full
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatEventDate(event.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {event.status === 'draft' && (
                          <button 
                            onClick={() => publishEvent(event.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Publish Training"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsPreviewOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Training"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openEditForm(event)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Training"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(event.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Training"
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
                ? "No training events match your search. Try a different search term."
                : "No training events found. Create your first training event!"}
            </p>
          </div>
        )}
      </Card>

      {/* Training Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedEvent ? 'Edit Training Event' : 'Create New Training Event'}
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
                    Training Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="PET1 Training in Nairobi"
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Training Date *</span>
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
                    name="startTime"
                    value={formData.startTime}
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
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Gertrude's Children's Hospital, Nairobi"
                  />
                </div>

                {/* Registration Link */}
                <div className="col-span-2">
                  <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Link
                  </label>
                  <input
                    type="text"
                    id="registrationLink"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="/register/pet1-nairobi"
                  />
                </div>

                {/* Is Full */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFull"
                      name="isFull"
                      checked={formData.isFull}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFull" className="ml-2 block text-sm text-gray-700">
                      Training is full/closed for registration
                    </label>
                  </div>
                </div>

                {/* Image */}
                <div className="col-span-2">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      <span>Training Image</span>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Training preview" 
                        className="h-48 w-full object-cover rounded-md"
                      />
                    </div>
                  )}
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
                  placeholder="Describe the training content, objectives, and target audience..."
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
                  Training Agenda
                </label>
                <div className="space-y-2 mb-4">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div>
                        <span className="font-medium">{item.time}</span>
                        <span className="mx-2">-</span>
                        <span>{item.activity}</span>
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
                  <div className="sm:col-span-2 flex">
                    <input
                      type="text"
                      value={newAgendaItem.activity}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, activity: e.target.value }))}
                      placeholder="Activity description"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="bg-primary-600 px-4 py-2 text-white rounded-r-md hover:bg-primary-700"
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

              {/* Organizers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizers
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.organizers.map((organizer, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {organizer}
                      <button 
                        type="button" 
                        onClick={() => removeOrganizer(organizer)}
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
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="Add an organizer"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOrganizer())}
                  />
                  <button
                    type="button"
                    onClick={addOrganizer}
                    className="bg-primary-600 px-4 py-2 text-white rounded-r-md hover:bg-primary-700"
                  >
                    <Plus size={16} />
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
                  {selectedEvent ? 'Update Training Event' : 'Create Training Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Training Event Details
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
                    src={selectedEvent.image || 'https://via.placeholder.com/800x300?text=No+Image'} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Event details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About this Training</h3>
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>

                  {selectedEvent.agenda.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Agenda</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedEvent.agenda.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.time}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{item.activity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedEvent.speakers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Speakers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedEvent.speakers.map((speaker, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-md flex items-start">
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 mr-3">
                              {speaker.image ? (
                                <img src={speaker.image} alt={speaker.name} className="h-12 w-12 rounded-full object-cover" />
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
                          <p className="text-gray-600">{formatEventDate(selectedEvent.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Time</p>
                          <p className="text-gray-600">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Location</p>
                          <p className="text-gray-600">{selectedEvent.location}</p>
                        </div>
                      </div>
                      {selectedEvent.organizers.length > 0 && (
                        <div className="flex items-start">
                          <Users className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Organizers</p>
                            <p className="text-gray-600">{selectedEvent.organizers.join(', ')}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedEvent.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration</h3>
                    <p className="text-gray-700 mb-4">
                      {selectedEvent.isFull 
                        ? "This training is currently full." 
                        : "Register for this training event to secure your spot."}
                    </p>
                    <button 
                      className={`w-full py-2 px-4 rounded-md ${
                        selectedEvent.isFull 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                      disabled={selectedEvent.isFull}
                    >
                      {selectedEvent.isFull ? "Registration Closed" : "Register Now"}
                    </button>
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

export default TrainingEvents;
