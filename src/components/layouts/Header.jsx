import React from 'react';
import { Button } from "../ui/button";

const Header = ({ onLoginClick, onSignUpClick }) => {
  return (
    <div className="w-full flex justify-center pt-8 absolute top-0 z-50 px-4">
      <div className="w-full max-w-6xl bg-[#030712] rounded-full px-8 py-4 flex items-center justify-between border border-gray-800/50 shadow-lg">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-white text-4xl italic font-normal tracking-wide" style={{ fontFamily: 'Kaushan Script' }}>
            Arjava
          </span>
        </div>

        {/* Navigation - Hidden on mobile, shown on md+ */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</a>
          <div className="relative group">
            <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              Features
            </button>
          </div>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</a>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onSignUpClick}
            className="text-white text-sm font-medium hover:text-gray-300 hidden sm:block"
          >
            Sign in / Sign up
          </button>
          <button 
            onClick={onLoginClick}
            className="bg-[#6366f1] hover:bg-[#5558e6] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
