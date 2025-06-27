// utils/searchIndex.ts

/**
 * Interface for search items in the EACNA website
 */
export interface SearchItem {
  title: string;
  description: string;
  url: string;
  keywords: string[];
  category?: string;
}

/**
 * Comprehensive search index for the EACNA website
 * Organized by main categories with detailed keywords
 */
const searchIndex: SearchItem[] = [
  // Home Page
  {
    title: "Home",
    description: "East African Child Neurology Association's official website",
    url: "/",
    keywords: ["home", "eacna", "east african", "child neurology", "main", "homepage"],
    category: "navigation"
  },
  {
    title: "Our Leadership",
    description: "Meet the leadership team of EACNA",
    url: "/#leadership",
    keywords: ["leadership", "team", "board", "president"],
    category: "about"
  },

  // About Us
  {
    title: "About EACNA",
    description: "Learn about the East African Child Neurology Association and our mission",
    url: "/about",
    keywords: ["about", "organization", "mission", "vision", "history", "established", "values", "mandate"],
    category: "about"
  },
  
  {
    title: "Core Values",
    description: "The principles that guide our work at EACNA",
    url: "/about#values",
    keywords: ["values", "excellence", "collaboration"],
    category: "about"
  },
  {
    title: "Our Partners",
    description: "Organizations partnering with EACNA",
    url: "/about#partners",
    keywords: ["partners", "collaborations"],
    category: "about"
  },

  // Membership
  {
    title: "Membership",
    description: "Join or renew your EACNA membership",
    url: "/membership",
    keywords: ["join", "renew", "member", "membership", "register", "application", "benefits", "dues", "fees"],
    category: "membership"
  },
  {
    title: "Membership Categories",
    description: "Different types of membership available at EACNA",
    url: "/membership#categories",
    keywords: ["membership categories"],
    category: "membership"
  },
  {
    title: "How to Join",
    description: "Step-by-step guide to joining EACNA",
    url: "/membership#membership-form",
    keywords: ["join", "application"],
    category: "membership"
  },
  {
    title: "Member Benefits",
    description: "Benefits of being an EACNA member",
    url: "/membership#benefits",
    keywords: ["benefits", "advantages", "perks", "research access", "journals", "career growth", "scholarships", "networking", "member advantages"],
    category: "membership"
  },
  {
    title: "Membership FAQ",
    description: "Frequently asked questions about EACNA membership",
    url: "/membership#faq",
    keywords: ["faq", "questions", "answers", "help", "membership questions", "frequently asked questions"],
    category: "membership"
  },

  // Training & Conferences
  {
    title: "Training & Conferences",
    description: "Educational opportunities and events by EACNA",
    url: "/training",
    keywords: ["training", "conferences", "education", "events", "workshops", "seminars", "courses", "professional development"],
    category: "training"
  },
  {
    title: "Paediatric Epilepsy Training (PET)",
    description: "Specialized training programs for pediatric epilepsy management",
    url: "/training#pet",
    keywords: ["pet", "paediatric epilepsy training", "epilepsy", "bpna", "ilae", "pet1", "pet2", "pet3", "pet4ward", "epilepsy training"],
    category: "training"
  },
  {
    title: "PET Courses (PET)",
    description: "Specialized training programs for pediatric epilepsy management",
    url: "/training#pet-courses",
    keywords: ["pet", "paediatric epilepsy training", "epilepsy", "bpna", "ilae", "pet1", "pet2", "pet3", "pet4ward", "epilepsy training"],
    category: "training"
  },
  {
    title: "Upcoming Events",
    description: "Calendar of upcoming EACNA training events and conferences",
    url: "/training#upcoming-events",
    keywords: ["events", "upcoming", "calendar", "schedule", "training events", "conferences", "seminars", "workshops", "pet training", "annual conference", "webinars"],
    category: "training"
  },
  {
    title: "Annual Conferences",
    description: "Information about EACNA's annual conferences",
    url: "/training#conferences",
    keywords: ["conferences", "annual", "annual meeting", "symposium", "convention", "event", "2021", "2022", "2023", "archives"],
    category: "training"
  },
  {
    title: "Webinars & Online Events",
    description: "Virtual educational events hosted by EACNA",
    url: "/training#conferences",
    keywords: ["webinars", "online", "virtual", "digital", "remote", "zoom", "epilepsy webinar", "online training", "recordings"],
    category: "training"
  },
  {
    title: "Abstract Submission",
    description: "Submit research abstracts for EACNA conferences",
    url: "/training#abstracts",
    keywords: ["abstracts", "research", "submission", "present", "call for abstracts", "research presentations", "guidelines", "deadlines"],
    category: "training"
  },

  // Resources
  {
    title: "Resources & Publications",
    description: "Educational and clinical resources for child neurology professionals",
    url: "/resources",
    keywords: ["resources", "publications", "materials", "guides", "tools", "literature", "educational materials"],
    category: "resources"
  },
  {
    title: "Latest Publications",
    description: "Recent research papers and publications by EACNA members",
    url: "/resources#publications",
    keywords: ["publications", "papers", "research", "articles", "journals", "studies", "case studies", "epilepsy management", "neurodevelopmental disorders"],
    category: "resources"
  },
  {
    title: "Clinical Resources",
    description: "Practical clinical tools and guidelines for pediatric neurology",
    url: "/resources#clinical-resources",
    keywords: ["clinical", "guidelines", "protocols", "handbooks", "assessment tools", "management", "diagnosis", "treatment", "evaluation"],
    category: "resources"
  },
  {
    title: "Educational Videos",
    description: "Instructional videos on pediatric neurology topics",
    url: "/resources#videos",
    keywords: ["videos", "tutorials", "educational", "instructional", "lectures", "demonstrations", "seizure recognition", "neurological examination", "developmental milestones"],
    category: "resources"
  },
  {
    title: "Recommended Reading",
    description: "Suggested books and literature for pediatric neurology professionals",
    url: "/resources#reading",
    keywords: ["reading", "books", "literature", "textbooks", "journals", "bibliography", "references", "swaiman", "volpe", "pellock"],
    category: "resources"
  },

  // Find a Specialist
  {
    title: "Find a Specialist",
    description: "Search for child neurology specialists in East Africa",
    url: "/find-specialist",
    keywords: ["find", "search", "specialist", "doctor", "neurologist", "pediatrician", "consultant", "expert", "provider", "physician"],
    category: "specialists"
  },
  {
    title: "Specialist Directory",
    description: "Complete directory of EACNA registered specialists",
    url: "/find-specialist#specialist-list",
    keywords: ["directory", "list", "specialists", "experts", "doctors", "neurologists", "profiles", "contacts", "kenya", "uganda", "tanzania", "rwanda"],
    category: "specialists"
  },
  {
    title: "Join Our Directory",
    description: "Information for specialists wishing to be listed in the EACNA directory",
    url: "/find-specialist#directory",
    keywords: ["join directory", "add profile", "list practice", "specialist registration", "doctor listing"],
    category: "specialists"
  },

  // Gallery
  {
    title: "Gallery",
    description: "Photos and media from EACNA events and activities",
    url: "/gallery",
    keywords: ["gallery", "photos", "images", "media", "pictures", "events", "conferences", "activities"],
    category: "media"
  },

  // Contact
  {
    title: "Contact Us",
    description: "Get in touch with the EACNA team",
    url: "/contact",
    keywords: ["contact", "email", "phone", "address", "message", "inquiries", "support", "help", "location", "office"],
    category: "contact"
  },
  // Other Important Pages
  {
    title: "Privacy Policy",
    description: "EACNA's privacy policy",
    url: "/privacy-policy",
    keywords: ["privacy", "policy", "data", "information", "gdpr", "confidentiality"],
    category: "legal"
  },
  {
    title: "Terms of Service",
    description: "Terms of service for using EACNA's website",
    url: "/terms-of-service",
    keywords: ["terms", "conditions", "service", "agreement", "legal", "usage"],
    category: "legal"
  },
  {
    title: "Cookie Policy",
    description: "EACNA's policy on cookies and tracking",
    url: "/cookie-policy",
    keywords: ["cookies", "tracking", "policy", "browser", "data"],
    category: "legal"
  }
];

/**
 * Function to search the index based on a query string
 * @param query - The search query
 * @returns Array of matching search items
 */
export function searchSite(query: string): SearchItem[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return searchIndex.filter(item => {
    // Check if query matches title or description
    if (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    ) {
      return true;
    }
    
    // Check if query matches any keywords
    return item.keywords.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Function to search the index by category
 * @param category - The category to filter by
 * @returns Array of search items in the specified category
 */
export function getItemsByCategory(category: string): SearchItem[] {
  return searchIndex.filter(item => item.category === category);
}

export default searchIndex;