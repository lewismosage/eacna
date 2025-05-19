import { Download } from 'lucide-react';
import eacnaLogo from '../../assets/eacnaLogo.jpg'; 

interface CertificateSectionProps {
  membership: {
    type: string;
    startDate: string;
    expiryDate: string;
    membershipId: string;
  };
  onClose: () => void;
  onDownload: () => void;
}

const CertificateSection = ({ membership, onDownload }: CertificateSectionProps) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-800">Membership Certificate</h2>
        <button 
          onClick={onDownload}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>
      </div>
      
      {/* Certificate Display */}
      <div className="border-4 border-primary-100 p-4 sm:p-8 rounded-lg bg-white mx-auto w-full max-w-3xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={eacnaLogo}
              alt="EACNA Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-800 mb-1">East African Child Neurology Association</h1>
          <h2 className="text-base sm:text-lg font-semibold text-primary-600">Certificate of Membership</h2>
        </div>
        
        <div className="my-6 sm:my-10 text-center">
          <p className="text-gray-700 mb-2">This certifies that</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Dr. Lewis Mosage</p>
          <p className="text-gray-700">is a recognized</p>
          <p className="text-lg sm:text-xl font-semibold text-primary-700 my-2">{membership.type}</p>
          <p className="text-gray-700">of the East African Child Neurology Association</p>
          <p className="text-gray-700 mt-4 sm:mt-6">Membership ID: {membership.membershipId}</p>
          <p className="text-gray-700">Valid from {membership.startDate} to {membership.expiryDate}</p>
        </div>
        
        {/* Footer section with responsive layout */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <div className="border-b border-gray-400 w-32 sm:w-40 mb-1 mx-auto sm:mx-0"></div>
            <p className="text-gray-700">Dr. Samantha Njeri</p>
            <p className="text-xs sm:text-sm text-gray-600">President, EACNA</p>
          </div>
          
          <div className="flex flex-col items-center order-first sm:order-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary-600 rounded-full flex items-center justify-center text-primary-800 font-bold text-sm sm:text-base">
              SEAL
            </div>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="border-b border-gray-400 w-32 sm:w-40 mb-1 mx-auto sm:mx-0"></div>
            <p className="text-gray-700">Dr. Faith Mueni</p>
            <p className="text-xs sm:text-sm text-gray-600">Secretary General, EACNA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateSection;