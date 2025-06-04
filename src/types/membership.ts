export type MembershipTier =
  | "Full Membership"
  | "Associate Membership"
  | "Student Membership"
  | "Institutional Membership"
  | "Honorary Membership";

export interface MembershipTierData {
  name: string;
  description: string;
  price: number;
  features: string[];
  color: string;
  rank:number;
}

export const membershipTiers: Record<MembershipTier, MembershipTierData> = {
  "Full Membership": {
    name: "Full Membership",
    description: 'For fully qualified child neurologists and senior professionals',
    price: 8000,
    color: "#10B981",
    features: [
      'Voting rights in EACNA elections',
      'Eligibility for leadership positions',
      'Access to all member resources',
      'Priority registration for events',
      'Full conference participation rights'
    ],
    rank: 3
  },
  "Associate Membership": {
    name: "Associate Membership",
    description: 'For junior professionals and those in training programs',
    price: 5000,
    color: "#3B82F6",
    features: [
      'Access to online resources and clinical guidelines',
      'Discounted rates for conferences and training',
      'Eligibility to participate in research collaborations',
      'Networking opportunities with professionals'
    ],
    rank: 2
  },
  "Student Membership": {
    name: "Student Membership",
    description: 'For medical students and residents interested in child neurology',
    price: 1500,
    color: "#3B82F6",
    features: ["Basic resource access", 
      "Student networking", 
      "Mentorship",
      'Access to student resources and educational materials',
      'Discounted rates for student events',
      'Mentorship opportunities',
      'Student newsletter subscription'
    ],
    rank: 1
  },
  "Institutional Membership": {
    name: "Institutional Membership",
    description: 'For hospitals, universities, and research institutions',
    price: 15000,
    color: "#3B82F6",
    features: [
      "Resource sharing",
      "Organizational recognition",
      'Multiple user access for institution staff',
      'Institutional listing in EACNA directory',
      'Access to institutional grants',
      'Collaboration opportunities',
      'Customized training programs'
    ],
    rank: 4
  },
  "Honorary Membership": {
    name: "Honorary Membership",
    description: 'For distinguished contributors to child neurology',
    price: 0,
    color: "#3B82F6",
    features: [
      "Full membership benefits",
      "Special recognition",
      "Lifetime membership",
      'Lifetime membership privileges',
      'Recognition at annual conference',
      'Invitation to advisory committees',
      'All Full Membership benefits'
    ],
    rank: 5
  },
};

