// components/admin/AbstractSettings.tsx
import { useState, useEffect } from 'react';
import { Save, Calendar, FileText, Download, Check } from 'lucide-react';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Textarea from '../../../components/common/Textarea';

// Form data structure
interface AbstractSettingsData {
  submissionLink: string;
  guidelines: string;
  submissionDeadline: string;
  acceptanceNotification: string;
  earlyRegistrationDeadline: string;
}

const AbstractSubmissions = () => {
  // State for form data
  const [formData, setFormData] = useState<AbstractSettingsData>({
    submissionLink: '',
    guidelines: '',
    submissionDeadline: '',
    acceptanceNotification: '',
    earlyRegistrationDeadline: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData: AbstractSettingsData = {
        submissionLink: 'https://forms.google.com/example-abstract-submission',
        guidelines: 'Please submit your abstract in English, not exceeding 300 words. Include background, methods, results, and conclusion sections. All submissions will be peer-reviewed.',
        submissionDeadline: '2024-08-15',
        acceptanceNotification: '2024-09-01',
        earlyRegistrationDeadline: '2024-09-15'
      };
      
      setFormData(mockData);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Data saved:', formData);
      setSaving(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">Abstract Submission Settings</h1>
      
      <Card className="mb-8">
        <CardContent>
          <form onSubmit={handleSubmit}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submission Link */}
                <div>
                  <label htmlFor="submissionLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Abstract Submission Link
                  </label>
                  <Input
                    type="url"
                    id="submissionLink"
                    name="submissionLink"
                    value={formData.submissionLink}
                    onChange={handleChange}
                    placeholder="https://forms.google.com/..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The URL where users will submit their abstracts (Google Forms, etc.)
                  </p>
                </div>
                
                {/* Guidelines */}
                <div>
                <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700 mb-1">
                    Submission Guidelines
                </label>
                <textarea
                    id="guidelines"
                    name="guidelines"
                    value={formData.guidelines}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[150px]"
                    required
                />
                <p className="mt-1 text-sm text-gray-500">
                    Detailed instructions for abstract submission (format, word limit, etc.)
                </p>
                </div>
                
                {/* Key Dates Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Dates</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Submission Deadline */}
                    <div>
                      <label htmlFor="submissionDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                        Submission Deadline
                      </label>
                      <Input
                        type="date"
                        id="submissionDeadline"
                        name="submissionDeadline"
                        value={formData.submissionDeadline}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Acceptance Notification */}
                    <div>
                      <label htmlFor="acceptanceNotification" className="block text-sm font-medium text-gray-700 mb-1">
                        Notification of Acceptance
                      </label>
                      <Input
                        type="date"
                        id="acceptanceNotification"
                        name="acceptanceNotification"
                        value={formData.acceptanceNotification}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Early Registration Deadline */}
                    <div>
                      <label htmlFor="earlyRegistrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                        Early Registration Deadline
                      </label>
                      <Input
                        type="date"
                        id="earlyRegistrationDeadline"
                        name="earlyRegistrationDeadline"
                        value={formData.earlyRegistrationDeadline}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Success message */}
                {success && (
                  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Settings saved successfully!
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbstractSubmissions;