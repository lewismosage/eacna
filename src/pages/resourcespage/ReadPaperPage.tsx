import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Bookmark, FileText, Clock, Calendar, Users } from 'lucide-react';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

const ReadPaperPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Publication details
  const publication = {
    id: 1,
    title: "Epilepsy Management Guidelines for East Africa",
    abstract: "This paper presents comprehensive guidelines for the management of epilepsy in East Africa, addressing the unique challenges faced in resource-limited settings. The guidelines offer evidence-based recommendations for diagnosis, treatment, and long-term management tailored to the regional healthcare infrastructure.",
    authors: "Njeri S, Omondi B, Wanjala P, Kimathi M, Achieng J",
    journal: "East African Medical Journal",
    year: "2023",
    pages: "124-152",
    keywords: ["epilepsy", "East Africa", "management guidelines", "pediatric neurology", "resource-limited settings"],
    readTime: "25 minutes",
    publishDate: "April 15, 2023"
  };

  // Full text content (simulated)
  const paperContent = [
    {
      type: "heading",
      level: 1,
      content: "Introduction"
    },
    {
      type: "paragraph",
      content: "Epilepsy affects approximately 70 million people worldwide, with a disproportionately high prevalence in low- and middle-income countries, particularly in sub-Saharan Africa. In East Africa, the prevalence ranges from 5 to 30 per 1,000 population, with significant geographical variations. Despite this high burden, there remains a substantial treatment gap, with many patients lacking access to appropriate diagnosis, treatment, and long-term care."
    },
    {
      type: "paragraph",
      content: "The management of epilepsy in East Africa faces numerous challenges, including limited access to neuroimaging facilities, electroencephalography (EEG), and specialized healthcare providers. Additionally, there are issues related to medication availability, affordability, and adherence, as well as widespread social stigma associated with the condition."
    },
    {
      type: "heading",
      level: 1,
      content: "Methods"
    },
    {
      type: "paragraph",
      content: "These guidelines were developed through a rigorous process involving comprehensive literature review, expert consensus meetings, and stakeholder consultations. A multidisciplinary team of neurologists, pediatricians, primary care physicians, pharmacists, and public health specialists from Kenya, Uganda, Tanzania, Rwanda, and Ethiopia contributed to the development of these guidelines."
    },
    {
      type: "paragraph",
      content: "The guidelines were informed by a systematic review of existing literature on epilepsy management in resource-limited settings, with particular attention to studies conducted in East Africa. Where local evidence was limited, global best practices were adapted to the regional context. The GRADE (Grading of Recommendations Assessment, Development and Evaluation) approach was used to assess the quality of evidence and strength of recommendations."
    },
    {
      type: "heading",
      level: 1,
      content: "Diagnosis of Epilepsy"
    },
    {
      type: "paragraph",
      content: "The diagnosis of epilepsy remains primarily clinical, especially in settings with limited access to diagnostic technologies. A detailed history taking and thorough neurological examination are essential first steps. When available, electroencephalography (EEG) can provide valuable supportive evidence but is not always necessary for diagnosis."
    },
    {
      type: "heading",
      level: 2,
      content: "Clinical History"
    },
    {
      type: "paragraph",
      content: "The clinical history should include detailed descriptions of the seizure events, preferably from both the patient and an eyewitness. Key elements to focus on include: pre-ictal phenomena (aura), ictal characteristics (duration, nature of movements, level of consciousness, automatisms), and post-ictal state. The pattern, frequency, and triggers of seizures should also be documented. A comprehensive medical history, including perinatal events, developmental milestones, head trauma, CNS infections, and family history of epilepsy or other neurological disorders, is crucial."
    },
    {
      type: "heading",
      level: 2,
      content: "Physical Examination"
    },
    {
      type: "paragraph",
      content: "A complete neurological examination should be performed to identify any focal neurological deficits that might suggest the underlying cause or localization of the epileptogenic focus. General physical examination may reveal signs of syndromic conditions associated with epilepsy or evidence of injuries sustained during seizures."
    },
    {
      type: "heading",
      level: 1,
      content: "Management Recommendations"
    },
    {
      type: "paragraph",
      content: "The management of epilepsy in East Africa should follow a stepped care approach, with treatments tailored to available resources and individual patient needs. The primary goal is to achieve seizure freedom with minimal side effects from medications."
    },
    {
      type: "heading",
      level: 2,
      content: "Pharmacological Management"
    },
    {
      type: "paragraph",
      content: "Antiseizure medications (ASMs) remain the mainstay of epilepsy treatment. Initial monotherapy with a first-line ASM appropriate for the seizure type should be started at a low dose and gradually titrated to achieve seizure control or until side effects become limiting. In East Africa, phenobarbital, carbamazepine, phenytoin, and sodium valproate are commonly available and relatively affordable options."
    },
    {
      type: "paragraph",
      content: "For generalized tonic-clonic seizures, all first-line ASMs are effective, with phenobarbital often being the most cost-effective option despite its cognitive and behavioral side effects. For focal seizures, carbamazepine is typically preferred. For absence seizures, sodium valproate or ethosuximide (where available) is recommended. For myoclonic seizures, sodium valproate is the first choice."
    },
    {
      type: "heading",
      level: 1,
      content: "Conclusion"
    },
    {
      type: "paragraph",
      content: "These guidelines provide a framework for the management of epilepsy in East Africa, considering the unique challenges faced in the region. The recommendations emphasize a pragmatic approach that maximizes available resources while striving to provide optimal care. Implementation of these guidelines should be adapted to local contexts and complemented by ongoing efforts to strengthen healthcare systems, improve access to diagnostics and medications, train healthcare workers, and reduce stigma associated with epilepsy."
    },
    {
      type: "paragraph",
      content: "Regular review and updates of these guidelines will be essential as new evidence emerges and healthcare infrastructure evolves across the region. Collaborative efforts between governments, healthcare providers, researchers, non-governmental organizations, and communities will be crucial to improving epilepsy care in East Africa."
    }
  ];

  // References (simulated)
  const references = [
    "World Health Organization. (2019). Epilepsy: a public health imperative. Geneva: World Health Organization.",
    "Ba-Diop, A., Marin, B., Druet-Cabanac, M., Ngoungou, E. B., Newton, C. R., & Preux, P. M. (2014). Epidemiology, causes, and treatment of epilepsy in sub-Saharan Africa. The Lancet Neurology, 13(10), 1029-1044.",
    "Prevett, M. (2013). Epilepsy in sub-Saharan Africa. Practical Neurology, 13(1), 14-20.",
    "Kariuki, S. M., Matuja, W., Akpalu, A., Kakooza-Mwesige, A., Chabi, M., Wagner, R. G., ... & Newton, C. R. (2014). Clinical features, proximate causes, and consequences of active convulsive epilepsy in Africa. Epilepsia, 55(1), 76-85.",
    "Kwan, P., Arzimanoglou, A., Berg, A. T., Brodie, M. J., Allen Hauser, W., Mathern, G., ... & French, J. (2010). Definition of drug resistant epilepsy: consensus proposal by the ad hoc Task Force of the ILAE Commission on Therapeutic Strategies. Epilepsia, 51(6), 1069-1077."
  ];

  return (
    <>
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
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                  {publication.title}
                </h1>
                
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{publication.publishDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{publication.readTime} read</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>By {publication.authors}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
                  <h2 className="font-semibold text-gray-900 mb-2">Abstract</h2>
                  <p className="text-gray-700">{publication.abstract}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {publication.keywords.map((keyword, index) => (
                    <span key={index} className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </header>
              
              {/* Paper main content */}
              <div className="prose prose-primary prose-lg max-w-none">
                {paperContent.map((section, index) => {
                  if (section.type === "heading" && section.level === 1) {
                    return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{section.content}</h2>;
                  } else if (section.type === "heading" && section.level === 2) {
                    return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{section.content}</h3>;
                  } else {
                    return <p key={index} className="mb-4">{section.content}</p>;
                  }
                })}
                
                {/* References section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold mb-6">References</h2>
                  <ol className="list-decimal pl-5 space-y-2">
                    {references.map((reference, index) => (
                      <li key={index} className="text-gray-700">{reference}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-4">Publication Details</h3>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Journal:</span>
                    <span className="text-gray-900">{publication.journal}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Year:</span>
                    <span className="text-gray-900">{publication.year}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Pages:</span>
                    <span className="text-gray-900">{publication.pages}</span>
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" /> Share Paper
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Bookmark className="h-4 w-4 mr-2" /> Save for Later
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
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default ReadPaperPage;