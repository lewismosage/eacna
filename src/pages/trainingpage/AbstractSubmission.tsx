// src/pages/AbstractSubmissionPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, User,  Building, } from 'lucide-react';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AbstractSubmissionPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
    country: '',
    abstractTitle: '',
    abstractText: '',
    presentationPreference: 'oral',
    file: null as File | null,
    agreeTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.abstractTitle.trim()) newErrors.abstractTitle = 'Abstract title is required';
    if (!formData.abstractText.trim()) newErrors.abstractText = 'Abstract text is required';
    if (formData.abstractText.trim().length < 250) newErrors.abstractText = 'Abstract must be at least 250 characters';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let filePath = null;

      // Upload file if exists
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        filePath = `abstracts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('abstract_files')
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;
      }

      // Insert abstract submission
      const { data, error } = await supabase
        .from('abstract_submissions')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          country: formData.country,
          abstract_title: formData.abstractTitle,
          abstract_text: formData.abstractText,
          presentation_preference: formData.presentationPreference,
          file_path: filePath,
          status: 'pending'
        }])
        .select();

      if (error) throw error;

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        institution: '',
        country: '',
        abstractTitle: '',
        abstractText: '',
        presentationPreference: 'oral',
        file: null,
        agreeTerms: false
      });

    } catch (err) {
      console.error("Error submitting abstract:", err);
      setErrors({
        submit: 'Failed to submit abstract. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Submission Form Section */}
      <Section>
        <div className="max-w-4xl mx-auto">
          {submitSuccess ? (
            <motion.div 
              className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Submission Successful!</h2>
              <p className="text-green-700 mb-4">
                Thank you for submitting your abstract. We've received your submission and will review it carefully.
              </p>
              <p className="text-green-700">
                 If you have any questions, please contact us at 
                <a href="mailto:info@eacna.co.ke" className="font-semibold underline ml-1">info@eacna.co.ke</a>.
              </p>
              <Button 
                variant="primary" 
                className="mt-6"
                onClick={() => setSubmitSuccess(false)}
              >
                Submit Another Abstract
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-primary-700 text-white p-6">
                  <h2 className="text-2xl font-bold">Abstract Submission Form</h2>
                  <p className="text-primary-100">
                    Please complete all required fields and submit your abstract by August 15, 2024.
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary-600" />
                        Author Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-primary-600" />
                        Institution Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                            Institution <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                          {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          />
                          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary-600" />
                      Abstract Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="abstractTitle" className="block text-sm font-medium text-gray-700 mb-1">
                          Abstract Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="abstractTitle"
                          name="abstractTitle"
                          value={formData.abstractTitle}
                          onChange={handleChange}
                          className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                        />
                        {errors.abstractTitle && <p className="mt-1 text-sm text-red-600">{errors.abstractTitle}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="presentationPreference" className="block text-sm font-medium text-gray-700 mb-1">
                          Presentation Preference
                        </label>
                        <select
                          id="presentationPreference"
                          name="presentationPreference"
                          value={formData.presentationPreference}
                          onChange={handleChange}
                          className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                        >
                          <option value="oral">Oral Presentation</option>
                          <option value="poster">Poster Presentation</option>
                          <option value="no-preference">No Preference</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="abstractText" className="block text-sm font-medium text-gray-700 mb-1">
                          Abstract Text <span className="text-red-500">*</span>
                          <span className="text-gray-500 text-xs font-normal ml-2">(Minimum 250 characters)</span>
                        </label>
                        <textarea
                          id="abstractText"
                          name="abstractText"
                          value={formData.abstractText}
                          onChange={handleChange}
                          rows={8}
                          className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                        ></textarea>
                        {errors.abstractText && <p className="mt-1 text-sm text-red-600">{errors.abstractText}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                          Character count: {formData.abstractText.length}
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Supporting Document (Optional)
                          <span className="text-gray-500 text-xs font-normal ml-2">(PDF, DOC, DOCX - Max 5MB)</span>
                        </label>
                        <div className="mt-1 flex items-center">
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </label>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            {formData.file ? formData.file.name : 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeTerms"
                          name="agreeTerms"
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={handleCheckboxChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                          I agree to the terms and conditions <span className="text-red-500">*</span>
                        </label>
                        {errors.agreeTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>}
                        <p className="text-gray-500">
                          By submitting this abstract, I confirm that all authors have approved this abstract for submission 
                          and that the content is original. I understand that if accepted, at least one author must register 
                          for and attend the conference to present the abstract.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Abstract'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </Section>
    </>
  );
};

export default AbstractSubmissionPage;