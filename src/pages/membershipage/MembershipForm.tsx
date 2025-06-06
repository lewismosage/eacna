// components/membership/MembershipForm.tsx
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  Upload,
} from "lucide-react";
import Card, { CardContent } from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  MembershipTier,
  membershipTiers as tierData,
} from "../../types/membership";

type FormData = {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  phone: string;
  email: string;
  residentialAddress: string;
  password: string;
  confirmPassword: string;

  // Professional Information
  medicalRegistrationNumber: string;
  profession: string;
  specialization: string;
  yearsOfExperience: number;
  currentEmployer: string;
  country: string;

  // Education and Certification
  highestQualification: string;
  institutionAttended: string;
  yearOfGraduation: string;
  credentials: FileList;
  licenseExpiryDate: string;

  // Compliance
  agreeToEthics: boolean;
  consentToDataProcessing: boolean;

  // Membership
  membershipTier: string;
};

const professions = [
  "Doctor",
  "Nurse",
  "Surgeon",
  "Pharmacist",
  "Neurologist",
  "Lab Technician",
  "Radiologist",
  "Dentist",
  "General Practitioner",
];

const qualifications = [
  "MBChB",
  "MD",
  "BSc Nursing",
  "PharmD",
  "BSc Medicine",
  "MSc Medicine",
  "PhD",
  "Diploma in Clinical Medicine",
];

const membershipTierOptions = Object.entries(tierData).map(([value, data]) => ({
  value: value as MembershipTier,
  label:
    value === "Honorary Membership"
      ? "Honorary Membership (by invitation only)"
      : data.name,
}));

const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid:
      minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
  };
};

// Update the MembershipForm component interface
interface MembershipFormProps {
  onComplete?: (data: any) => void;
}

