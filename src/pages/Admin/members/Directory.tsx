// components/admin/AdminMembershipDirectory.tsx
import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, MoreHorizontal, FileText, UserPlus, Trash2 } from 'lucide-react';
import Card from '../../../components/common/Card';

// Define the Member interface
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  memberSince: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  institution: string;
  country: string;
  profession: string;
}

// Mock data for demo
const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Kamau',
    email: 'john.kamau@example.com',
    phone: '+254712345678',
    membershipType: 'ordinary',
    memberSince: '2023-05-15',
    expiryDate: '2025-05-15',
    status: 'active',
    institution: 'Kenyatta National Hospital',
    country: 'Kenya',
    profession: 'Neurologist'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Ouma',
    email: 'sarah.ouma@example.com',
    phone: '+254723456789',
    membershipType: 'student',
    memberSince: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'active',
    institution: 'University of Nairobi',
    country: 'Kenya',
    profession: 'Medical Student'
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Mugisha',
    email: 'david.m@example.com',
    phone: '+256778123456',
    membershipType: 'associate',
    memberSince: '2023-09-20',
    expiryDate: '2024-09-20',
    status: 'active',
    institution: 'Mulago Hospital',
    country: 'Uganda',
    profession: 'Neurosurgeon'
  },
  {
    id: '4',
    firstName: 'Amina',
    lastName: 'Hassan',
    email: 'amina.h@example.com',
    phone: '+255622345678',
    membershipType: 'institutional',
    memberSince: '2022-11-30',
    expiryDate: '2023-11-30',
    status: 'expired',
    institution: 'Muhimbili National Hospital',
    country: 'Tanzania',
    profession: 'Neuropsychiatrist'
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Okello',
    email: 'michael.o@example.com',
    phone: '+254734567890',
    membershipType: 'honorary',
    memberSince: '2021-06-15',
    expiryDate: '2026-06-15',
    status: 'active',
    institution: 'Kijabe Hospital',
    country: 'Kenya',
    profession: 'Professor of Neurology'
  },
  {
    id: '6',
    firstName: 'Grace',
    lastName: 'Mutinda',
    email: 'grace.m@example.com',
    phone: '+254745678901',
    membershipType: 'ordinary',
    memberSince: '2023-03-22',
    expiryDate: '2025-03-22',
    status: 'active',
    institution: 'Aga Khan University Hospital',
    country: 'Kenya',
    profession: 'Paediatric Neurologist'
  },
  {
    id: '7',
    firstName: 'Emmanuel',
    lastName: 'Rwigamba',
    email: 'emmanuel.r@example.com',
    phone: '+250789123456',
    membershipType: 'student',
    memberSince: '2024-02-05',
    expiryDate: '2025-02-05',
    status: 'active',
    institution: 'University of Rwanda',
    country: 'Rwanda',
    profession: 'Resident'
  },
  {
    id: '8',
    firstName: 'Catherine',
    lastName: 'Mbeki',
    email: 'catherine.m@example.com',
    phone: '+255712345678',
    membershipType: 'associate',
    memberSince: '2022-08-10',
    expiryDate: '2024-02-10',
    status: 'expired',
    institution: 'Aga Khan Hospital Dar es Salaam',
    country: 'Tanzania',
    profession: 'Neuroradiologist'
  },
  {
    id: '9',
    firstName: 'Peter',
    lastName: 'Odhiambo',
    email: 'peter.o@example.com',
    phone: '+254756789012',
    membershipType: 'ordinary',
    memberSince: '2023-10-15',
    expiryDate: '2025-10-15',
    status: 'active',
    institution: 'Moi Teaching and Referral Hospital',
    country: 'Kenya',
    profession: 'Neurophysiologist'
  },
  {
    id: '10',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    email: 'fatima.a@example.com',
    phone: '+252612345678',
    membershipType: 'ordinary',
    memberSince: '2023-07-20',
    expiryDate: '2025-07-20',
    status: 'active',
    institution: 'Mogadishu General Hospital',
    country: 'Somalia',
    profession: 'Neurology Specialist'
  },
  {
    id: '11',
    firstName: 'Solomon',
    lastName: 'Tadesse',
    email: 'solomon.t@example.com',
    phone: '+251912345678',
    membershipType: 'associate',
    memberSince: '2023-04-10',
    expiryDate: '2024-04-10',
    status: 'active',
    institution: 'Black Lion Hospital',
    country: 'Ethiopia',
    profession: 'Neuropsychologist'
  },
  {
    id: '12',
    firstName: 'Winnie',
    lastName: 'Byanyima',
    email: 'winnie.b@example.com',
    phone: '+256712345678',
    membershipType: 'institutional',
    memberSince: '2023-01-15',
    expiryDate: '2024-01-15',
    status: 'expired',
    institution: 'Makerere University Hospital',
    country: 'Uganda',
    profession: 'Neuroscience Researcher'
  }
];

