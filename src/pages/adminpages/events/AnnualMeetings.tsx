import { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Search, MapPin, Users } from 'lucide-react';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const AnnualMeetings = () => {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: '4th Annual EACNA Conference',
      startDate: '2024-10-15',
      endDate: '2024-10-17',
      location: 'Nairobi, Kenya',
      venue: 'Radisson Blu Hotel',
      theme: 'Advancing Pediatric Neurology in East Africa',
      registrations: 150,
      status: 'upcoming',
      abstractDeadline: '2024-08-15'
    },
    {
      id: 2,
      title: '3rd Annual EACNA Conference',
      startDate: '2023-10-10',
      endDate: '2023-10-12',
      location: 'Kampala, Uganda',
      venue: 'Serena Hotel',
      theme: 'Innovation in Child Neurology',
      registrations: 200,
      status: 'completed',
      abstractDeadline: '2023-08-10'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    theme: '',
    capacity: '',
    abstractDeadline: '',
    description: '',
    registrationFee: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Annual Meetings</h1>
        <Button 
          variant="primary"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Meeting
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Form */}
      {showForm && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Create Annual Meeting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.theme}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.abstractDeadline}
                    onChange={(e) => setFormData({...formData, abstractDeadline: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.registrationFee}
                  onChange={(e) => setFormData({...formData, registrationFee: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  type="submit"
                >
                  Create Meeting
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <div className="grid gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                    <p className="text-primary-600 font-medium">{meeting.theme}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {meeting.startDate} - {meeting.endDate}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {meeting.venue}, {meeting.location}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {meeting.registrations} Registrations
                      </p>
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        meeting.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                      {meeting.status === 'upcoming' && (
                        <span className="text-sm text-gray-500">
                          Abstract Deadline: {meeting.abstractDeadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnnualMeetings;