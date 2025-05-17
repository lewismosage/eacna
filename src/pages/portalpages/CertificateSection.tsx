import { Download } from 'lucide-react';

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">Membership Certificate</h2>
        <div className="flex gap-2">
          <button 
            onClick={onDownload}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Certificate Display */}
      <div className="border-4 border-primary-100 p-8 rounded-lg bg-white mx-auto max-w-3xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {/* This would be the actual logo in a real application */}
            <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
              EACNA
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-800 mb-1">East African Child Neurology Association</h1>
          <h2 className="text-lg font-semibold text-primary-600">Certificate of Membership</h2>
        </div>
        
        <div className="my-10 text-center">
          <p className="text-gray-700 mb-2">This certifies that</p>
          <p className="text-xl font-bold text-gray-900 mb-2">Dr. Lewis Mosage</p>
          <p className="text-gray-700">is a recognized</p>
          <p className="text-xl font-semibold text-primary-700 my-2">{membership.type}</p>
          <p className="text-gray-700">of the East African Child Neurology Association</p>
          <p className="text-gray-700 mt-6">Membership ID: {membership.membershipId}</p>
          <p className="text-gray-700">Valid from {membership.startDate} to {membership.expiryDate}</p>
        </div>
        
        <div className="mt-10 flex justify-between items-end">
          <div>
            <div className="border-b border-gray-400 w-40 mb-1"></div>
            <p className="text-gray-700">Dr. Samantha Njeri</p>
            <p className="text-sm text-gray-600">President, EACNA</p>
          </div>
          
          <div className="flex flex-col items-center">
            {/* This would be an actual seal in a real application */}
            <div className="w-20 h-20 border-2 border-primary-600 rounded-full flex items-center justify-center text-primary-800 font-bold">
              SEAL
            </div>
          </div>
          
          <div>
            <div className="border-b border-gray-400 w-40 mb-1"></div>
            <p className="text-gray-700">Dr. Faith Mueni</p>
            <p className="text-sm text-gray-600">Secretary General, EACNA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateSection;