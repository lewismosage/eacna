import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Trash2, Edit, Plus, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'conference' | 'workshop' | 'seminar' | 'other';
  isPast: boolean;
  registrationUrl?: string;
}

export function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Annual East African Child Neurology Conference',
      date: '2024-06-15',
      location: 'Serena Hotel, Nairobi',
      description: 'Join leading experts for our flagship conference featuring keynote speakers, workshops, and networking opportunities.',
      type: 'conference',
      isPast: false,
      registrationUrl: '#'
    },
    {
      id: '2',
      title: 'Pediatric Epilepsy Workshop',
      date: '2024-07-08',
      location: 'Aga Khan University Hospital, Dar es Salaam',
      description: 'Intensive workshop on the latest developments in pediatric epilepsy diagnosis and treatment.',
      type: 'workshop',
      isPast: false,
      registrationUrl: '#'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    location: '',
    description: '',
    type: 'conference',
    isPast: false,
    registrationUrl: ''
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData(event);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id ? { ...formData, id: event.id } : event
      ));
    } else {
      setEvents([...events, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      location: '',
      description: '',
      type: 'conference',
      isPast: false,
      registrationUrl: ''
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              date: '',
              location: '',
              description: '',
              type: 'conference',
              isPast: false,
              registrationUrl: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className={`bg-white rounded-lg shadow-md p-6 ${
              event.isPast ? 'opacity-75' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
              {event.isPast && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  Past Event
                </span>
              )}
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center justify-between">
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Registration Link
                </a>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'conference' | 'workshop' | 'seminar' | 'other' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration URL
                </label>
                <input
                  type="url"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPast"
                  checked={formData.isPast}
                  onChange={(e) => setFormData({ ...formData, isPast: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPast" className="ml-2 block text-sm text-gray-900">
                  Mark as past event
                </label>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingEvent ? 'Save Changes' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}