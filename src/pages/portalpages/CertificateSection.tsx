import { Download } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import eacnaLogo from "../../assets/eacnaLogo.jpg";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

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

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  title?: string;
  profile_image?: string | null;
  institution?: string;
  country_of_residence?: string;
}

const CertificateSection = ({
  membership,
  onDownload,
}: CertificateSectionProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("membership_directory")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      // Show loading state
      setLoading(true);

      // Create a canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // Enable CORS for images
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `EACNA_Certificate_${userData?.first_name}_${userData?.last_name}.png`;

          // Trigger download
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error downloading certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-800">
          Membership Certificate
        </h2>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>
      </div>

      {/* Certificate Display - Enhanced Design */}
      <div
        ref={certificateRef}
        className="border-4 border-primary-100 p-4 sm:p-8 rounded-lg bg-white mx-auto w-full max-w-3xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#1E40AF"
              d="M40,-58.8C52.6,-49.1,64.1,-39.1,71.7,-25.8C79.3,-12.6,83,3.8,79.3,18.9C75.6,34,64.5,47.7,50.7,56.8C36.9,65.9,20.5,70.4,3.7,65.9C-13.1,61.4,-26.2,47.9,-40.1,38.2C-54,28.5,-68.6,22.6,-74.1,11.8C-79.6,1,-76.1,-14.7,-67.3,-27.1C-58.6,-39.5,-44.7,-48.6,-31.3,-58C-17.9,-67.4,-4.9,-77.1,8.2,-87.8C21.3,-98.5,42.6,-110.2,53.5,-102.6Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src={eacnaLogo}
                alt="EACNA Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-1">
              East African Child Neurology Association
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-primary-600 uppercase tracking-wider">
              Certificate of Membership
            </h2>
          </div>

          {/* Certificate Body */}
          <div className="my-6 sm:my-10 text-center">
            <p className="text-gray-700 mb-2 italic">This is to certify that</p>

            <div className="my-4 py-4 border-y border-primary-200">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {userData?.title || "Dr."} {userData?.first_name}{" "}
                {userData?.last_name}
              </p>
              {userData?.institution && (
                <p className="text-gray-600">{userData.institution}</p>
              )}
              {userData?.country_of_residence && (
                <p className="text-gray-600">{userData.country_of_residence}</p>
              )}
            </div>

            <p className="text-gray-700 mt-4">is a recognized</p>
            <p className="text-xl sm:text-2xl font-semibold text-primary-700 my-3 uppercase tracking-wider">
              {membership.type.replace(" Membership", " Member")}
            </p>
            <p className="text-gray-700">
              of the East African Child Neurology Association
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-500">Membership ID</p>
                <p className="text-gray-800">{membership.membershipId}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-500">Validity</p>
                <p className="text-gray-800">
                  {membership.startDate} to {membership.expiryDate}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="border-b border-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-gray-700 font-medium">Dr. Samantha Njeri</p>
              <p className="text-xs sm:text-sm text-gray-600">
                President, EACNA
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center order-first sm:order-none">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-primary-600 rounded-full flex items-center justify-center text-primary-800 font-bold mb-2 relative">
                <span className="absolute inset-0 rounded-full border-4 border-dashed border-primary-300 opacity-50"></span>
                <span className="z-10">SEAL</span>
              </div>
              <p className="text-xs text-gray-500">Official Seal</p>
            </div>

            <div className="text-center">
              <div className="border-b border-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-gray-700 font-medium">Dr. Faith Mueni</p>
              <p className="text-xs sm:text-sm text-gray-600">
                Secretary General, EACNA
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Certificate No: {membership.membershipId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Back (for printing) */}
      <div className="hidden print:block mt-8 p-6 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">
          Certificate Terms
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>
            • This certificate is proof of membership in good standing with
            EACNA.
          </li>
          <li>
            • The certificate remains property of EACNA and must be returned
            upon termination of membership.
          </li>
          <li>
            • Membership benefits are subject to the terms and conditions of
            EACNA.
          </li>
          <li>
            • This certificate is non-transferable and valid only for the named
            member.
          </li>
          <li>• For verification, please contact membership@eacna.org</li>
        </ul>
        <div className="mt-6 text-xs text-gray-500">
          <p>
            Issued electronically by East African Child Neurology Association
          </p>
          <p>© {new Date().getFullYear()} EACNA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateSection;
