import React, { useState } from 'react';
import { FileText, Video, BookOpen, Trash2, Edit, Plus, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article';
  description: string;
  url: string;
}

export function ManageResources() {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Pediatric Epilepsy Guidelines',
      type: 'pdf',
      description: 'Comprehensive guidelines for diagnosing and treating pediatric epilepsy',
      url: '#'
    },
    {
      id: '2',
      title: 'Neurological Examination Techniques',
      type: 'video',
      description: 'Video series on proper neurological examination techniques for children',
      url: '#'
    },
    {
      id: '3',
      title: 'Research Methodology Workshop',
      type: 'pdf',
      description: 'Materials from our latest research methodology workshop',
      url: '#'
    },
    {
      id: '4',
      title: 'Case Studies in Child Neurology',
      type: 'article',
      description: 'Collection of interesting case studies from East African hospitals',
      url: '#'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<Pick<Resource, 'title' | 'type' | 'description' | 'url'>>({
    title: '',
    type: 'pdf',
    description: '',
    url: ''
  });

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData(resource);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      setResources(resources.map(r => 
        r.id === editingResource.id ? { ...r, ...formData } : r
      ));
    } else {
      setResources([...resources, { ...formData, id: Date.now().toString() as string } as Resource]);
    }
    setIsModalOpen(false);
    setEditingResource(null);
    setFormData({ title: '', type: 'pdf', description: '', url: '' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'article':
        return BookOpen;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Resources</h1>
        <button
          onClick={() => {
            setEditingResource(null);
            setFormData({ title: '', type: 'pdf', description: '', url: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const Icon = getIcon(resource.type);
          return (
            <div key={resource.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{resource.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <div className="flex items-center justify-between">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
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
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pdf' | 'video' | 'article' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                </select>
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
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
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
                  {editingResource ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}