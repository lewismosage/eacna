// components/membership/MembershipForm.tsx
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle, AlertCircle, Eye, EyeOff, MailCheck } from "lucide-react";
import Card, { CardContent } from "../../components/common/Card";
import Button from "../../components/common/Button";
import { createClient } from "@supabase/supabase-js";
import { MembershipTier, membershipTiers } from "../../types/membership";
import { useNavigate } from "react-router-dom";

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  email: string;
  phone: string;
  idNumber: string;
  membershipType: MembershipTier;
  currentProfession: string;
  institution: string;
  workAddress: string;
  registrationNumber: string;
  highestDegree: string;
  university: string;
  certifyInfo: boolean;
  consentData: boolean;
  password: string;
  confirmPassword: string;
};

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

interface MembershipFormProps {
  onComplete: (data: FormData) => void;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MembershipForm = ({ onComplete }: MembershipFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailForConfirmation, setEmailForConfirmation] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const watchedPassword = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordStrength = validatePassword(watchedPassword);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmitApplication = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      const { data: result, error } = await supabase.rpc(
        "create_membership_application",
        {
          p_email: formData.email,
          p_first_name: formData.firstName,
          p_last_name: formData.lastName,
          p_middle_name: formData.middleName,
          p_password: formData.password,
          p_phone: formData.phone,
          p_id_number: formData.idNumber,
          p_gender: formData.gender,
          p_nationality: formData.nationality,
          p_country_of_residence: formData.countryOfResidence,
          p_membership_type: formData.membershipType,
          p_current_profession: formData.currentProfession,
          p_institution: formData.institution,
          p_work_address: formData.workAddress,
          p_registration_number: formData.registrationNumber,
          p_highest_degree: formData.highestDegree,
          p_university: formData.university,
          p_certify_info: formData.certifyInfo,
          p_consent_data: formData.consentData
        }
      );
  
      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || "Unknown error");
  
      onComplete?.(formData);
      nextStep();
    } catch (err) {
      console.error("Error submitting application:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountCreation = async (formData: FormData) => {
    try {
      await supabase.auth.signUp({
        email: formData.email,
        password: formData.password, // Generate random password if not provided
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });
    } catch (err) {
      console.error("Account creation optional - not critical:", err);
    }
  };

  const steps = [{ title: "Application Details" }, { title: "Confirmation" }];

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Account Creation</h3>
            <p className="text-gray-600 mb-4">
              First, create your account with basic information. You'll need to
              verify your email before completing the full application.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="firstName"
                >
                  First Name*
                </label>
                <input
                  id="firstName"
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
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="middleName"
                >
                  Middle Name
                </label>
                <input
                  id="middleName"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  {...register("middleName")}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="lastName"
                >
                  Last Name*
                </label>
                <input
                  id="lastName"
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
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="email"
                >
                  Email*
                </label>
                <input
                  id="email"
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
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="phone"
                >
                  Phone Number*
                </label>
                <input
                  id="phone"
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
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="password"
                >
                  Password*
                </label>
                <div className="relative">
                  <input
                    id="password"
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
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
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
                onClick={handleSubmit(handleSubmitApplication)}
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
      case 2:
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for your application. We'll review your information and
              contact you soon.
            </p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
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
          EACNA Online Membership Application
        </h2>
        <p className="text-gray-600 mb-8">
          Please complete the form below. Fields marked with an asterisk (*) are
          required.
        </p>

        <div className="mb-8 overflow-hidden">
          <div className="flex mb-2">
            <div
              className={`flex-1 border-b-2 pb-2 ${
                currentStep >= 1 ? "border-primary-600" : "border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 ${
                    currentStep >= 1
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </span>
                <span className="font-medium">Account Creation</span>
              </div>
            </div>
            <div
              className={`flex-1 border-b-2 pb-2 ${
                currentStep >= 2 ? "border-primary-600" : "border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 ${
                    currentStep >= 2
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </span>
                <span className="font-medium">Email Verification</span>
              </div>
            </div>
            <div
              className={`flex-1 border-b-2 pb-2 ${
                currentStep >= 3 ? "border-primary-600" : "border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 ${
                    currentStep >= 3
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </span>
                <span className="font-medium">Application Details</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>{renderFormStep()}</form>
      </CardContent>
    </Card>
  );
};

export default MembershipForm;
