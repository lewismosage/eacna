import { Calendar } from "lucide-react";
import Button from "../../components/common/Button";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialistName: string;
  specialistId: number;
  availability: string | null;
}

const BookingModal = ({
  isOpen,
  onClose,
  specialistName,
  specialistId,
  availability,
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    type: "In-Person Visit",
    date: "",
    time: "09:00 AM",
    reason: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Basic validation
      if (!formData.patientName || !formData.patientEmail || !formData.patientPhone) {
        throw new Error("Please fill in all patient details");
      }

      // Convert time to 24-hour format
      const time24 = convertTo24Hour(formData.time);
      
      // Combine date and time
      const appointmentDateTime = `${formData.date}T${time24}:00`;

      const { error } = await supabase
        .from("appointments")
        .insert([{
          specialist_id: specialistId,
          patient_name: formData.patientName,
          patient_email: formData.patientEmail,
          patient_phone: formData.patientPhone,
          appointment_type: formData.type,
          appointment_date: appointmentDateTime,
          reason: formData.reason,
          status: "pending",
        }]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          type: "In-Person Visit",
          date: "",
          time: "09:00 AM",
          reason: "",
          patientName: "",
          patientEmail: "",
          patientPhone: "",
        });
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const convertTo24Hour = (time12: string) => {
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
    
    return `${hours}:${minutes}`;
  };

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
              disabled={isLoading}
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

          {success ? (
            <div className="text-center py-8">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                <p className="font-medium">Appointment Booked Successfully!</p>
                <p>You'll receive a confirmation shortly.</p>
              </div>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Patient Information Section */}
                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium text-gray-800 mb-3">Your Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="patientEmail"
                        value={formData.patientEmail}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="patientPhone"
                        value={formData.patientPhone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details Section */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Appointment Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="In-Person Visit">In-Person Visit</option>
                        <option value="Video Consultation">Video Consultation</option>
                        <option value="Chat Consultation">Chat Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        <Calendar className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Visit
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                        placeholder="Briefly describe the reason for your appointment"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={isLoading || availability !== "available"}
                    type="submit"
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;