export type MembershipTier =
  | "Full Member"
  | "Associate Member"
  | "Student Member"
  | "Institutional Member"
  | "Honorary Member";

export interface MembershipTierData {
  name: string;
  price: number;
  features: string[];
  color: string; 
}

export const membershipTiers: Record<MembershipTier, MembershipTierData> = {
  "Full Member": {
    name: "Full Member",
    price: 15000,
    color: "#10B981",
    features: [
      "Full access to resources",
      "Voting rights",
      "Conference discounts",
      
    ],
  },
  "Associate Member": {
    name: "Associate Member",
    price: 10000,
    color: "#3B82F6",
    features: [
      "Limited resource access",
      "Community membership",
      "Event access",
    ],
  },
  "Student Member": {
    name: "Student Member",
    price: 5000,
    color: "#3B82F6",
    features: ["Basic resource access", "Student networking", "Mentorship"],
  },
  "Institutional Member": {
    name: "Institutional Member",
    price: 50000,
    color: "#3B82F6",
    features: [
      "Multiple user accounts",
      "Resource sharing",
      "Organizational recognition",
    ],
  },
  "Honorary Member": {
    name: "Honorary Member",
    price: 0,
    color: "#3B82F6",
    features: [
      "Full membership benefits",
      "Special recognition",
      "Lifetime membership",
    ],
  },
};