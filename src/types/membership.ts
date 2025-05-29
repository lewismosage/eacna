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
      "Full access to resources",
      "Voting rights",
      "Conference discounts",
    ],
  },
  "Associate Membership": {
    name: "Associate Membership",
    price: 10000,
    color: "#3B82F6",
    features: [
      "Limited resource access",
      "Community membership",
      "Event access",
    ],
  },
  "Student Membership": {
    name: "Student Membership",
    price: 5000,
    color: "#3B82F6",
    features: ["Basic resource access", "Student networking", "Mentorship"],
  },
  "Institutional Membership": {
    name: "Institutional Membership",
    price: 50000,
    color: "#3B82F6",
    features: [
      "Multiple user accounts",
      "Resource sharing",
      "Organizational recognition",
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
    ],
  },
};