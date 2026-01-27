import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Zap,
  Globe,
  Eye,
  FileJson,
  Settings2,
  Clock,
  CornerDownRight,
  Check,
} from "lucide-react";
import Features from "./Features";

const LandingPage = ({
  onLoginClick,
  onSignUpClick,
  isAuthenticated = false,
  user = null,
  onAuthenticatedAction,
  onLogout,
}) => {
  // Centralized handler for protected actions
  const handleAuthenticatedClick = (action) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      onLoginClick();
    } else {
      // Execute the action if authenticated
      if (onAuthenticatedAction) {
        onAuthenticatedAction(action);
      }
    }
  };

  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center pt-8 pb-16">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 leading-tight">
            Mock APIs in seconds,
            <span className="text-blue-600"> ship faster</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create mock API endpoints instantly. No setup, no downloads, no delays. 
            Perfect for frontend development and testing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              Create Mock Server
            </button>
            <Link
              to="/docs"
              className="text-gray-600 hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 hover:border-gray-400 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Features & Use Cases Section */}
      <Features />

      {/* Features Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 leading-tight">
              Everything You Need to{" "}
              <span className="text-blue-600">Mock APIs</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto font-light">
              Powerful features designed to accelerate your development workflow
              and eliminate backend dependencies.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <Zap className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Instant Endpoint
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Create mock API endpoints in seconds with custom URLs and
                responses
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <Globe className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                All HTTP Methods
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Support for GET, POST, PUT, DELETE, PATCH and more
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <Eye className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Request Inspector
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Capture and inspect all incoming requests in real-time
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <FileJson className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Custom JSON Responses
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Define custom JSON responses with any structure you need
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <Settings2 className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Status Code Control
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Simulate any HTTP status code from 200 to 500
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-8 rounded-lg transition-all duration-300 group">
              <Clock className="w-10 h-10 text-blue-600 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Response Delay
              </h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Add custom delays to simulate slow network conditions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start Mocking Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & Steps */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 leading-tight">
              Start Mocking in{" "}
              <span className="text-blue-600">Under 30 Seconds</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 font-light">
              Choose a subdomain name and start sending requests. Beeceptor
              captures everything and lets you define custom responses on the
              fly.
            </p>

            <div className="space-y-8 mb-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                <div>
                  <h3 className="text-gray-900 text-xl font-bold mb-1">
                    Create an endpoint
                  </h3>
                  <p className="text-gray-600 font-light text-sm">
                    Choose a unique subdomain for your mock server
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                <div>
                  <h3 className="text-gray-900 text-xl font-bold mb-1">
                    Define mock rules
                  </h3>
                  <p className="text-gray-600 font-light text-sm">
                    Set up response templates with custom JSON data
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                <div>
                  <h3 className="text-gray-900 text-xl font-bold mb-1">
                    Start integrating
                  </h3>
                  <p className="text-gray-600 font-light text-sm">
                    Use the endpoint in your app and iterate fast
                  </p>
                </div>
              </div>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors cursor-pointer shadow-sm"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              Try It Free →
            </button>
          </div>

          {/* Right Column: Code Terminal */}
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-200 shadow-lg overflow-hidden relative">
            <div className="font-mono text-sm leading-relaxed">
              <span className="text-gray-500">{"{"}</span>
              <br />
              <span className="text-blue-400 pl-4">"status"</span>:{" "}
              <span className="text-green-400">"success"</span>,<br />
              <span className="text-blue-400 pl-4">"data"</span>:{" "}
              <span className="text-gray-500">{"{"}</span>
              <br />
              <span className="text-blue-400 pl-8">"users"</span>: [<br />
              <span className="text-gray-500 pl-12">{"{"}</span>
              <br />
              <span className="text-blue-400 pl-16">"id"</span>:{" "}
              <span className="text-orange-400">1</span>,<br />
              <span className="text-blue-400 pl-16">"name"</span>:{" "}
              <span className="text-green-400">"John Doe"</span>,<br />
              <span className="text-blue-400 pl-16">"email"</span>:{" "}
              <span className="text-green-400">"john@example.com"</span>,<br />
              <span className="text-blue-400 pl-16">"role"</span>:{" "}
              <span className="text-green-400">"admin"</span>
              <br />
              <span className="text-gray-500 pl-12">{"}"}</span>,<br />
              <span className="text-gray-500 pl-12">{"{"}</span>
              <br />
              <span className="text-blue-400 pl-16">"id"</span>:{" "}
              <span className="text-orange-400">2</span>,<br />
              <span className="text-blue-400 pl-16">"name"</span>:{" "}
              <span className="text-green-400">"Jane Smith"</span>,<br />
              <span className="text-blue-400 pl-16">"email"</span>:{" "}
              <span className="text-green-400">"jane@example.com"</span>,<br />
              <span className="text-blue-400 pl-16">"role"</span>:{" "}
              <span className="text-green-400">"user"</span>
              <br />
              <span className="text-gray-500 pl-12">{"}"}</span>
              <br />
              <span className="text-gray-500 pl-8">]</span>
              <br />
              <span className="text-gray-500 pl-4">{"}"}</span>,<br />
              <span className="text-blue-400 pl-4">"timestamp"</span>:{" "}
              <span className="text-green-400">"2024-01-15T10:30:00Z"</span>
              <br />
              <span className="text-gray-500">{"}"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ready to accelerate section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2 tracking-tight">
            Ready to Accelerate Your
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-blue-600 mb-6 tracking-tight">
            Development?
          </h2>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of developers who ship faster with Beeceptor. Start
            mocking APIs in seconds — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              Get Started for free
            </button>
            <button
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-lg text-lg font-medium transition-all w-full sm:w-auto"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              View Document
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-2xl font-bold">10M+</span>
              <span className="text-gray-600 text-sm">Requests Mocked</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-2xl font-bold">50k+</span>
              <span className="text-gray-600 text-sm">Developers</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-2xl font-bold">4.8</span>
              <span className="text-gray-600 text-sm">On</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