const MembershipForm: React.FC<MembershipFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial step from route state or default to 1
  const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
  );

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const watchedPassword = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordStrength = validatePassword(watchedPassword);

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prevStep: number) => prevStep + 1);
    }
  };

  const prevStep = () => setCurrentStep((prevStep: number) => prevStep - 1);

  const getStepFields = (step: number) => {
    switch (step) {
      case 1:
        return [
          "firstName",
          "lastName",
          "dateOfBirth",
          "gender",
          "nationalId",
          "phone",
          "email",
          "residentialAddress",
          "password",
          "confirmPassword",
        ];
      case 2:
        return [
          "medicalRegistrationNumber",
          "profession",
          "specialization",
          "yearsOfExperience",
          "currentEmployer",
          "country",
          "membershipTier",
        ];
      case 3:
        return [
          "highestQualification",
          "institutionAttended",
          "yearOfGraduation",
          "licenseExpiryDate",
        ];
      default:
        return [];
    }
  };

  const handlePersonalInfoSubmit = async (data: Partial<FormData>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email!,
        password: data.password!,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            national_id: data.nationalId,
          },
        },
      });

      if (authError) throw authError;

      // Profile is automatically created by the trigger we set up
      setVerificationSent(true);
      nextStep();
    } catch (err) {
      console.error("Error creating account:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFiles = async (files: FileList) => {
    const uploadedUrls: string[] = [];

    // Generate a unique ID for each upload
    const uploadId = `anon-${crypto.randomUUID()}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uploadId}-${Date.now()}.${fileExt}`;
      const filePath = `credentials/${fileName}`;

      try {
        // Upload file (no auth required)
        const { error } = await supabase.storage
          .from("member-documents")
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("member-documents").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error("Upload failed:", error);
        throw new Error(`Failed to upload ${file.name}.`);
      }
    }

    return uploadedUrls;
  };

  const handleCompleteApplication = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload credentials if provided
      let credentialUrls: string[] = [];
      if (formData.credentials && formData.credentials.length > 0) {
        credentialUrls = await uploadFiles(formData.credentials);
      }

      // Try to find existing user by email
      const { data: existingUser, error: lookupError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", formData.email)
        .maybeSingle();

      if (lookupError) throw lookupError;

      // Prepare application data
      const applicationData = {
        // Use existing user_id if found, otherwise null
        user_id: existingUser?.user_id || null,

        // Personal Information
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        national_id: formData.nationalId,
        phone: formData.phone,
        email: formData.email,
        residential_address: formData.residentialAddress,

        // Professional Information
        medical_registration_number: formData.medicalRegistrationNumber,
        profession: formData.profession,
        specialization: formData.specialization,
        years_of_experience: formData.yearsOfExperience,
        current_employer: formData.currentEmployer,
        country: formData.country,
        membership_tier: formData.membershipTier,

        // Education and Certification
        highest_qualification: formData.highestQualification,
        institution_attended: formData.institutionAttended,
        year_of_graduation: formData.yearOfGraduation,
        credentials: credentialUrls,
        license_expiry_date: formData.licenseExpiryDate,

        // Compliance
        agree_to_ethics: formData.agreeToEthics,
        consent_to_data_processing: formData.consentToDataProcessing,
      };

      // Insert application
      const { error } = await supabase
        .from("membership_applications")
        .insert(applicationData);

      if (error) throw error;

      // Call onComplete with the application data
      if (onComplete) {
        onComplete(applicationData);
      }

      nextStep(); // Move to success screen
    } catch (err) {
      console.error("Error completing application:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to complete application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkEmailVerification = async () => {
    try {
      // Simulate verification check
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For demo purposes, we'll just set it to true
      setEmailVerified(true);
      return true;
    } catch (err) {
      console.error("Error checking verification:", err);
      return false;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const email = getValues("email");
      if (!email) throw new Error("No email found");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-success`,
        },
      });

      if (error) throw error;

      setVerificationSent(true);
    } catch (err) {
      console.error("Error resending verification:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email. Please try again."
      );
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <p className="text-gray-600 mb-4">
              Please provide your personal details to create your account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("dateOfBirth", {
                    required: "Date of birth is required",
                  })}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender*
                </label>
                <select
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("gender", {
                    required: "Gender is required",
                  })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID / Passport No.*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.nationalId ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("nationalId", {
                    required: "National ID or Passport is required",
                  })}
                />
                {errors.nationalId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nationalId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\- ]+$/,
                      message: "Invalid phone number",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residential Address*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.residentialAddress
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("residentialAddress", {
                    required: "Residential address is required",
                  })}
                />
                {errors.residentialAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.residentialAddress.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                    {...register("password", {
                      required: "Password is required",
                      validate: (value) =>
                        validatePassword(value).isValid ||
                        "Password does not meet requirements",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}

                {watchedPassword && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Password must contain:
                    </p>
                    <ul className="space-y-1">
                      <li className="flex items-center text-xs">
                        {passwordStrength.minLength ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span
                          className={
                            passwordStrength.minLength
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        {passwordStrength.hasUppercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span
                          className={
                            passwordStrength.hasUppercase
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          At least one uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        {passwordStrength.hasLowercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span
                          className={
                            passwordStrength.hasLowercase
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          At least one lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        {passwordStrength.hasNumber ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span
                          className={
                            passwordStrength.hasNumber
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          At least one number
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        {passwordStrength.hasSpecialChar ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-300 mr-1" />
                        )}
                        <span
                          className={
                            passwordStrength.hasSpecialChar
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        >
                          At least one special character
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watchedPassword || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleSubmit(handlePersonalInfoSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {submitError}
              </div>
            )}
          </div>
        );
      case 2: // Email Verification
        return (
          <div className="text-center py-8">
            <MailCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Verify Your Email</h3>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to{" "}
              <span className="font-semibold">{getValues("email")}</span>.
              Please check your email and click the link to verify your account.
            </p>

            <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You must verify your email before you can
                proceed with your application. If you don't see the email,
                please check your spam folder.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={resendVerificationEmail}
                disabled={verificationSent}
              >
                {verificationSent
                  ? "Email Resent!"
                  : "Resend Verification Email"}
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const isVerified = await checkEmailVerification();
                  if (isVerified) {
                    nextStep();
                  } else {
                    setSubmitError(
                      "Email not yet verified. Please check your inbox."
                    );
                  }
                }}
              >
                I've Verified My Email
              </Button>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {submitError}
              </div>
            )}
          </div>
        );
      case 3: // Professional Information
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">
              Professional Information
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide details about your professional background.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Registration Number*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.medicalRegistrationNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("medicalRegistrationNumber", {
                    required: "Registration number is required",
                  })}
                />
                {errors.medicalRegistrationNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.medicalRegistrationNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession*
                </label>
                <select
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.profession ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("profession", {
                    required: "Profession is required",
                  })}
                >
                  <option value="">Select Profession</option>
                  {professions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
                {errors.profession && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.profession.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area of Specialization*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.specialization ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("specialization", {
                    required: "Specialization is required",
                  })}
                />
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience*
                </label>
                <input
                  type="number"
                  min="0"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.yearsOfExperience
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("yearsOfExperience", {
                    required: "Years of experience is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.yearsOfExperience && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.yearsOfExperience.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Employer / Hospital / Clinic*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.currentEmployer
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("currentEmployer", {
                    required: "Current employer is required",
                  })}
                />
                {errors.currentEmployer && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currentEmployer.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country*
                </label>
                <select
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("country", {
                    required: "Country is required",
                  })}
                >
                  <option value="">Select Country</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Burundi">Burundi</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership Tier*
                </label>
                <select
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.membershipTier ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("membershipTier", {
                    required: "Membership tier is required",
                  })}
                >
                  <option value="">Select Membership Tier</option>
                  {membershipTierOptions.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
                {errors.membershipTier && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.membershipTier.message}
                  </p>
                )}
                {watch("membershipTier") === "Honorary Membership" && (
                  <p className="mt-1 text-xs text-yellow-600">
                    Note: Honorary membership requires special invitation
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Continue
              </Button>
            </div>
          </div>
        );
      case 4: // Education and Certification
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">
              Education and Certification
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide details about your education and upload relevant
              documents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Qualification*
                </label>
                <select
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.highestQualification
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("highestQualification", {
                    required: "Highest qualification is required",
                  })}
                >
                  <option value="">Select Qualification</option>
                  {qualifications.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
                {errors.highestQualification && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.highestQualification.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University / Institution Attended*
                </label>
                <input
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.institutionAttended
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("institutionAttended", {
                    required: "Institution is required",
                  })}
                />
                {errors.institutionAttended && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.institutionAttended.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Graduation*
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.yearOfGraduation
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("yearOfGraduation", {
                    required: "Year of graduation is required",
                  })}
                />
                {errors.yearOfGraduation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.yearOfGraduation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical License Expiry Date*
                </label>
                <input
                  type="date"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.licenseExpiryDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("licenseExpiryDate", {
                    required: "License expiry date is required",
                  })}
                />
                {errors.licenseExpiryDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.licenseExpiryDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Credentials (Max 4 files, PDF/Images)*
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="credentials"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="credentials"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        max={4}
                        className="sr-only"
                        {...register("credentials", {
                          required: "At least one credential is required",
                          validate: (files) => {
                            if (!files || files.length === 0)
                              return "At least one file is required";
                            if (files.length > 4)
                              return "Maximum 4 files allowed";
                            return true;
                          },
                        })}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>
              {errors.credentials && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.credentials.message}
                </p>
              )}

              {/* Show selected files */}
              {watch("credentials")?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected files:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {Array.from(watch("credentials")).map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Continue
              </Button>
            </div>
          </div>
        );
      case 5: // Compliance and Declarations
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">
              Compliance and Declarations
            </h3>
            <p className="text-gray-600 mb-4">
              Please review and agree to the following declarations.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToEthics"
                    type="checkbox"
                    className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                    {...register("agreeToEthics", {
                      required: "You must agree to the code of ethics",
                    })}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="agreeToEthics"
                    className="font-medium text-gray-700"
                  >
                    I agree to abide by the EACNA Code of Ethics and
                    Professional Conduct*
                  </label>
                  <p className="text-gray-500 mt-1">
                    By checking this box, you acknowledge that you have read and
                    agree to comply with the ethical standards set forth by the
                    East Africa Clinical Nurses Association.
                  </p>
                </div>
              </div>
              {errors.agreeToEthics && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.agreeToEthics.message}
                </p>
              )}

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="consentToDataProcessing"
                    type="checkbox"
                    className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                    {...register("consentToDataProcessing", {
                      required: "You must consent to data processing",
                    })}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="consentToDataProcessing"
                    className="font-medium text-gray-700"
                  >
                    I consent to the processing of my personal data for
                    membership purposes*
                  </label>
                  <p className="text-gray-500 mt-1">
                    EACNA will process your personal data in accordance with our
                    Privacy Policy and applicable data protection laws.
                  </p>
                </div>
              </div>
              {errors.consentToDataProcessing && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.consentToDataProcessing.message}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Application Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {getValues("firstName")} {getValues("lastName")}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {getValues("email")}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {getValues("phone")}
                  </p>
                  <p>
                    <span className="font-medium">Profession:</span>{" "}
                    {getValues("profession")}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Membership Tier:</span>{" "}
                    {
                      membershipTierOptions.find(
                        (t) => t.value === getValues("membershipTier")
                      )?.label
                    }
                  </p>
                  <p>
                    <span className="font-medium">Specialization:</span>{" "}
                    {getValues("specialization")}
                  </p>
                  <p>
                    <span className="font-medium">Current Employer:</span>{" "}
                    {getValues("currentEmployer")}
                  </p>
                  <p>
                    <span className="font-medium">Highest Qualification:</span>{" "}
                    {getValues("highestQualification")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(handleCompleteApplication)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {submitError}
              </div>
            )}
          </div>
        );
      case 6: // Success
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              Application Submitted Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Thank you for applying to become a member of EACNA. Your
              application is under review.
            </p>
            <p className="text-gray-600 mb-6">
              We will contact you via email at{" "}
              <span className="font-semibold">{getValues("email")}</span> within
              5-7 business days regarding your application status.
            </p>
            <Button onClick={() => navigate("/")}>Return to Homepage</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-2xl font-bold mb-6 text-primary-800">
          EACNA Membership Application
        </h2>
        <p className="text-gray-600 mb-8">
          Complete the following steps to apply for membership. Fields marked
          with an asterisk (*) are required.
        </p>

        {/* Progress Stepper */}
        <div className="mb-8 overflow-hidden">
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 border-b-2 pb-2 ${
                  currentStep >= step ? "border-primary-600" : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 ${
                      currentStep >= step
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </span>
                  <span
                    className={`font-medium ${
                      currentStep === step ? "text-primary-600" : ""
                    }`}
                  >
                    {step === 1 && "Personal Info"}
                    {step === 2 && "Email Verify"}
                    {step === 3 && "Professional Info"}
                    {step === 4 && "Education"}
                    {step === 5 && "Compliance"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>{renderFormStep()}</form>
      </CardContent>
    </Card>
  );
};

export default MembershipForm;
