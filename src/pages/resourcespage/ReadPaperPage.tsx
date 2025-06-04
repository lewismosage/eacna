import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Clock, Calendar, Users, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  journal?: string;
  year?: string;
  pages?: string;
  keywords: string[];
  created_at: string;
  sections: {
    type: "heading" | "paragraph";
    content: string;
    level?: number;
  }[];
  publication_references: string[];
}

const ReadPaperPage = () => {
  const { id } = useParams();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setIsLoading(true);
        
        const { data, error: supabaseError } = await supabase
          .from('publications')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error('Publication not found or not published');

        setPublication(data);
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError(err instanceof Error ? err.message : 'Failed to load publication');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Publication</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/resources">
            <Button variant="primary">Back to Publications</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="container-custom py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Publication Not Found</h2>
          <p className="text-gray-600 mb-6">The requested publication could not be found or is not published.</p>
          <Link to="/resources">
            <Button variant="primary">Back to Publications</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Estimate read time based on content length
  const estimateReadTime = () => {
    if (!publication.sections) return '10 minutes'; // Default if no sections
    
    const contentLength = publication.sections.reduce(
      (acc, section) => acc + (section.content?.length || 0),
      0
    );
    const wordsPerMinute = 200;
    const minutes = Math.ceil(contentLength / 5 / wordsPerMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div initial="hidden" animate="visible">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link to="/resources" className="inline-flex items-center text-gray-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Publications
          </Link>
        </div>
      </div>
      
      {/* Paper Content */}
      <article className="bg-white">
        <div className="container-custom py-10">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Main content */}
            <div className="lg:col-span-8">
              <motion.header className="mb-8" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                  {publication.title}
                </h1>
                
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(publication.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{estimateReadTime()}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{publication.authors}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
                  <h2 className="font-semibold text-gray-900 mb-2">Abstract</h2>
                  <p className="text-gray-700">{publication.abstract}</p>
                </div>
                
                {publication.keywords && publication.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {publication.keywords.map((keyword, index) => (
                      <span key={index} className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </motion.header>
              
              {/* Paper main content */}
              <div className="prose prose-primary prose-lg max-w-none">
                {publication.sections?.map((section, index) => {
                  if (section.type === "heading" && section.level === 1) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{section.content}</h2>;
                  } else if (section.type === "heading" && section.level === 2) {
                    return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{section.content}</h3>;
                  } else {
                    return <p key={index} className="mb-4">{section.content}</p>;
                  }
                })}
                
                {/* References section */}
                {publication.publication_references?.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold mb-6">References</h2>
                    <ol className="list-decimal pl-5 space-y-2">
                      {publication.publication_references.map((reference, index) => (
                        <li key={index} className="text-gray-700">{reference}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <motion.div 
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-8"
                variants={fadeIn}
              >
                <h3 className="font-semibold text-gray-900 mb-4">Publication Details</h3>
                
                <ul className="space-y-3 mb-6">
                  {publication.journal && (
                    <li className="flex items-start">
                      <span className="text-gray-600 w-24 flex-shrink-0">Journal:</span>
                      <span className="text-gray-900">{publication.journal}</span>
                    </li>
                  )}
                  {publication.year && (
                    <li className="flex items-start">
                      <span className="text-gray-600 w-24 flex-shrink-0">Year:</span>
                      <span className="text-gray-900">{publication.year}</span>
                    </li>
                  )}
                  {publication.pages && (
                    <li className="flex items-start">
                      <span className="text-gray-600 w-24 flex-shrink-0">Pages:</span>
                      <span className="text-gray-900">{publication.pages}</span>
                    </li>
                  )}
                </ul>
                
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" /> Share Paper
                  </Button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Papers</h3>
                  
                  <ul className="space-y-4">
                    <li>
                      <a href="#" className="block hover:bg-gray-50 rounded p-2 -mx-2">
                        <h4 className="text-primary-700 font-medium mb-1 hover:underline">
                          Challenges in Diagnosing Pediatric Epilepsy in Resource-Limited Settings
                        </h4>
                        <p className="text-xs text-gray-500">Mwangi L, Njeri S, et al. (2023)</p>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block hover:bg-gray-50 rounded p-2 -mx-2">
                        <h4 className="text-primary-700 font-medium mb-1 hover:underline">
                          Anti-Seizure Medication Availability in East African Countries
                        </h4>
                        <p className="text-xs text-gray-500">Omondi B, et al. (2022)</p>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block hover:bg-gray-50 rounded p-2 -mx-2">
                        <h4 className="text-primary-700 font-medium mb-1 hover:underline">
                          Telemedicine for Epilepsy Management in Rural East Africa
                        </h4>
                        <p className="text-xs text-gray-500">Kimathi L, et al. (2023)</p>
                      </a>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
};

export default ReadPaperPage;