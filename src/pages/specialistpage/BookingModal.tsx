import { Calendar } from "lucide-react";
import Button from "../../components/common/Button";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialistName: string;
  availability: string | null;
}

const BookingModal = ({
  isOpen,
  onClose,
  specialistName,
  availability,
}: BookingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Book Appointment with {specialistName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Type
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>In-Person Visit</option>
                <option>Video Consultation</option>
                <option>Chat Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min={new Date().toISOString().split("T")[0]}
                />
                <Calendar className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Briefly describe the reason for your appointment"
              ></textarea>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                className="w-full"
                disabled={availability !== "available"}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;