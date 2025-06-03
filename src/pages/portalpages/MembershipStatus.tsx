import { useState, useEffect } from 'react';
import { Award, Clock, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CertificateSection from './CertificateSection';
import { createClient } from '@supabase/supabase-js';
import { membershipTiers, MembershipTier } from '../../types/membership';
import MembershipRenewal from './MembershipRenewal';
import MembershipUpgrade from './MembershipUpgrade';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface MembershipData {
  id: number;
  user_id: string;
  membership_type: string;
  member_since: string;
  expiry_date: string;
  membership_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CertificateMembershipData {
  type: string;
  startDate: string;
  expiryDate: string;
  membershipId: string;
}

const MembershipStatus = () => {
  const [viewCertificate, setViewCertificate] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<MembershipTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('membership_directory')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Membership not found');

        setMembership(data);
      } catch (err) {
        console.error('Error fetching membership data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, [navigate]);

  const calculateDaysRemaining = () => {
    if (!membership?.expiry_date) return 0;
    
    const today = new Date();
    const expiryDate = new Date(membership.expiry_date);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCertificateData = (): CertificateMembershipData => {
    if (!membership) {
      return {
        type: '',
        startDate: '',
        expiryDate: '',
        membershipId: ''
      };
    }
    return {
      type: membership.membership_type,
      startDate: formatDate(membership.member_since),
      expiryDate: formatDate(membership.expiry_date),
      membershipId: membership.membership_id
    };
  };

  const daysRemaining = calculateDaysRemaining();

  const handleUpgradeClick = (tier?: MembershipTier) => {
    if (tier) {
      setSelectedUpgradeTier(tier);
    }
    setShowUpgrade(true);
  };

  const getAvailableUpgrades = (): MembershipTier[] => {
    if (!membership) return [];
    
    const currentTier = membership.membership_type as MembershipTier;
    const currentPrice = membershipTiers[currentTier]?.price || 0;
    
    return (Object.keys(membershipTiers) as MembershipTier[]).filter(tier => {
      // Only show higher priced tiers (except Honorary which is by invitation)
      return membershipTiers[tier].price > currentPrice && tier !== 'Honorary Membership';
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Award className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-primary-800 mb-4">Membership Status</h2>
        <p className="text-gray-600">No active membership found</p>
      </div>
    );
  }

  if (showRenewal) {
    return (
      <MembershipRenewal
        currentMembership={{
          type: membership.membership_type,
          membershipId: membership.membership_id,
          expiryDate: formatDate(membership.expiry_date),
          renewalFee: membershipTiers[membership.membership_type as MembershipTier]?.price || 0,
          benefits: membershipTiers[membership.membership_type as MembershipTier]?.features || []
        }}
        onClose={() => setShowRenewal(false)}
      />
    );
  }

  if (showUpgrade) {
    return (
      <MembershipUpgrade
        currentMembership={{
          type: membership.membership_type,
          membershipId: membership.membership_id,
          expiryDate: formatDate(membership.expiry_date)
        }}
        onClose={() => {
          setShowUpgrade(false);
          setSelectedUpgradeTier(null);
        }}
        selectedTierFromStatus={selectedUpgradeTier || undefined}
      />
    );
  }

  if (viewCertificate) {
    return (
      <CertificateSection 
        membership={getCertificateData()}
        onClose={() => setViewCertificate(false)}
        onDownload={() => console.log("Downloading certificate...")}
      />
    );
  }

  const availableUpgrades = getAvailableUpgrades();
  const currentTier = membership.membership_type as MembershipTier;
  const currentTierData = membershipTiers[currentTier];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                <div className={`w-3 h-3 rounded-full ${
                  membership.status === "active" ? "bg-green-500" : "bg-yellow-500"
                }`}></div>
                <span className="font-medium capitalize">{membership.status}</span>
                <span className="text-gray-500">• {membership.membership_type}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Member ID: {membership.membership_id}
              </div>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Start Date: {formatDate(membership.member_since)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Expiry Date: {formatDate(membership.expiry_date)}</span>
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
              <h3 className="font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Membership expired"}
              </h3>
              <p className="text-sm text-gray-600">
                {daysRemaining > 0 
                  ? `Your membership will expire on ${formatDate(membership.expiry_date)}`
                  : `Your membership expired on ${formatDate(membership.expiry_date)}`
                }
              </p>
            </div>
          </div>
          {daysRemaining < 60 && (
            <button
              onClick={() => setShowRenewal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Renew Now
            </button>
          )}
        </div>

        {/* Current Membership Benefits */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Membership Benefits</h3>
            <ul className="space-y-3">
              {currentTierData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 text-primary-600">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upgrade Options */}
        {availableUpgrades.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upgrade Options</h3>
              <p className="text-gray-600 mb-4">
                You're eligible to upgrade to these membership tiers with additional benefits:
              </p>
              
              <div className="space-y-4">
                {availableUpgrades.map((tier) => {
                  const tierData = membershipTiers[tier];
                  return (
                    <div key={tier} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{tier}</h4>
                          <p className="text-sm text-gray-600 mt-1">{tierData.features[0]}</p>
                          
                          <h4 className="font-medium text-gray-700 mt-3 mb-2">Additional Benefits:</h4>
                          <ul className="space-y-2">
                            {tierData.features.slice(1).map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg">KSH {tierData.price}</div>
                          <div className="text-sm text-gray-500">per year</div>
                          <button
                            onClick={() => handleUpgradeClick(tier)}
                            className="mt-3 px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Upgrade Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipStatus;