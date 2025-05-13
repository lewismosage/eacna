// mockData.ts
export const MOCK_USER = {
    firstName: "Lewis",
    lastName: "Mosage",
    email: "lewis.mosage@example.com",
    profileImage: null,
    role: "Associate Member",
    joinDate: "May 2024",
    unreadNotifications: 3,
    country: "Kenya"
  };
  
  export const MOCK_POSTS = [
    {
      id: 1,
      author: {
        name: "Dr. Samantha Njeri",
        role: "President, EACNA",
        avatar: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      content: "Excited to announce our upcoming PET1 training in Nairobi this July! This one-day course is perfect for doctors and nurses who contribute to the initial care of children with paroxysmal disorders. Limited spots available, register now via the Training section.",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 5,
      isPinned: true,
      attachments: []
    },
    {
      id: 2,
      author: {
        name: "Dr. Benjamin Omondi",
        role: "Vice President, EACNA",
        avatar: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      content: "Looking for collaborators on a research project studying epilepsy management in rural East African settings. We're particularly interested in innovative approaches to medication adherence. If interested, please comment below or message me directly.",
      timestamp: "1 day ago",
      likes: 18,
      comments: 7,
      isPinned: false,
      attachments: [
        { type: "pdf", name: "Research_Proposal.pdf", size: "1.2MB" }
      ]
    },
    {
      id: 3,
      author: {
        name: "Dr. Faith Mueni",
        role: "Secretary General, EACNA",
        avatar: "https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      content: "New clinical guidelines for childhood epilepsy management have just been published. These guidelines specifically address the unique challenges we face in East Africa. Check out the attached summary and full document in the Resources section of our portal.",
      timestamp: "3 days ago",
      likes: 42,
      comments: 11,
      isPinned: false,
      attachments: [
        { type: "pdf", name: "Epilepsy_Guidelines_Summary.pdf", size: "850KB" }
      ]
    },
    {
      id: 4,
      author: {
        name: "Dr. Lawrence Mwangi",
        role: "Treasurer, EACNA",
        avatar: "https://images.pexels.com/photos/5329163/pexels-photo-5329163.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      content: "Reminder: Annual membership renewals are due by the end of this month. Please log in to your account and navigate to the Membership section to complete your renewal. Early renewals get 10% discount on our upcoming annual conference registration!",
      timestamp: "1 week ago",
      likes: 15,
      comments: 3,
      isPinned: false,
      attachments: []
    }
  ];
  
  export const MOCK_EVENTS = [
    {
      id: 1,
      title: "PET1 Training Course",
      date: "July 15-16, 2025",
      location: "Nairobi, Kenya",
      registrationOpen: true
    },
    {
      id: 2,
      title: "Annual EACNA Conference",
      date: "September 5-7, 2025",
      location: "Kampala, Uganda",
      registrationOpen: true
    },
    {
      id: 3,
      title: "Pediatric Epilepsy Webinar",
      date: "June 12, 2025",
      location: "Online",
      registrationOpen: true
    }
  ];
  
  export const NAV_ITEMS = [
    { 
      icon: "Users", 
      label: "Home Feed", 
      path: "home", 
      badge: null 
    },
    { 
      icon: "MessageSquare", 
      label: "Forums", 
      path: "forums", 
      badge: null 
    },
    { 
      icon: "BookOpen", 
      label: "Publications", 
      path: "publications", 
      badge: null 
    },
    { 
      icon: "Calendar", 
      label: "Events", 
      path: "events", 
      badge: null 
    },
    { 
      icon: "Bell", 
      label: "Notifications", 
      path: "notifications", 
      badge: MOCK_USER.unreadNotifications 
    }
  ];
  
  export const FORUM_CATEGORIES = [
    {
      name: "Clinical Cases & Discussions",
      description: "Share interesting cases and seek input from colleagues.",
      topics: 24,
      lastPost: "2 hours ago"
    },
    {
      name: "Research Collaboration",
      description: "Find research partners and discuss methodology.",
      topics: 16,
      lastPost: "Yesterday"
    },
    {
      name: "Treatment Guidelines",
      description: "Discuss and share best practices for treatment protocols.",
      topics: 32,
      lastPost: "3 days ago"
    },
    {
      name: "Conference Discussions",
      description: "Share insights from recent conferences and events.",
      topics: 8,
      lastPost: "1 week ago"
    },
    {
      name: "New Members Forum",
      description: "Introduce yourself and get to know other members.",
      topics: 12,
      lastPost: "5 days ago"
    },
    {
      name: "Ask the Experts",
      description: "Get answers to your questions from senior specialists.",
      topics: 19,
      lastPost: "Yesterday"
    }
  ];
  
  export const QUICK_LINKS = [
    {
      icon: "BookOpen",
      label: "Clinical Guidelines",
      path: "/resources/guidelines"
    },
    {
      icon: "Calendar",
      label: "PET Courses Schedule",
      path: "/training/pet-courses"
    },
    {
      icon: "Award",
      label: "Renew Membership",
      path: "/membership/renew"
    },
    {
      icon: "FileText",
      label: "Journal Access",
      path: "/resources/journal-access"
    }
  ];