import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Award, Users, BookOpen, Heart, Star } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    profession: "",
    password: "",
    confirmPassword: "",
    membershipType: "Associate",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus("Passwords do not match");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", formData.email);

    if (data && data.length > 0) {
      setStatus("Email already exists");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      }
    );

    const { user, session } = signUpData || {};

    if (signUpError) {
      setStatus(signUpError.message);
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user?.id || "",
        full_name: formData.fullName,
        phone: formData.phone,
        profession: formData.profession,
        membership_type: formData.membershipType,
        status: "pending",
      },
    ]);

    if (insertError) {
      setStatus(insertError.message);
      return;
    }

    setStatus(
      "Registration successful! Please check your email to verify your account."
    );
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      profession: "",
      password: "",
      confirmPassword: "",
      membershipType: "Associate",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Apply for Membership
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our community of dedicated professionals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status && <p className="text-center text-red-600 mb-4">{status}</p>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-700"
              >
                Profession
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.profession}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="membershipType"
                className="block text-sm font-medium text-gray-700"
              >
                Membership Type
              </label>
              <select
                id="membershipType"
                name="membershipType"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.membershipType}
                onChange={handleChange}
              >
                <option value="Associate">Associate Member</option>
                <option value="Full">Full Member</option>
                <option value="Fellow">Fellow Member</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
