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
    watch,
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

  const handleInitialSignup = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setEmailForConfirmation(formData.email);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (authError) throw authError;
      nextStep();
    } catch (err) {
      console.error("Error during signup:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteApplication = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: result, error } = await supabase.rpc(
        "create_membership_application",
        {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          gender: formData.gender,
          nationality: formData.nationality,
          country_of_residence: formData.countryOfResidence,
          phone: formData.phone,
          id_number: formData.idNumber,
          membership_type: formData.membershipType,
          current_profession: formData.currentProfession,
          institution: formData.institution,
          work_address: formData.workAddress,
          registration_number: formData.registrationNumber,
          highest_degree: formData.highestDegree,
          university: formData.university,
          certify_info: formData.certifyInfo,
          consent_data: formData.consentData,
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
                onClick={async () => {
                  const isValid = await trigger([
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                    "password",
                    "confirmPassword",
                  ]);

                  if (isValid) {
                    const formData = getValues();
                    await handleInitialSignup(formData);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : "Create Account & Verify Email"}
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
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
              <MailCheck className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary-800">
              Verify Your Email
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              We've sent a confirmation email to{" "}
              <strong>{emailForConfirmation}</strong>. Please check your inbox
              and click the verification link to continue your application.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Didn't receive the email? Check your spam folder or
              <button
                className="text-blue-600 hover:text-blue-800 ml-1"
                onClick={async () => {
                  if (emailForConfirmation) {
                    await supabase.auth.resend({
                      type: "signup",
                      email: emailForConfirmation,
                    });
                  }
                }}
              >
                resend confirmation
              </button>
            </p>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={async () => {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();
                  if (user?.email_confirmed_at) {
                    setCurrentStep(3); // Move to form completion if confirmed
                  } else {
                    alert("Please confirm your email first. Check your inbox.");
                  }
                }}
              >
                I've Verified My Email
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">
              Complete Your Application
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for verifying your email. Please complete the remaining
              application details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="gender"
                >
                  Gender*
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      value="male"
                      {...register("gender", {
                        required: "Gender is required",
                      })}
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      value="female"
                      {...register("gender", {
                        required: "Gender is required",
                      })}
                    />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="nationality"
                >
                  Nationality*
                </label>
                <select
                  id="nationality"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.nationality ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("nationality", {
                    required: "Nationality is required",
                  })}
                >
                  <option value="">Select nationality</option>
                  <option value="kenyan">Kenyan</option>
                  <option value="ugandan">Ugandan</option>
                  <option value="tanzanian">Tanzanian</option>
                  <option value="south_sudanese">South Sudanese</option>
                  <option value="rwandese">Rwandese</option>
                  <option value="burundian">Burundian</option>
                  <option value="ethiopian">Ethiopian</option>
                  <option value="somalian">Somalian</option>
                </select>
                {errors.nationality && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nationality.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="countryOfResidence"
                >
                  Country of Residence*
                </label>
                <select
                  id="countryOfResidence"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.countryOfResidence
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("countryOfResidence", {
                    required: "Country of residence is required",
                  })}
                >
                  <option value="">Select country</option>
                  <option value="kenya">Kenya</option>
                  <option value="uganda">Uganda</option>
                  <option value="tanzania">Tanzania</option>
                  <option value="burundi">Burundi</option>
                  <option value="south_sudan">South Sudan</option>
                  <option value="rwanda">Rwanda</option>
                  <option value="ethiopia">Ethiopia</option>
                  <option value="somalia">Somalia</option>
                </select>
                {errors.countryOfResidence && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.countryOfResidence.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="idNumber"
                >
                  ID Number/Passport*
                </label>
                <input
                  id="idNumber"
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.idNumber ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("idNumber", {
                    required: "ID or Passport number is required",
                  })}
                />
                {errors.idNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.idNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="membershipType"
                >
                  Membership Category
                </label>
                <select
                  id="membershipType"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.membershipType ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                  {...register("membershipType", { required: true })}
                >
                  <option value="">Select membership type</option>
                  {Object.keys(membershipTiers).map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
                {errors.membershipType && (
                  <p className="mt-1 text-sm text-red-600">
                    Membership type is required
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="currentProfession"
                >
                  Current Profession
                </label>
                <input
                  id="currentProfession"
                  type="text"
                  placeholder="e.g., Paediatric Neurologist"
                  className={`"appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" ${
                    errors.currentProfession
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...register("currentProfession", { required: true })}
                />
                {errors.currentProfession && (
                  <p className="mt-1 text-sm text-red-600">
                    Current profession is required
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="institution"
              >
                Institution
              </label>
              <input
                id="institution"
                type="text"
                className={`"appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" ${
                  errors.institution ? "border-red-500" : "border-gray-300"
                }`}
                {...register("institution", { required: true })}
              />
              {errors.institution && (
                <p className="mt-1 text-sm text-red-600">
                  Institution is required
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="workAddress"
              >
                Work Address
              </label>
              <textarea
                id="workAddress"
                rows={3}
                className={`"appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" ${
                  errors.workAddress ? "border-red-500" : "border-gray-300"
                }`}
                {...register("workAddress", { required: true })}
              ></textarea>
              {errors.workAddress && (
                <p className="mt-1 text-sm text-red-600">
                  Work address is required
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="registrationNumber"
              >
                Medical Registration/Licensure Number
              </label>
              <input
                id="registrationNumber"
                type="text"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...register("registrationNumber")}
              />
            </div>

            <h3 className="text-xl font-semibold mb-4 pt-4">
              Educational Background
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="highestDegree"
                >
                  Highest Degree Earned
                </label>
                <input
                  id="highestDegree"
                  type="text"
                  className={`"appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" ${
                    errors.highestDegree ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("highestDegree", { required: true })}
                />
                {errors.highestDegree && (
                  <p className="mt-1 text-sm text-red-600">
                    Highest degree is required
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="university"
                >
                  University/Institution
                </label>
                <input
                  id="university"
                  type="text"
                  className={`"appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" ${
                    errors.university ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("university", { required: true })}
                />
                {errors.university && (
                  <p className="mt-1 text-sm text-red-600">
                    University is required
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-2">Declaration & Consent</h4>
              <div className="space-y-3">
                <label className="inline-flex items-start">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register("certifyInfo", { required: true })}
                  />
                  <span className="ml-2 text-gray-700">
                    I certify that the information provided is true and complete
                    to the best of my knowledge.
                  </span>
                </label>
                {errors.certifyInfo && (
                  <p className="text-sm text-red-600">
                    You must certify that the information is true
                  </p>
                )}

                <label className="inline-flex items-start">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register("consentData", { required: true })}
                  />
                  <span className="ml-2 text-gray-700">
                    I consent to the use of my data for official communication
                    and EACNA activities.
                  </span>
                </label>
                {errors.consentData && (
                  <p className="text-sm text-red-600">
                    You must consent to data usage
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
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

      case 4:
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary-800">
              Application Submitted!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Thank you for your application to join EACNA. We'll review your
              information and contact you soon. Once approved, you'll be able to
              complete your payment through the payment portal.
            </p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Return Home
            </Button>
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
