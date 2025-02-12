export interface NavItem {
  title: string;
  href: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Resource {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article';
  url: string;
}

export interface Event {
  title: string;
  date: string;
  description: string;
  location: string;
  registrationUrl?: string;
}