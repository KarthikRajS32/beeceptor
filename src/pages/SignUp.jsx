import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import { Eye, EyeOff } from "lucide-react";

const SignUp = ({ onLoginClick, onSignUpSuccess, isAuthenticated = false, user = null, onLogout }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('beeceptor_users') || '[]');
      
      // Check if user already exists
      const userExists = existingUsers.find(user => user.email === formData.email);
      if (userExists) {
        setErrors({
          submit: "An account with this email already exists. Please sign in instead.",
        });
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed
        createdAt: new Date().toISOString(),
      };

      // Save user to localStorage
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('beeceptor_users', JSON.stringify(updatedUsers));

      console.log("Signup successful:", {
        fullName: formData.fullName,
        email: formData.email,
      });

      // Navigate to login page after successful signup
      if (onLoginClick) {
        onLoginClick();
      }
    } catch (error) {
      setErrors({
        submit: "An error occurred during signup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLoginClick={onLoginClick} onSignUpClick={() => {}} isAuthenticated={isAuthenticated} user={user} onLogout={onLogout} />

      {/* Main Signup Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-34 pb-16">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Signup Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-10 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-gray-800">
                Start mocking APIs in seconds
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-700 rounded-lg  placeholder:text-gray-500 focus:outline-none focus:border-[#7e57ffff] focus:ring-1 focus:ring-[#7e57ffff] transition-colors"
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.fullName}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-700 rounded-lg  placeholder:text-gray-500 focus:outline-none focus:border-[#7e57ffff] focus:ring-1 focus:ring-[#7e57ffff] transition-colors"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-700 rounded-lg  placeholder:text-gray-500 focus:outline-none focus:border-[#7e57ffff] focus:ring-1 focus:ring-[#7e57ffff] transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-700 rounded-lg  placeholder:text-gray-500 focus:outline-none focus:border-[#7e57ffff] focus:ring-1 focus:ring-[#7e57ffff] transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7e57ffff] hover:bg-[#6334ffff] text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-[0_0_20px_rgba(126,87,255,0.3)] hover:shadow-[0_0_30px_rgba(126,87,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-200 text-gray-900">or</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-700 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Login
                </button>
              </p>
            </div>

            {/* Terms */}
            {/* <p className="text-center text-xs text-gray-500 mt-6">
              By signing up, you agree to our{" "}
              <a href="#" className="text-gray-400 hover:text-[#7e57ffff] transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-400 hover:text-[#7e57ffff] transition-colors">
                Privacy Policy
              </a>
            </p> */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SignUp;