// Define the membership type options
const membershipTypes = [
  { value: 'ordinary', label: 'Full Member' }, // changed here
  { value: 'associate', label: 'Associate Member' },
  { value: 'student', label: 'Student Member' },
  { value: 'institutional', label: 'Institutional Member' },
  { value: 'honorary', label: 'Honorary Member' }
];

// Define the status options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending', label: 'Pending' }
];

// Function to format date string
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Calculate days until expiry
const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const MembershipStatusBadge = ({ status }: { status: Member['status'] }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'active':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'expired':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ExpiryBadge = ({ expiryDate }: { expiryDate: string }) => {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  
  if (daysUntil < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Expired
      </span>
    );
  } else if (daysUntil <= 30) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {daysUntil} days left
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {daysUntil} days left
      </span>
    );
  }
};

const MembershipTypeLabel = ({ type }: { type: string }) => {
  const membershipType = membershipTypes.find(t => t.value === type);
  return membershipType ? membershipType.label : type;
};

const AdminMembershipDirectory = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [dropdownMenu, setDropdownMenu] = useState<string | null>(null);

  // Handle search and filtering
  useEffect(() => {
    let result = [...members];
    
    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(member => 
        member.firstName.toLowerCase().includes(lowercasedSearch) ||
        member.lastName.toLowerCase().includes(lowercasedSearch) ||
        member.email.toLowerCase().includes(lowercasedSearch) ||
        member.institution.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply membership type filter
    if (selectedMembershipType) {
      result = result.filter(member => member.membershipType === selectedMembershipType);
    }
    
    // Apply status filter
    if (selectedStatus) {
      result = result.filter(member => member.status === selectedStatus);
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredMembers(result);
  }, [members, searchTerm, selectedMembershipType, selectedStatus, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof Member) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorting icon
  const getSortIcon = (key: keyof Member) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  // Handle dropdown menu toggle
  const toggleDropdownMenu = (memberId: string) => {
    if (dropdownMenu === memberId) {
      setDropdownMenu(null);
    } else {
      setDropdownMenu(memberId);
    }
  };

  // Handle member details toggle
  const toggleMemberDetails = (memberId: string) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
    }
  };

  // Export members list as CSV
  const exportMembersCSV = () => {
    // In a real application, you would generate and download a CSV file
    console.log('Exporting members as CSV');
    alert('Exporting members as CSV');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Membership Directory</h1>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={selectedMembershipType}
              onChange={(e) => setSelectedMembershipType(e.target.value)}
            >
              <option value="">All membership types</option>
              {membershipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:w-40">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              onClick={exportMembersCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lastName')}
                >
                  <div className="flex items-center">
                    <span>Member</span>
                    <div className="ml-1">{getSortIcon('lastName')}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('membershipType')}
                >
                  <div className="flex items-center">
                    <span>Membership Type</span>
                    <div className="ml-1">{getSortIcon('membershipType')}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('memberSince')}
                >
                  <div className="flex items-center">
                    <span>Member Since</span>
                    <div className="ml-1">{getSortIcon('memberSince')}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('expiryDate')}
                >
                  <div className="flex items-center">
                    <span>Expiry Date</span>
                    <div className="ml-1">{getSortIcon('expiryDate')}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    <div className="ml-1">{getSortIcon('status')}</div>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <>
                    <tr 
                      key={member.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => toggleMemberDetails(member.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-800 font-medium">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <MembershipTypeLabel type={member.membershipType} />
                        </div>
                        <div className="text-sm text-gray-500">{member.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(member.memberSince)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(member.expiryDate)}</div>
                        <ExpiryBadge expiryDate={member.expiryDate} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <MembershipStatusBadge status={member.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdownMenu(member.id);
                            }}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          
                          {dropdownMenu === member.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`View ${member.firstName}'s details`);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Edit ${member.firstName}'s profile`);
                                  }}
                                >
                                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Edit Profile
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Delete ${member.firstName}'s profile`);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded member details */}
                    {expandedMember === member.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                              <p className="text-sm text-gray-600 mt-1">Phone: {member.phone}</p>
                              <p className="text-sm text-gray-600">Email: {member.email}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Professional Details</h4>
                              <p className="text-sm text-gray-600 mt-1">Institution: {member.institution}</p>
                              <p className="text-sm text-gray-600">Profession: {member.profession}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Membership Details</h4>
                              <p className="text-sm text-gray-600 mt-1">Type: <MembershipTypeLabel type={member.membershipType} /></p>
                              <p className="text-sm text-gray-600">Valid from: {formatDate(member.memberSince)} to {formatDate(member.expiryDate)}</p>
                              {member.status === 'active' && getDaysUntilExpiry(member.expiryDate) <= 30 && (
                                <button 
                                  className="mt-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 py-1 px-2 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Renew ${member.firstName}'s membership`);
                                  }}
                                >
                                  Renew Membership
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No members found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredMembers.length}</span> of{' '}
                <span className="font-medium">{filteredMembers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  aria-current="page"
                  className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </button>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Membership statistics cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center space-x-4">
            <UserPlus className="h-6 w-6 text-emerald-600" />
            <div>
              <div className="text-lg font-semibold">{members.length}</div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-lg font-semibold">{members.filter(m => m.status === 'active').length}</div>
              <div className="text-sm text-gray-500">Active Members</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-lg font-semibold">
                {members.filter(m => {
                  const daysUntil = getDaysUntilExpiry(m.expiryDate);
                  return daysUntil > 0 && daysUntil <= 30;
                }).length}
              </div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-lg font-semibold">{members.filter(m => m.status === 'expired').length}</div>
              <div className="text-sm text-gray-500">Expired Members</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Membership type distribution chart */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Membership Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="h-64">
              {/* In a real app, you would use a charting library like Chart.js or Recharts */}
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">Pie chart visualization of membership types</p>
              </div>
            </div>
          </div>
          <div>
            <ul className="divide-y divide-gray-200">
              {membershipTypes.map((type) => {
                const count = members.filter(m => m.membershipType === type.value).length;
                const percentage = (count / members.length) * 100;
                
                return (
                  <li key={type.value} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-3" style={{
                          backgroundColor: 
                            type.value === 'ordinary' ? '#10B981' :
                            type.value === 'associate' ? '#3B82F6' :
                            type.value === 'student' ? '#F59E0B' :
                            type.value === 'institutional' ? '#8B5CF6' :
                            '#EC4899'
                        }}></span>
                        <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">{count}</span>
                        <span className="text-xs font-medium text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 
                            type.value === 'ordinary' ? '#10B981' :
                            type.value === 'associate' ? '#3B82F6' :
                            type.value === 'student' ? '#F59E0B' :
                            type.value === 'institutional' ? '#8B5CF6' :
                            '#EC4899'
                        }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMembershipDirectory;