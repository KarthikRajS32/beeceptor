import React, { useState } from "react";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import { Eye, EyeOff } from "lucide-react";

const Login = ({ onSignUpClick, onLoginSuccess, isAuthenticated = false, user = null, onLogout }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

      // Get users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('beeceptor_users') || '[]');
      
      // Find user with matching email and password
      const user = existingUsers.find(u => 
        u.email === formData.email && u.password === formData.password
      );

      if (!user) {
        setErrors({
          submit: "Invalid email or password. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Create user data for session
      const userData = {
        id: user.id,
        email: user.email,
        name: user.fullName,
      };

      console.log("Login successful:", userData);

      // Call success callback with user data
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      setErrors({
        submit: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLoginClick={() => {}} onSignUpClick={onSignUpClick} isAuthenticated={isAuthenticated} user={user} onLogout={onLogout} />

      {/* Main Login Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-34 pb-16">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-10 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-gray-700 ">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-700 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#7e57ffff] focus:ring-1 focus:ring-[#7e57ffff] transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900  transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-200 text-gray-800">or</span>
              </div>
            </div>

            {/* Social Login Options */}
            {/* <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0B0E14] border border-gray-700 hover:border-gray-600 rounded-lg text-white transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0B0E14] border border-gray-700 hover:border-gray-600 rounded-lg text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">Continue with GitHub</span>
              </button>
            </div> */}

            {/* Signup Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSignUpClick}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
