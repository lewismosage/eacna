import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Upload, Award, Clock, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface FormData {
  // Personal Information
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: File | null;
  gender: string;

  // Professional Information
  title: string;
  specialization: string;
  otherSpecialization: string;
  yearsExperience: string;
  languages: {
    english: boolean;
    swahili: boolean;
    french: boolean;
    kinyarwanda: boolean;
    luganda: boolean;
    luo: boolean;
    other: boolean;
  };
  otherLanguage: string;
  expertise: string[];
  affiliations: string[];

  // Location Information
  hospital: string;
  city: string;
  country: string;
  address: string;

  // Professional Details
  bio: string;
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  experience: {
    role: string;
    institution: string;
    period: string;
    description: string;
  }[];
  certifications: string;
  researchInterests: string[];

  // Services
  services: {
    name: string;
    description: string;
    duration: string;
  }[];
  conditionsTreated: string[];
  rates: {
    inPerson: string;
    video: string;
    chat: string;
  };

  // Availability
  availability: string;

  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const JoinDirectoryForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    prefix: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photo: null,
    gender: "",
    title: "",
    specialization: "",
    otherSpecialization: "",
    yearsExperience: "",
    languages: {
      english: false,
      swahili: false,
      french: false,
      kinyarwanda: false,
      luganda: false,
      luo: false,
      other: false,
    },
    otherLanguage: "",
    expertise: [],
    affiliations: [],
    hospital: "",
    city: "",
    country: "",
    address: "",
    bio: "",
    education: [],
    experience: [],
    certifications: "",
    researchInterests: [],
    services: [],
    conditionsTreated: [],
    rates: {
      inPerson: "",
      video: "",
      chat: "",
    },
    availability: "available",
    acceptTerms: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [educationEntries, setEducationEntries] = useState([
    { degree: "", institution: "", period: "" },
  ]);
  const [experienceEntries, setExperienceEntries] = useState([
    { role: "", institution: "", period: "", description: "" },
  ]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [affiliationInput, setAffiliationInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [serviceInput, setServiceInput] = useState({
    name: "",
    description: "",
    duration: "",
  });
  const [researchInput, setResearchInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const specializations = [
    "Pediatric Neurology",
    "Developmental Pediatrics",
    "Child Psychology",
    "Pediatric Neurosurgery",
    "Other",
  ];

  const countries = [
    "Kenya",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "Burundi",
    "Ethiopia",
    "South Sudan",
  ];

  const availabilityOptions = [
    { value: "available", label: "Available for new patients" },
    { value: "limited", label: "Limited availability" },
    { value: "unavailable", label: "Not accepting new patients" },
  ];

  const validatePhoneNumber = (phone: string): boolean => {
    const regex = /^\+?[\d\s-]{10,15}$/;
    return regex.test(phone);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      const { checked } = target;

      if (name.startsWith("languages.")) {
        const language = name.split(".")[1];
        setFormData({
          ...formData,
          languages: {
            ...formData.languages,
            [language]: checked,
          },
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else if (type === "file") {
      const target = e.target as HTMLInputElement;
      const file = target.files ? target.files[0] : null;

      if (file) {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
          setFormErrors({
            ...formErrors,
            photo: "Only JPG, PNG, or GIF files are allowed",
          });
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setFormErrors({
            ...formErrors,
            photo: "File size must be less than 5MB",
          });
          return;
        }
      }

      setFormData({
        ...formData,
        [name]: file,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleArrayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    arrayName: string
  ) => {
    const { value } = e.target;
    if (arrayName === "expertise") setExpertiseInput(value);
    if (arrayName === "affiliations") setAffiliationInput(value);
    if (arrayName === "conditionsTreated") setConditionInput(value);
    if (arrayName === "researchInterests") setResearchInput(value);
  };

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setServiceInput({
      ...serviceInput,
      [field]: e.target.value,
    });
  };

  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      { degree: "", institution: "", period: "" },
    ]);
  };

  const removeEducationEntry = (index: number) => {
    const updated = [...educationEntries];
    updated.splice(index, 1);
    setEducationEntries(updated);
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...educationEntries];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEducationEntries(updated);
  };

  const addExperienceEntry = () => {
    setExperienceEntries([
      ...experienceEntries,
      { role: "", institution: "", period: "", description: "" },
    ]);
  };

  const removeExperienceEntry = (index: number) => {
    const updated = [...experienceEntries];
    updated.splice(index, 1);
    setExperienceEntries(updated);
  };

  const handleExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...experienceEntries];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setExperienceEntries(updated);
  };

  const addItem = (arrayName: string) => {
    if (arrayName === "expertise" && expertiseInput.trim()) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput],
      });
      setExpertiseInput("");
    } else if (arrayName === "affiliations" && affiliationInput.trim()) {
      setFormData({
        ...formData,
        affiliations: [...formData.affiliations, affiliationInput],
      });
      setAffiliationInput("");
    } else if (arrayName === "conditionsTreated" && conditionInput.trim()) {
      setFormData({
        ...formData,
        conditionsTreated: [...formData.conditionsTreated, conditionInput],
      });
      setConditionInput("");
    } else if (arrayName === "researchInterests" && researchInput.trim()) {
      setFormData({
        ...formData,
        researchInterests: [...formData.researchInterests, researchInput],
      });
      setResearchInput("");
    }
  };

  const addService = () => {
    if (
      serviceInput.name.trim() &&
      serviceInput.description.trim() &&
      serviceInput.duration.trim()
    ) {
      setFormData({
        ...formData,
        services: [...formData.services, serviceInput],
      });
      setServiceInput({ name: "", description: "", duration: "" });
    }
  };

  const removeItem = (arrayName: string, index: number) => {
    if (arrayName === "expertise") {
      setFormData({
        ...formData,
        expertise: formData.expertise.filter((_, i) => i !== index),
      });
    } else if (arrayName === "affiliations") {
      setFormData({
        ...formData,
        affiliations: formData.affiliations.filter((_, i) => i !== index),
      });
    } else if (arrayName === "conditionsTreated") {
      setFormData({
        ...formData,
        conditionsTreated: formData.conditionsTreated.filter(
          (_, i) => i !== index
        ),
      });
    } else if (arrayName === "researchInterests") {
      setFormData({
        ...formData,
        researchInterests: formData.researchInterests.filter(
          (_, i) => i !== index
        ),
      });
    } else if (arrayName === "services") {
      setFormData({
        ...formData,
        services: formData.services.filter((_, i) => i !== index),
      });
    }
  };

  const validateStep = (step: number): FormErrors => {
    const errors: FormErrors = {};

    if (step === 1) {
      if (!formData.prefix) {
        errors.prefix = "Please select a prefix";
      }
      if (!formData.firstName.trim())
        errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Email is invalid";
      }
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!validatePhoneNumber(formData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.photo) errors.photo = "Profile photo is required";
    } else if (step === 2) {
      if (!formData.title.trim())
        errors.title = "Professional title is required";
      if (!formData.specialization)
        errors.specialization = "Specialization is required";
      if (
        formData.specialization === "Other" &&
        !formData.otherSpecialization.trim()
      ) {
        errors.otherSpecialization = "Please specify your specialization";
      }
      if (!formData.yearsExperience)
        errors.yearsExperience = "Years of experience is required";

      const hasSelectedLanguage = Object.values(formData.languages).some(
        (value) => value === true
      );
      if (!hasSelectedLanguage) {
        errors.languages = "Please select at least one language";
      }

      if (formData.languages.other && !formData.otherLanguage.trim()) {
        errors.otherLanguage = "Please specify the other language";
      }

      if (formData.expertise.length === 0) {
        errors.expertise = "Please add at least one area of expertise";
      }
    } else if (step === 3) {
      if (!formData.hospital.trim())
        errors.hospital = "Hospital/Institution is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.country) errors.country = "Country is required";
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.availability)
        errors.availability = "Availability status is required";
    } else if (step === 4) {
      if (
        educationEntries.some(
          (edu) =>
            !edu.degree.trim() || !edu.institution.trim() || !edu.period.trim()
        )
      ) {
        errors.education = "Please complete all education entries";
      }
      if (
        experienceEntries.some(
          (exp) =>
            !exp.role.trim() || !exp.institution.trim() || !exp.period.trim()
        )
      ) {
        errors.experience = "Please complete all experience entries";
      }
      if (!formData.bio.trim()) errors.bio = "Professional bio is required";
      if (formData.services.length === 0) {
        errors.services = "Please add at least one service";
      }
      if (formData.conditionsTreated.length === 0) {
        errors.conditionsTreated = "Please add at least one condition treated";
      }
    } else if (step === 5) {
      if (!formData.acceptTerms)
        errors.acceptTerms = "You must accept the terms and conditions";
    }

    return errors;
  };

  const handleNext = (): void => {
    const errors = validateStep(step);

    if (Object.keys(errors).length === 0) {
      // Before moving to next step, update formData with dynamic entries
      if (step === 4) {
        setFormData({
          ...formData,
          education: educationEntries.filter(
            (edu) =>
              edu.degree.trim() && edu.institution.trim() && edu.period.trim()
          ),
          experience: experienceEntries.filter(
            (exp) =>
              exp.role.trim() && exp.institution.trim() && exp.period.trim()
          ),
        });
      }

      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setFormErrors(errors);
      const firstError = Object.keys(errors)[0];
      document
        .getElementById(firstError)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleBack = (): void => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const errors = validateStep(step);

    if (Object.keys(errors).length === 0) {
      try {
        // Handle photo upload if exists
        let photoUrl = null;
        if (formData.photo) {
          const fileExt = formData.photo.name.split(".").pop();
          const fileName = `${formData.firstName}-${
            formData.lastName
          }-${Date.now()}.${fileExt}`;
          const filePath = `specialist-photos/${fileName}`;

          // First check if the file is valid
          const validTypes = ["image/jpeg", "image/png", "image/gif"];
          if (!validTypes.includes(formData.photo.type)) {
            throw new Error("Only JPG, PNG, or GIF files are allowed");
          }

          if (formData.photo.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
          }

          const { error: uploadError } = await supabase.storage
            .from("profile_photos")
            .upload(filePath, formData.photo);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("profile_photos").getPublicUrl(filePath);

          photoUrl = publicUrl;
        }

        // Prepare the data for submission to match your table structure
        const applicationData = {
          // Personal Information
          prefix: formData.prefix,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          photo_url: photoUrl,
          gender: formData.gender,

          // Professional Information
          title: formData.title,
          specialization: formData.specialization,
          other_specialization: formData.otherSpecialization,
          years_experience: parseInt(formData.yearsExperience) || 0,
          languages: formData.languages,
          other_language: formData.otherLanguage,
          expertise: formData.expertise,
          affiliations: formData.affiliations,

          // Location Information
          hospital: formData.hospital,
          city: formData.city,
          country: formData.country,
          address: formData.address,
          availability: formData.availability,

          // Professional Details
          bio: formData.bio,
          education: educationEntries.filter(
            (edu) =>
              edu.degree.trim() && edu.institution.trim() && edu.period.trim()
          ),
          experience: experienceEntries.filter(
            (exp) =>
              exp.role.trim() && exp.institution.trim() && exp.period.trim()
          ),
          certifications: formData.certifications,
          research_interests: formData.researchInterests,

          // Services
          services: formData.services,
          conditions_treated: formData.conditionsTreated,
          rates: formData.rates,

          // Terms
          accept_terms: formData.acceptTerms,

          // Status (default is 'pending' as per your table)
          status: "pending",
        };

        // Insert the application into the specialist_applications table
        const { error: insertError } = await supabase
          .from("specialist_applications")
          .insert(applicationData);

        if (insertError) throw insertError;

        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Submission error:", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to submit application. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
      setIsSubmitting(false);
      const firstError = Object.keys(errors)[0];
      document
        .getElementById(firstError)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const renderStepIndicator = (): JSX.Element => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className="flex flex-col items-center relative flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  stepNumber < step
                    ? "bg-green-500 text-white"
                    : stepNumber === step
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber < step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <div className="text-xs mt-2 font-medium text-gray-600 text-center">
                {stepNumber === 1 && "Personal"}
                {stepNumber === 2 && "Professional"}
                {stepNumber === 3 && "Location"}
                {stepNumber === 4 && "Experience"}
                {stepNumber === 5 && "Review"}
              </div>

              {stepNumber < 5 && (
                <div
                  className="absolute w-full h-0.5 bg-gray-300 top-5 left-1/2 -translate-x-1/2"
                  style={{ zIndex: -1 }}
                >
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: step > stepNumber ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalInfoForm = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Personal Information
          </h3>

          {/* Name Section - Better organized in a single row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Prefix - Smaller width */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefix
              </label>
              <select
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                className={`w-full border ${
                  formErrors.prefix ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              >
                <option value="">Select Prefix</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Pharm">Pharm</option>
              </select>
              {formErrors.prefix && (
                <p className="mt-1 text-sm text-red-600">{formErrors.prefix}</p>
              )}
            </div>

            {/* First Name */}
            <div className="md:col-span-1">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  formErrors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="md:col-span-1">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  formErrors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.lastName}
                </p>
              )}
            </div>

            {/* Gender - Moved to same row */}
            <div className="md:col-span-1">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  formErrors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formErrors.gender && (
                <p className="mt-1 text-sm text-red-500">{formErrors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="+xxx xxx xxx xxx"
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
            )}
          </div>
        </div>

        {/* Profile Photo - More compact and better aligned */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Photo <span className="text-red-500">*</span>
            {formErrors.photo && (
              <span className="text-red-500 ml-1">* {formErrors.photo}</span>
            )}
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload your profile photo (showing your face clearly)
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                formData.photo
                  ? "border-primary-300 bg-primary-50 w-40"
                  : "border-gray-300 w-40"
              }`}
            >
              {formData.photo ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 overflow-hidden rounded-full">
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate w-full">
                    {formData.photo.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.photo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="mt-1">
                    <label
                      htmlFor="photo"
                      className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      <span>Upload photo</span>
                      <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/jpeg, image/png, image/gif"
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {formData.photo && (
              <div className="flex flex-col justify-center h-full">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photo: null })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfessionalInfoForm = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary-800">
          Professional Information
        </h3>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Professional Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Pediatric Neurologist, Developmental Pediatrician"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              formErrors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="specialization"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Area of Specialization <span className="text-red-500">*</span>
            </label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.specialization ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Specialization</option>
              {specializations.map((spec, index) => (
                <option key={index} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {formErrors.specialization && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.specialization}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="yearsExperience"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="yearsExperience"
              name="yearsExperience"
              min="0"
              max="50"
              value={formData.yearsExperience}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.yearsExperience
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formErrors.yearsExperience && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.yearsExperience}
              </p>
            )}
          </div>
        </div>

        {formData.specialization === "Other" && (
          <div>
            <label
              htmlFor="otherSpecialization"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Other Specialization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="otherSpecialization"
              name="otherSpecialization"
              value={formData.otherSpecialization}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.otherSpecialization
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formErrors.otherSpecialization && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.otherSpecialization}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-3">
            Languages Spoken <span className="text-red-500">*</span>
            {formErrors.languages && (
              <span className="text-red-500 ml-2">{formErrors.languages}</span>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.english"
                name="languages.english"
                checked={formData.languages.english}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.english"
                className="ml-2 block text-sm text-gray-700"
              >
                English
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.swahili"
                name="languages.swahili"
                checked={formData.languages.swahili}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.swahili"
                className="ml-2 block text-sm text-gray-700"
              >
                Swahili
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.french"
                name="languages.french"
                checked={formData.languages.french}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.french"
                className="ml-2 block text-sm text-gray-700"
              >
                French
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.kinyarwanda"
                name="languages.kinyarwanda"
                checked={formData.languages.kinyarwanda}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.kinyarwanda"
                className="ml-2 block text-sm text-gray-700"
              >
                Kinyarwanda
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.luganda"
                name="languages.luganda"
                checked={formData.languages.luganda}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.luganda"
                className="ml-2 block text-sm text-gray-700"
              >
                Luganda
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.luo"
                name="languages.luo"
                checked={formData.languages.luo}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.luo"
                className="ml-2 block text-sm text-gray-700"
              >
                Luo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="languages.other"
                name="languages.other"
                checked={formData.languages.other}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="languages.other"
                className="ml-2 block text-sm text-gray-700"
              >
                Other
              </label>
            </div>
          </div>
        </div>

        {formData.languages.other && (
          <div>
            <label
              htmlFor="otherLanguage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Other Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="otherLanguage"
              name="otherLanguage"
              value={formData.otherLanguage}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.otherLanguage ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.otherLanguage && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.otherLanguage}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="expertise"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Areas of Expertise <span className="text-red-500">*</span>
            {formErrors.expertise && (
              <span className="text-red-500 ml-2">{formErrors.expertise}</span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="expertise"
              value={expertiseInput}
              onChange={(e) => handleArrayInputChange(e, "expertise")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add an area of expertise"
            />
            <button
              type="button"
              onClick={() => addItem("expertise")}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {formData.expertise.map((expertise, index) => (
              <div
                key={index}
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm flex items-center"
              >
                {expertise}
                <button
                  type="button"
                  onClick={() => removeItem("expertise", index)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="affiliations"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Professional Affiliations
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="affiliations"
              value={affiliationInput}
              onChange={(e) => handleArrayInputChange(e, "affiliations")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add a professional affiliation e.g Kenya Medical Association (KMA)"
            />
            <button
              type="button"
              onClick={() => addItem("affiliations")}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {formData.affiliations.map((affiliation, index) => (
              <div
                key={index}
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm flex items-center"
              >
                {affiliation}
                <button
                  type="button"
                  onClick={() => removeItem("affiliations", index)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLocationInfoForm = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary-800">
          Location Information
        </h3>

        <div>
          <label
            htmlFor="hospital"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hospital/Institution <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="hospital"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              formErrors.hospital ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.hospital && (
            <p className="mt-1 text-sm text-red-500">{formErrors.hospital}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.city && (
              <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                formErrors.country ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Country</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {formErrors.country && (
              <p className="mt-1 text-sm text-red-500">{formErrors.country}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              formErrors.address ? "border-red-500" : "border-gray-300"
            }`}
          ></textarea>
          {formErrors.address && (
            <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="availability"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Availability Status <span className="text-red-500">*</span>
          </label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              formErrors.availability ? "border-red-500" : "border-gray-300"
            }`}
          >
            {availabilityOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.availability && (
            <p className="mt-1 text-sm text-red-500">
              {formErrors.availability}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderExperienceForm = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary-800">
          Professional Experience
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education <span className="text-red-500">*</span>
            {formErrors.education && (
              <span className="text-red-500 ml-2">{formErrors.education}</span>
            )}
          </label>

          {educationEntries.map((edu, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-200 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor={`education-degree-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`education-degree-${index}`}
                    value={edu.degree}
                    onChange={(e) =>
                      handleEducationChange(index, "degree", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`education-institution-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`education-institution-${index}`}
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`education-period-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`education-period-${index}`}
                    value={edu.period}
                    onChange={(e) =>
                      handleEducationChange(index, "period", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g. 2010-2014"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeEducationEntry(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Education
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEducationEntry}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Award className="-ml-0.5 mr-2 h-4 w-4" />
            Add Education
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Experience <span className="text-red-500">*</span>
            {formErrors.experience && (
              <span className="text-red-500 ml-2">{formErrors.experience}</span>
            )}
          </label>

          {experienceEntries.map((exp, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-200 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor={`experience-role-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`experience-role-${index}`}
                    value={exp.role}
                    onChange={(e) =>
                      handleExperienceChange(index, "role", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`experience-institution-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`experience-institution-${index}`}
                    value={exp.institution}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`experience-period-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`experience-period-${index}`}
                    value={exp.period}
                    onChange={(e) =>
                      handleExperienceChange(index, "period", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g. 2015-Present"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`experience-description-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id={`experience-description-${index}`}
                  rows={3}
                  value={exp.description}
                  onChange={(e) =>
                    handleExperienceChange(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeExperienceEntry(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Experience
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExperienceEntry}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Clock className="-ml-0.5 mr-2 h-4 w-4" />
            Add Experience
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Please provide a brief professional biography that will be displayed on your profile"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              formErrors.bio ? "border-red-500" : "border-gray-300"
            }`}
          ></textarea>
          {formErrors.bio && (
            <p className="mt-1 text-sm text-red-500">{formErrors.bio}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services Offered <span className="text-red-500">*</span>
            {formErrors.services && (
              <span className="text-red-500 ml-2">{formErrors.services}</span>
            )}
          </label>

          {formData.services.map((service, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-200 rounded-lg"
            >
              <h4 className="font-medium text-primary-700">{service.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {service.description}
              </p>
              <p className="text-xs text-gray-500">
                Duration: {service.duration}
              </p>
              <button
                type="button"
                onClick={() => removeItem("services", index)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Service
              </button>
            </div>
          ))}

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="mb-4">
              <label
                htmlFor="service-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Service Name
              </label>
              <input
                type="text"
                id="service-name"
                value={serviceInput.name}
                onChange={(e) => handleServiceChange(e, "name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="service-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="service-description"
                rows={2}
                value={serviceInput.description}
                onChange={(e) => handleServiceChange(e, "description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="service-duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duration
              </label>
              <input
                type="text"
                id="service-duration"
                value={serviceInput.duration}
                onChange={(e) => handleServiceChange(e, "duration")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g. 60 minutes"
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conditions Treated <span className="text-red-500">*</span>
            {formErrors.conditionsTreated && (
              <span className="text-red-500 ml-2">
                {formErrors.conditionsTreated}
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="conditionsTreated"
              value={conditionInput}
              onChange={(e) => handleArrayInputChange(e, "conditionsTreated")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add a condition you treat"
            />
            <button
              type="button"
              onClick={() => addItem("conditionsTreated")}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {formData.conditionsTreated.map((condition, index) => (
              <div
                key={index}
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm flex items-center"
              >
                {condition}
                <button
                  type="button"
                  onClick={() => removeItem("conditionsTreated", index)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReviewForm = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-primary-800">
          Review Your Information
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-gray-900">
                {formData.prefix} {formData.firstName} {formData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-gray-900">{formData.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-gray-900">{formData.gender}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Professional Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="text-gray-900">{formData.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Specialization
              </p>
              <p className="text-gray-900">
                {formData.specialization === "Other"
                  ? formData.otherSpecialization
                  : formData.specialization}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Years of Experience
              </p>
              <p className="text-gray-900">{formData.yearsExperience}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Languages Spoken
              </p>
              <p className="text-gray-900">
                {[
                  ...Object.entries(formData.languages)
                    .filter(([_, value]) => value)
                    .map(([key]) =>
                      key === "other" ? formData.otherLanguage : key
                    ),
                ].join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Areas of Expertise
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.expertise.map((expertise, index) => (
                <span
                  key={index}
                  className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
                >
                  {expertise}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Professional Affiliations
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.affiliations.length > 0 ? (
                formData.affiliations.map((affiliation, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm"
                  >
                    {affiliation}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">None specified</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Location Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Hospital/Institution
              </p>
              <p className="text-gray-900">{formData.hospital}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-gray-900">
                {formData.city}, {formData.country}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-gray-900">{formData.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Availability</p>
              <p className="text-gray-900">
                {
                  availabilityOptions.find(
                    (opt) => opt.value === formData.availability
                  )?.label
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Professional Details
          </h4>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Education</p>
            <div className="mt-2 space-y-4">
              {educationEntries
                .filter(
                  (edu) =>
                    edu.degree.trim() &&
                    edu.institution.trim() &&
                    edu.period.trim()
                )
                .map((edu, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary-500 pl-4 py-1"
                  >
                    <h4 className="font-medium text-gray-800">{edu.degree}</h4>
                    <p className="text-sm text-primary-600">
                      {edu.institution}
                    </p>
                    <p className="text-xs text-gray-500">{edu.period}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Work Experience</p>
            <div className="mt-2 space-y-4">
              {experienceEntries
                .filter(
                  (exp) =>
                    exp.role.trim() &&
                    exp.institution.trim() &&
                    exp.period.trim()
                )
                .map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary-500 pl-4 py-1"
                  >
                    <h4 className="font-medium text-gray-800">{exp.role}</h4>
                    <p className="text-sm text-primary-600">
                      {exp.institution}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">{exp.period}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">
              Professional Bio
            </p>
            <p className="text-gray-700 mt-1">{formData.bio}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Services & Rates
            </h4>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">
                Services Offered
              </p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.services.map((service, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-primary-700">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration: {service.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">
                Conditions Treated
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.conditionsTreated.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start mt-6">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="font-medium text-gray-700">
              Terms and Conditions <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500">
              I agree to the{" "}
              <a
                href="terms-of-service"
                className="text-primary-600 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="privacy-policy"
                className="text-primary-600 hover:underline"
              >
                Privacy Policy
              </a>
              . I confirm that all the information provided is accurate and
              up-to-date.
            </p>
            {formErrors.acceptTerms && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.acceptTerms}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessMessage = (): JSX.Element => {
    return (
      <motion.div
        className="text-center py-12"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-primary-800 mb-4">
          Registration Successful!
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Thank you for your submission. Our team will review your Registration
          and contact you once your profile is approved for the specialist
          directory.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You will receive a confirmation email at{" "}
            <span className="font-semibold">{formData.email}</span> once your
            submission has been approved.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Homepage
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative py-16 lg:py-20">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Join Our Specialist Directory
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mb-8 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Connect with patients and colleagues across East Africa by becoming
            part of our growing network of pediatric neurology specialists.
          </motion.p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
            {isSubmitted ? (
              renderSuccessMessage()
            ) : (
              <form onSubmit={handleSubmit}>
                {renderStepIndicator()}

                <div className="mt-8">
                  {step === 1 && renderPersonalInfoForm()}
                  {step === 2 && renderProfessionalInfoForm()}
                  {step === 3 && renderLocationInfoForm()}
                  {step === 4 && renderExperienceForm()}
                  {step === 5 && renderReviewForm()}
                </div>

                <div className="mt-10 flex justify-between items-center">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  )}
                </div>

                {submitError && (
                  <div className="mt-4 p-4 bg-red-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Submission Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{submitError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">
              Benefits of Joining Our Directory
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Becoming part of our specialist network connects you with patients
              and colleagues across East Africa, enhancing your professional
              visibility and impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-2">
                Enhanced Visibility
              </h3>
              <p className="text-gray-600">
                Make your practice more visible to patients searching for
                specialists in your area of expertise. Our directory is a
                trusted resource for families seeking neurological care.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-2">
                Professional Networking
              </h3>
              <p className="text-gray-600">
                Connect with other specialists for consultations, referrals, and
                collaboration opportunities. Build relationships with colleagues
                across East Africa.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-2">
                Educational Resources
              </h3>
              <p className="text-gray-600">
                Access exclusive educational content, webinars, and training
                opportunities. Stay updated with the latest developments in
                pediatric neurology.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinDirectoryForm;
