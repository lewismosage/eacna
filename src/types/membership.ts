export type MembershipTier =
  | "Full Membership"
  | "Associate Membership"
  | "Student Membership"
  | "Institutional Membership"
  | "Honorary Membership";

export interface MembershipTierData {
  name: string;
  price: number;
  features: string[];
  color: string;
}

export const membershipTiers: Record<MembershipTier, MembershipTierData> = {
  "Full Membership": {
    name: "Full Membership",
    price: 15000,
    color: "#10B981",
    features: [
      'Voting rights in EACNA elections',
      'Eligibility for leadership positions',
      'Access to all member resources',
      'Priority registration for events',
      'Full conference participation rights'
    ],
  },
  "Associate Membership": {
    name: "Associate Membership",
    price: 10000,
    color: "#3B82F6",
    features: [
      'Access to online resources and clinical guidelines',
      'Discounted rates for conferences and training',
      'Eligibility to participate in research collaborations',
      'Networking opportunities with professionals'
    ],
  },
  "Student Membership": {
    name: "Student Membership",
    price: 5000,
    color: "#3B82F6",
    features: ["Basic resource access", 
      "Student networking", 
      "Mentorship",
      'Access to student resources and educational materials',
      'Discounted rates for student events',
      'Mentorship opportunities',
      'Student newsletter subscription'
    ],
  },
  "Institutional Membership": {
    name: "Institutional Membership",
    price: 50000,
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
  },
  "Honorary Membership": {
    name: "Honorary Membership",
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
  },
};