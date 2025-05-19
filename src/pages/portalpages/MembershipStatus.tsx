import { useState } from 'react';
import { Award, Clock, CreditCard, Calendar, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CertificateSection from './CertificateSection'; 

// Mock membership data for demonstration
const MOCK_MEMBERSHIP = {
  status: "Active",
  type: "Associate Member",
  startDate: "May 15, 2024",
  expiryDate: "May 14, 2025",
  membershipId: "EACNA-2024-KE-1289",
  renewalFee: 150,
  upgradeFee: 250,
  benefits: [
    "Access to online resources and clinical guidelines",
    "Discounted rates for conferences and training",
    "Eligibility to participate in research collaborations",
    "Networking opportunities with professionals across East Africa"
  ],
  upgradeBenefits: [
    "Voting rights in EACNA elections",
    "Eligibility for leadership positions",
    "Priority registration for limited-seat events",
    "Access to exclusive full-member workshops"
  ],
  // Added history to determine upgrade vs renewal logic
  membershipHistory: ["Student Membership", "Associate Membership"]
};

// Membership data with benefits for each tier
type MembershipTierKey =
  | 'Full Membership'
  | 'Associate Membership'
  | 'Student Membership'
  | 'Institutional Membership'
  | 'Honorary Membership';

type MembershipTier = {
  description: string;
  benefits: string[];
  fee: number;
  // Added rank to determine upgrade vs renewal logic
  rank: number;
};

const MEMBERSHIP_TIERS: Record<MembershipTierKey, MembershipTier> = {
  'Full Membership': {
    description: 'For fully qualified child neurologists and senior professionals',
    benefits: [
      'Voting rights in EACNA elections',
      'Eligibility for leadership positions',
      'Access to all member resources',
      'Priority registration for events',
      'Full conference participation rights'
    ],
    fee: 300,
    rank: 3
  },
  'Associate Membership': {
    description: 'For junior professionals and those in training programs',
    benefits: [
      'Access to online resources and clinical guidelines',
      'Discounted rates for conferences and training',
      'Eligibility to participate in research collaborations',
      'Networking opportunities with professionals'
    ],
    fee: 150,
    rank: 2
  },
  'Student Membership': {
    description: 'For medical students and residents interested in child neurology',
    benefits: [
      'Access to student resources and educational materials',
      'Discounted rates for student events',
      'Mentorship opportunities',
      'Student newsletter subscription'
    ],
    fee: 50,
    rank: 1
  },
  'Institutional Membership': {
    description: 'For hospitals, universities, and research institutions',
    benefits: [
      'Multiple user access for institution staff',
      'Institutional listing in EACNA directory',
      'Access to institutional grants',
      'Collaboration opportunities',
      'Customized training programs'
    ],
    fee: 1000,
    rank: 4
  },
  'Honorary Membership': {
    description: 'For distinguished contributors to child neurology',
    benefits: [
      'Lifetime membership privileges',
      'Recognition at annual conference',
      'Invitation to advisory committees',
      'All Full Membership benefits'
    ],
    fee: 0,
    rank: 5
  }
};

// Helper function to get current membership tier key from type string
const getCurrentMembershipTierKey = (membershipType: string): MembershipTierKey => {
  const type = membershipType.replace(' Member', '');
  return `${type} Membership` as MembershipTierKey;
};

interface MembershipOptionsProps {
  currentMembership: {
    type: string;
    startDate: string;
    expiryDate: string;
    membershipId: string;
    renewalFee: number;
    upgradeFee: number;
    benefits: string[];
    upgradeBenefits: string[];
    membershipHistory: string[];
  };
}

const MembershipOptions = ({ currentMembership }: MembershipOptionsProps) => {
  const [selectedTier, setSelectedTier] = useState<MembershipTierKey | null>(null);
  const navigate = useNavigate();

  // Get current membership tier key and rank
  const currentTierKey = getCurrentMembershipTierKey(currentMembership.type);
  const currentTierRank = MEMBERSHIP_TIERS[currentTierKey].rank;
  
  // Filter available tiers based on current membership
  const availableTiers = Object.keys(MEMBERSHIP_TIERS).filter(tier => {
    const tierRank = MEMBERSHIP_TIERS[tier as MembershipTierKey].rank;
    return tierRank > currentTierRank;
  });
  
  // Determine if this is an upgrade path or downgrade
  // If history shows movement from higher to lower tier, it's not an upgrade
  const isUpgradePath = () => {
    if (currentMembership.membershipHistory.length < 1) return true;
    
    // Check if previous memberships had higher ranks
    for (const prevMembership of currentMembership.membershipHistory) {
      const prevRank = MEMBERSHIP_TIERS[prevMembership as MembershipTierKey].rank;
      if (prevRank > currentTierRank) {
        return false; // Coming from higher tier, so not an upgrade
      }
    }
    
    return true; // Either no history or coming from lower tier
  };
  
  const showAsUpgrade = isUpgradePath();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Membership Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Renew Current Membership Card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Renew Current Membership</h4>
                <p className="text-sm text-gray-600">
                  Extend your {currentMembership.type.toLowerCase()} for another year
                </p>
              </div>
            </div>
            
            {/* Display current benefits */}
            <div className="mt-3 mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Current Benefits:</h5>
              <ul className="space-y-2">
                {currentMembership.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckIcon />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="font-semibold">KSH{currentMembership.renewalFee}</span>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                onClick={() => navigate('/portal/membership/membership-renewal')}
              >
                Renew Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Upgrade/Change Membership Card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <BadgeCheck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">
                  {showAsUpgrade ? "Upgrade Membership" : "Change Membership"}
                </h4>
                <p className="text-sm text-gray-600">
                  {showAsUpgrade 
                    ? "Get additional benefits and privileges with an upgraded membership"
                    : "Change your membership type to suit your current needs"
                  }
                </p>
              </div>
            </div>
            
            {/* Membership Tier Selector */}
            <div className="mt-4">
              <h5 className="font-medium text-gray-700 mb-2">Available Tiers:</h5>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(MEMBERSHIP_TIERS).map(tier => {
                  const tierKey = tier as MembershipTierKey;
                  const isHonorary = tierKey === 'Honorary Membership';
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tierKey)}
                      className={`px-3 py-1 text-sm rounded-lg border ${
                        selectedTier === tierKey
                          ? 'bg-primary-100 border-primary-300 text-primary-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tier}
                      {isHonorary && " (Invitation Only)"}
                    </button>
                  );
                })}
              </div>
              
              {/* Display benefits for selected tier */}
              {selectedTier ? (
                <div className="border-t border-gray-100 pt-4">
                  <h6 className="font-medium text-gray-700 mb-1">{selectedTier}{selectedTier === 'Honorary Membership' && ' (Invitation Only)'}</h6>
                  <p className="text-sm text-gray-600 mb-3">{MEMBERSHIP_TIERS[selectedTier].description}</p>
                  <ul className="space-y-2">
                    {MEMBERSHIP_TIERS[selectedTier].benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckIcon />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-semibold">
                      {MEMBERSHIP_TIERS[selectedTier].fee > 0
                        ? `KSH${MEMBERSHIP_TIERS[selectedTier].fee}`
                        : 'Free'}
                    </span>
                    {selectedTier === 'Honorary Membership' ? (
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        disabled
                      >
                        Invitations Only
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        onClick={() => navigate('/portal/membership/membership-upgrade')}
                      >
                        {showAsUpgrade ? `Upgrade to ${selectedTier.split(' ')[0]}` : `Change to ${selectedTier.split(' ')[0]}`}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-4">
                  Select a membership tier to view benefits
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for check icons in benefits lists
const CheckIcon = () => (
  <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MembershipStatus = () => {
  const [viewCertificate, setViewCertificate] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateDaysRemaining = () => {
    const today = new Date();
    const expiryDate = new Date(MOCK_MEMBERSHIP.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  const handleDownloadCertificate = () => {
    console.log("Downloading certificate...");
    // Implementation would connect to backend API
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <LoadingSpinner />
        </div>
      )}
      
      {viewCertificate ? (
        <CertificateSection 
          membership={MOCK_MEMBERSHIP}
          onClose={() => setViewCertificate(false)}
          onDownload={handleDownloadCertificate}
        />
      ) : (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-800">Membership Status</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewCertificate(true)}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium flex items-center gap-2 hover:bg-primary-100 transition-colors"
              >
                <Award className="w-5 h-5" />
                <span>View Certificate</span>
              </button>
            </div>
          </div>
          
          {/* Status Summary Card */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Status</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${MOCK_MEMBERSHIP.status === "Active" ? "bg-green-500" : "bg-yellow-500"}`}></div>
                  <span className="font-medium">{MOCK_MEMBERSHIP.status}</span>
                  <span className="text-gray-500">• {MOCK_MEMBERSHIP.type}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Member ID: {MOCK_MEMBERSHIP.membershipId}
                </div>
              </div>
              
              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date: {MOCK_MEMBERSHIP.startDate}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Expiry Date: {MOCK_MEMBERSHIP.expiryDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Days Remaining */}
          <div className={`rounded-xl p-5 mb-6 flex items-center justify-between ${
            daysRemaining < 30 
              ? "bg-yellow-50 border border-yellow-100" 
              : "bg-green-50 border border-green-100"
          }`}>
            <div className="flex items-center gap-3">
              <Clock className={`w-6 h-6 ${
                daysRemaining < 30 ? "text-yellow-600" : "text-green-600"
              }`} />
              <div>
                <h3 className="font-medium">{daysRemaining} days remaining</h3>
                <p className="text-sm text-gray-600">Your membership will expire on {MOCK_MEMBERSHIP.expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Membership Options */}
          <MembershipOptions currentMembership={MOCK_MEMBERSHIP} />
        </div>
      )}
    </div>
  );
};

export default MembershipStatus;