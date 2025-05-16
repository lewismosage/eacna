import { useState } from 'react';
import { Video, Plus, Edit2, Trash2, Search, Calendar, Users, Link as LinkIcon } from 'lucide-react';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const Webinars = () => {
  const [webinars, setWebinars] = useState([
    {
      id: 1,
      title: 'Management of Status Epilepticus in Children',
      date: '2024-07-15',
      time: '14:00',
      duration: '60',
      presenter: 'Dr. Sarah Mwangi',
      platform: 'Zoom',
      registrations: 75,
      status: 'upcoming',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: 2,
      title: 'Advances in Pediatric Epilepsy Surgery',
      date: '2024-06-20',
      time: '15:00',
      duration: '90',
      presenter: 'Dr. James Okello',
      platform: 'Zoom',
      registrations: 100,
      status: 'completed',
      recordingLink: 'https://zoom.us/rec/123456789'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    presenter: '',
    platform: '',
    description: '',
    meetingLink: '',
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
        <h1 className="text-2xl font-bold text-gray-900">Webinars</h1>
        <Button 
          variant="primary"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Webinar
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
                  placeholder="Search webinars..."
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

      {/* Webinar Form */}
      {showForm && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Create Webinar</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webinar Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presenter</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.presenter}
                    onChange={(e) => setFormData({...formData, presenter: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time (EAT)</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="">Select platform</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="meet">Google Meet</option>
                  </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
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
                  Create Webinar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Webinars List */}
      <div className="grid gap-6">
        {webinars.map((webinar) => (
          <Card key={webinar.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Video className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{webinar.title}</h3>
                    <p className="text-primary-600">Presenter: {webinar.presenter}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {webinar.date} at {webinar.time} EAT ({webinar.duration} minutes)
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {webinar.registrations} Registrations
                      </p>
                      {webinar.meetingLink && (
                        <p className="text-gray-600 flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          <a href={webinar.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            Join Meeting
                          </a>
                        </p>
                      )}
                      {webinar.recordingLink && (
                        <p className="text-gray-600 flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          <a href={webinar.recordingLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            View Recording
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        webinar.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                        webinar.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                      </span>
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

export default Webinars;