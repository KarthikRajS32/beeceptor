import React, { useState } from 'react';

const Features = ({ onLoginClick, onSignUpClick, isAuthenticated = false, user = null, onLogout, isPage = false }) => {
  const [activeFilter, setActiveFilter] = useState("all");

  // Feature data with categories
  const features = [
    {
      id: 1,
      title: "Replace Dependencies With Mocks",
      description:
        "Host your API contracts on Beeceptor and unblock your teams. With Beeceptor, a mock API server is up and running in seconds – no coding required.",
      categories: ["all", "backend"],
    },
    {
      id: 2,
      title: "Start API Integration Without Delay!",
      description:
        "Don't wait for backend APIs to be developed or deployed. Connect to an API mock server and start integrating your code immediately. Reduce dependency on backend/API teams with Beeceptor.",
      categories: ["all", "frontend", "mobile"],
    },
    {
      id: 3,
      title: "Public HTTP Endpoint",
      description:
        "Get a named sub-domain and send an HTTP request. You can inspect and debug the req/res payloads, make it look pretty and share with your peers as API contracts.",
      categories: ["all", "backend", "qa"],
    },
    {
      id: 4,
      title: "Stateful CRUD APIs",
      description:
        "Define an entity path and let Beeceptor automatically set up six essential JSON REST APIs for your CRUD operations. This JSONPlaceholder alternative has a flexible schema, storage and super easy setup.",
      categories: ["all", "frontend", "backend", "mobile"],
    },
    {
      id: 5,
      title: "Partial Mocks - Mock or Forward",
      description:
        "You can wrap an existing API domain to enable proxy mode and selectively mock specific routes, ensuring seamless integration and productivity. It's like patching unavailable APIs on an existing API server, helping you integrate faster.",
      categories: ["all", "backend"],
    },
    {
      id: 6,
      title: "Bring Your OpenAPI Spec!",
      description:
        "Beeceptor takes your OpenAPI Specification to next level by hosting a mock server with just one click. You can upload the specification file to an endpoint and start serving requests.",
      categories: ["all", "backend"],
    },
    {
      id: 7,
      title: "localhost:8080 => public URL",
      description:
        "Beeceptor's local tunnel gives your APIs a secure and public URL, directing all incoming traffic to a designated localhost port. Use this to demos apps directly from localhost, and share applications over the internet.",
      categories: ["all", "backend", "mobile"],
    },
    {
      id: 8,
      title: "Webhook Integration",
      description:
        "Get a public HTTPS endpoint for webhook payload discovery. Expose your localhost services to a public URL to route third-party event payloads directly to your local development machine. Skip the deployment cycle and build faster with Beeceptor.",
      categories: ["all", "backend"],
    },
    {
      id: 9,
      title: "Dynamic Mocked Response",
      description:
        "Customize the response of your mock API by selecting the appropriate request payload and query parameters that fit your specific requirements.",
      categories: ["all", "frontend", "backend", "mobile"],
    },
    {
      id: 10,
      title: "HTTP Request Monitoring",
      description:
        "Monitor HTTP requests and responses in real time. Beeceptor acts as an HTTP logger to help you spot failed API calls and errors in payloads, with logs kept searchable for up to 10 days.",
      categories: ["all", "backend", "qa"],
    },
    {
      id: 11,
      title: "Simulate Latencies & Timeouts",
      description:
        "Simulate higher latencies by introducing delays and timeouts to the mocking rules. Helps you validate rarely reachable code paths.",
      categories: ["all", "backend", "qa"],
    },
    {
      id: 12,
      title: "No More CORS Headaches!",
      description:
        "Beeceptor supports CORS out of the box. By default, all origins are accepted, allowing you to instantly unblock frontend teams. You can also specify and grant access to particular origins for testing purposes.",
      categories: ["all", "frontend", "backend"],
    },
    {
      id: 13,
      title: "Simulate Rate Limits",
      description:
        "Configure your endpoint to mimic rate limits, setting maximum requests per second, minute, or hour. This is essential when developing queue consumers or integrating 3rd party APIs requiring retry mechanisms.",
      categories: ["all", "backend", "qa"],
    },
    {
      id: 14,
      title: "Simulate Third-Party Services",
      description:
        "Flaky third-party sandboxes and unavailable APIs can destabilize your integration suite. With Beeceptor, you can accelerate your releases by easily mocking the APIs you depend on, ensuring integration suite stability and improving overall reliability.",
      categories: ["all", "backend", "qa"],
    },
    {
      id: 15,
      title: "Free Sample JSON APIs",
      description:
        "Delve into a readily available JSON API server designed specifically for retrieving dummy data for entities such as Blog Posts, Comments, Companies, Notifications, and more.",
      categories: ["all", "frontend", "mobile", "qa"],
    },
  ];

  const filterTabs = [
    { id: "all", label: "All Use Cases" },
    { id: "frontend", label: "Frontend Devs" },
    { id: "backend", label: "Backend Devs" },
    { id: "mobile", label: "Mobile Devs" },
    { id: "qa", label: "QA Engineers" },
  ];

  const filteredFeatures = features.filter((feature) =>
    feature.categories.includes(activeFilter)
  );

  const Content = () => (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 relative z-10 ${isPage ? 'pt-34' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 leading-tight">
            Features & <span className="text-blue-600">Use Cases</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-lg max-w-4xl mx-auto">
            Discover how Beeceptor can streamline your development workflow,
            speed up API integrations and software delivery. Explore the range
            of use cases Beeceptor can solve for you below!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-lg transition-all duration-300"
            >
              <h3 className="bg-gray-200 w-full p-2 py-4 text-center text-gray-800 rounded-t-lg text-lg font-semibold mb-0">
                {feature.title}
              </h3>
              <p className="text-gray-800 p-4 py-8 text-md">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (isPage) {
    return (
      <div className="bg-gray-50">
        <main className="flex-1">
          <Content />
        </main>
      </div>
    );
  }

  return <Content />;
};


export default Features;