import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../ui/button";
import { ChevronDown, User, LogOut, Mail, Settings } from "lucide-react";
import { Link } from 'react-router-dom';

const Header = ({ onLoginClick, onSignUpClick, isAuthenticated = false, user = null, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        // Don't close logout confirmation when clicking outside
        if (!showLogoutConfirm) {
          setShowLogoutConfirm(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutConfirm]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setShowLogoutConfirm(false); // Reset confirmation state whenever dropdown is toggled
  };

  return (
    <div className="w-full flex justify-center pt-8 fixed top-0 z-50 px-4 pointer-events-none">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 flex items-center justify-between border border-gray-200 shadow-sm relative pointer-events-auto">
        {/* Logo */}
        <div className="flex items-center">
          <span
            className="text-gray-900 text-4xl italic font-normal tracking-wide"
            style={{ fontFamily: "Kaushan Script" }}
          >
            Arjava
          </span>
        </div>

        {/* Navigation - Hidden on mobile, shown on md+ */}
        {!isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-900  transition-colors text-sm font-medium"
            >
              Home
            </Link>

            <div className="relative group">
              <Link to="/features" className="text-gray-900 transition-colors text-sm font-medium flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
                Features
              </Link>
            </div>
            <Link
              to="/pricing"
              className="text-gray-900 transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <a
              href="#"
              className="text-gray-900 transition-colors text-sm font-medium"
            >
              Docs
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className="text-gray-900 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <div className="relative group">
              <Link to="/features" className="text-gray-900 transition-colors text-sm font-medium flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
                Features
              </Link>
            </div>
            <Link
              to="/pricing"
              className="text-gray-900 transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <a
              href="#"
              className="text-gray-900 transition-colors text-sm font-medium"
            >
              Docs
            </a>
          </nav>
        )}

        {/* Auth Actions / User Profile */}
        <div className="flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <button
                onClick={onSignUpClick}
                className="text-gray-900 text-sm font-medium hover:text-gray-900 hidden sm:block"
              >
                Sign up
              </button>
              <button
                onClick={onLoginClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                log in
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 bg-white hover:bg-gray-50 py-2 px-4 rounded-full border border-gray-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                </div>
                <span className="text-gray-900 text-sm font-medium hidden sm:block">
                  {user?.name || "User"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <p className="text-gray-900 font-semibold text-base">
                        {user?.name || "User"}
                      </p>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                        <Mail size={12} />
                        <span>{user?.email || "user@example.com"}</span>
                      </div>
                    </div>

                    <div className="h-px bg-gray-200 w-full" />

                    <Link
                      to="/edit-account"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors w-full py-2 group"
                    >
                      <Settings
                        size={18}
                        className="group-hover:rotate-90 transition-transform duration-300"
                      />
                      <span className="font-medium">Edit Account</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors w-full py-2 group"
                    >
                      <LogOut
                        size={18}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Centered Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white border border-gray-200 rounded-lg p-8 max-w-sm w-full shadow-lg animate-in zoom-in-95 fade-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <LogOut className="text-red-600 w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Are you sure you want to log out!
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Logout confirmed clicked");
                    setShowLogoutConfirm(false);
                    if (onLogout) {
                      console.log("Executing onLogout prop");
                      onLogout();
                    } else {
                      console.error("onLogout prop is missing in Header");
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-95 shadow-sm"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
