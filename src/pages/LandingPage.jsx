import React from "react";
import { Button } from "../components/ui/button";
import { Zap, Globe, Eye, FileJson, Settings2, Clock, CornerDownRight } from "lucide-react";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";

const LandingPage = ({ onLoginClick, onSignUpClick, isAuthenticated = false, user = null, onAuthenticatedAction }) => {
  const handleLogin = () => {
    onLoginClick();
  };

  const handleSignUp = () => {
    onSignUpClick();
  };

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
    <div className="min-h-screen bg-[#0B0E14]">
      <Header
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Hero Section - DARK THEME */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-slate-800 relative overflow-hidden font-sans">
        {/* Background geometric shape - Centered Purple Circle */}
        <div className="absolute top-[27em] left-[45em] transform -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-indigo-900/80 rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-2 tracking-tight">
            Unfinished APIs
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold text-[#7e57ffff] mb-6 tracking-tight">
            Slowing You Down
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-2 max-w-2xl mx-auto font-light">
            Deploy mock APIs second. No downloads , no dependence,no delays
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            unlock your frontand, mobile, backend teams instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg">
            <button
              className="bg-[#7e57ffff] hover:bg-[#6334ffff] text-white px-8 py-3 rounded md:rounded-lg text-lg font-medium transition-colors w-full sm:w-auto text-nowrap"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              create mock server →
            </button>
            {/* <div className="w-full sm:w-64 h-12 bg-[#1e2330] border border-[#7e57ffff] rounded md:rounded-lg"></div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0E14] relative z-10 shadow-[0_4px_6px_1px_#0B0E14,0_2px_4px_6px_#0B0E14]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to{" "}
              <span className="text-[#7e57ffff]">Mock APIs</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-light">
              Powerful features designed to accelerate your development workflow
              and eliminate backend dependencies.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <Zap className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                Instant Endpoint
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Create mock API endpoints in seconds with custom URLs and
                responses
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <Globe className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                All HTTP Methods
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Support for GET, POST, PUT, DELETE, PATCH and more
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <Eye className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                Request Inspector
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Capture and inspect all incoming requests in real-time
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <FileJson className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                Custom JSON Responses
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Define custom JSON responses with any structure you need
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <Settings2 className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                Status Code Control
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Simulate any HTTP status code from 200 to 500
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#151b2b] border border-[#1f293a] hover:border-[#7e57ffff]/50 p-8 rounded-2xl transition-all duration-300 group">
              <Clock className="w-10 h-10 text-[#7e57ffff] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-xl font-bold mb-3 group-hover:text-[#7e57ffff] transition-colors">
                Response Delay
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Add custom delays to simulate slow network conditions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start Mocking Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0E14] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & Steps */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Start Mocking in{" "}
              <span className="text-[#7e57ffff]">Under 30 Seconds</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 font-light">
              Choose a subdomain name and start sending requests. Beeceptor
              captures everything and lets you define custom responses on the
              fly.
            </p>

            <div className="space-y-8 mb-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-500 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Create an endpoint
                  </h3>
                  <p className="text-gray-400 font-light text-sm">
                    Choose a unique subdomain for your mock server
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-500 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Define mock rules
                  </h3>
                  <p className="text-gray-400 font-light text-sm">
                    Set up response templates with custom JSON data
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <CornerDownRight className="w-6 h-6 text-green-500 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Start integrating
                  </h3>
                  <p className="text-gray-400 font-light text-sm">
                    Use the endpoint in your app and iterate fast
                  </p>
                </div>
              </div>
            </div>

            <button
              className="bg-[#7e57ffff] hover:bg-[#6334ffff] text-white px-8 py-3 rounded md:rounded-lg text-lg font-medium transition-colors cursor-pointer"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              Try It Free →
            </button>
          </div>

          {/* Right Column: Code Terminal */}
          <div className="bg-[#151b2b] rounded-3xl p-8 border border-[#1f293a] shadow-2xl overflow-hidden relative">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            Ready to Accelerate Your
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-[#7e57ffff] mb-6 tracking-tight">
            Development?
          </h2>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of developers who ship faster with Beeceptor. Start
            mocking APIs in seconds — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              className="bg-[#7e57ffff] hover:bg-[#6334ffff] text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-[0_0_20px_rgba(126,87,255,0.3)] hover:shadow-[0_0_30px_rgba(126,87,255,0.5)] w-full sm:w-auto"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              Get Started for free
            </button>
            <button 
              className="bg-transparent border border-[#7e57ffff]/50 hover:border-[#7e57ffff] text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all hover:bg-[#7e57ffff]/10 w-full sm:w-auto"
              onClick={() => handleAuthenticatedClick(() => {})}
            >
              View Document
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 pt-8 border-t border-gray-800/50">
            <div className="flex items-center gap-2">
              <span className="text-[#7e57ffff] text-2xl font-bold">10M+</span>
              <span className="text-gray-400 text-sm">Requests Mocked</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-[#7e57ffff] text-2xl font-bold">50k+</span>
              <span className="text-gray-400 text-sm">Developers</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-[#7e57ffff] text-2xl font-bold">4.8</span>
              <span className="text-gray-400 text-sm">On</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;