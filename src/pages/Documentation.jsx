import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layouts/Header';

const Documentation = ({ onLoginClick, onSignUpClick, isAuthenticated = false, user = null, onLogout }) => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-api-mocking', title: 'What is API Mocking?' },
    { id: 'projects', title: 'Projects' },
    { id: 'creating-an-api', title: 'Creating an API' },
    { id: 'endpoints', title: 'Endpoints' },
    { id: 'http-methods', title: 'HTTP Methods' },
    { id: 'query-parameters', title: 'Query Parameters' },
    { id: 'headers', title: 'Headers' },
    { id: 'request-body', title: 'Request Body' },
    { id: 'response-configuration', title: 'Response Configuration' },
    { id: 'status-codes', title: 'Status Codes' },
    { id: 'api-testing', title: 'API Testing' },
    { id: 'authentication-simulation', title: 'Authentication Simulation' },
    { id: 'cors-handling', title: 'CORS Handling' },
    { id: 'best-practices', title: 'Best Practices' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onLoginClick={onLoginClick}
        onSignUpClick={onSignUpClick}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <div className="prose prose-gray max-w-none">
              
              {/* Introduction */}
              <section id="introduction" className="mb-16">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6 leading-tight">API Mocking Documentation</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Learn how to create, configure, and test mock APIs for your development workflow.
                </p>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 leading-relaxed">
                    This documentation will guide you through creating mock APIs that simulate real backend services. 
                    Mock APIs are essential for frontend development, testing, and prototyping when the actual backend 
                    is not yet available or accessible.
                  </p>
                </div>
              </section>

              {/* What is API Mocking */}
              <section id="what-is-api-mocking" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">What is API Mocking?</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    API mocking is the practice of creating fake API endpoints that return predefined responses. 
                    This allows developers to work independently of backend services during development and testing.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Why use API mocking?</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Develop frontend applications before backend APIs are ready</li>
                    <li>Test different response scenarios and edge cases</li>
                    <li>Simulate slow network conditions or server errors</li>
                    <li>Work offline or in environments without backend access</li>
                  </ul>
                </div>
              </section>

              {/* Projects */}
              <section id="projects" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Projects</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Projects help you organize your mock APIs. Each project can contain multiple API endpoints 
                    related to a specific application or service.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Example Project Structure:</h4>
                    <pre className="text-sm text-gray-700">
{`E-commerce API Project
├── GET /api/products
├── POST /api/products
├── GET /api/users/{id}
└── POST /api/orders`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Creating an API */}
              <section id="creating-an-api" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Creating an API</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    To create a mock API, you need to define the endpoint path, HTTP method, and response data.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic API Configuration:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-gray-700">
{`API Name: Get User Profile
Endpoint: /api/users/123
Method: GET
Status Code: 200
Response:
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer"
}`}
                    </pre>
                  </div>
                  <p className="text-gray-700">
                    Once created, your API will be accessible at: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://your-domain.com/api/users/123</code>
                  </p>
                </div>
              </section>

              {/* Endpoints */}
              <section id="endpoints" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Endpoints</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Endpoints define the URL paths where your mock APIs are accessible. They should follow RESTful conventions.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Endpoint Examples:</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm text-gray-700">/api/users</code>
                      <span className="text-gray-500 ml-2">- Get all users</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm text-gray-700">/api/users/&#123;id&#125;</code>
                      <span className="text-gray-500 ml-2">- Get specific user</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm text-gray-700">/api/products?category=electronics</code>
                      <span className="text-gray-500 ml-2">- Get products by category</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* HTTP Methods */}
              <section id="http-methods" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">HTTP Methods</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    HTTP methods define the type of operation your API endpoint performs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">GET</h4>
                      <p className="text-green-700 text-sm">Retrieve data from the server</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">POST</h4>
                      <p className="text-blue-700 text-sm">Create new data on the server</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">PUT</h4>
                      <p className="text-yellow-700 text-sm">Update existing data</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">DELETE</h4>
                      <p className="text-red-700 text-sm">Remove data from the server</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Query Parameters */}
              <section id="query-parameters" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Query Parameters</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Query parameters are key-value pairs added to the URL after a question mark (?). 
                    They allow clients to pass additional data to your API endpoints.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">URL Structure:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <code className="text-sm text-gray-700">
                      https://api.example.com/products?category=electronics&limit=10&sort=price
                    </code>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Use Cases:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                    <li><strong>Filtering:</strong> <code>?category=books&author=smith</code></li>
                    <li><strong>Pagination:</strong> <code>?page=2&limit=20</code></li>
                    <li><strong>Sorting:</strong> <code>?sort=name&order=asc</code></li>
                    <li><strong>Search:</strong> <code>?q=javascript&type=tutorial</code></li>
                  </ul>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2">Example Response Based on Query Params:</h4>
                    <pre className="text-sm text-indigo-700">
{`GET /api/products?category=electronics&limit=2

{
  "products": [
    {"id": 1, "name": "Laptop", "category": "electronics"},
    {"id": 2, "name": "Phone", "category": "electronics"}
  ],
  "total": 50,
  "limit": 2,
  "category": "electronics"
}`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Headers */}
              <section id="headers" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Headers</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    HTTP headers provide additional information about the request or response. 
                    They are crucial for authentication, content type specification, and API behavior control.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Request Headers:</h4>
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm font-medium text-gray-900">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</code>
                      <p className="text-gray-600 text-sm mt-1">Used for API authentication</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm font-medium text-gray-900">Content-Type: application/json</code>
                      <p className="text-gray-600 text-sm mt-1">Specifies the request body format</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm font-medium text-gray-900">X-API-Key: abc123def456</code>
                      <p className="text-gray-600 text-sm mt-1">Custom API key for authentication</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Why Headers Matter:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Authenticate requests and verify user permissions</li>
                    <li>Specify data formats (JSON, XML, etc.)</li>
                    <li>Control caching and response behavior</li>
                    <li>Pass metadata without affecting the URL</li>
                  </ul>
                </div>
              </section>

              {/* Request Body */}
              <section id="request-body" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Request Body</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    The request body contains data sent to the server, typically used with POST, PUT, and PATCH methods.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">JSON Request Body Example:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-gray-700">
{`POST /api/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "admin",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}`}
                    </pre>
                  </div>
                  <p className="text-gray-700">
                    Your mock API can validate and respond based on the request body content, 
                    simulating real backend validation and processing.
                  </p>
                </div>
              </section>

              {/* Response Configuration */}
              <section id="response-configuration" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Response Configuration</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Configure your mock API responses to simulate different scenarios and data structures.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Response Components:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-1">Status Code</h5>
                      <p className="text-blue-700 text-sm">200, 404, 500, etc.</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-1">Headers</h5>
                      <p className="text-green-700 text-sm">Content-Type, CORS, etc.</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-1">Body</h5>
                      <p className="text-purple-700 text-sm">JSON, XML, or plain text</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Complete Response Example:</h4>
                    <pre className="text-sm text-gray-700">
{`HTTP/1.1 200 OK
Content-Type: application/json
X-Total-Count: 150

{
  "success": true,
  "data": {
    "users": [
      {"id": 1, "name": "John"},
      {"id": 2, "name": "Jane"}
    ]
  },
  "pagination": {
    "page": 1,
    "total": 150
  }
}`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Status Codes */}
              <section id="status-codes" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Status Codes</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    HTTP status codes indicate the result of the API request. Use appropriate codes to simulate real API behavior.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3">Success Codes</h4>
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <code className="font-medium text-green-800">200 OK</code>
                          <p className="text-green-700 text-sm">Request successful</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <code className="font-medium text-green-800">201 Created</code>
                          <p className="text-green-700 text-sm">Resource created</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-3">Error Codes</h4>
                      <div className="space-y-2">
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <code className="font-medium text-red-800">400 Bad Request</code>
                          <p className="text-red-700 text-sm">Invalid request data</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <code className="font-medium text-red-800">404 Not Found</code>
                          <p className="text-red-700 text-sm">Resource not found</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <code className="font-medium text-red-800">500 Server Error</code>
                          <p className="text-red-700 text-sm">Internal server error</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* API Testing */}
              <section id="api-testing" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">API Testing</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Test your mock APIs directly in the browser or use tools like curl, Postman, or your application code.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Testing Methods:</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Browser Testing:</h5>
                      <code className="text-sm text-gray-700">https://your-domain.com/api/users</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">cURL Command:</h5>
                      <pre className="text-sm text-gray-700">
{`curl -X GET "https://your-domain.com/api/users" \\
     -H "Authorization: Bearer token123" \\
     -H "Content-Type: application/json"`}
                      </pre>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">JavaScript Fetch:</h5>
                      <pre className="text-sm text-gray-700">
{`fetch('https://your-domain.com/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authentication Simulation */}
              <section id="authentication-simulation" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Authentication Simulation</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Simulate different authentication scenarios to test how your application handles various auth states.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Authentication Types:</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Bearer Token</h5>
                      <code className="text-sm text-blue-700">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</code>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">API Key</h5>
                      <code className="text-sm text-green-700">X-API-Key: abc123def456ghi789</code>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-2">Basic Auth</h5>
                      <code className="text-sm text-purple-700">Authorization: Basic dXNlcjpwYXNz</code>
                    </div>
                  </div>
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Simulate Auth Errors:</h5>
                    <p className="text-yellow-700 text-sm">
                      Return 401 Unauthorized or 403 Forbidden responses to test error handling in your application.
                    </p>
                  </div>
                </div>
              </section>

              {/* CORS Handling */}
              <section id="cors-handling" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">CORS Handling</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-700 mb-4">
                    Cross-Origin Resource Sharing (CORS) allows your web applications to make requests to your mock APIs from different domains.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">CORS Headers:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-gray-700">
{`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400`}
                    </pre>
                  </div>
                  <p className="text-gray-700">
                    Mock APIs automatically include CORS headers to ensure your frontend applications can access them 
                    during development, regardless of the domain they're served from.
                  </p>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="mb-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">Best Practices</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1. Use Realistic Data</h4>
                      <p className="text-gray-700">Create mock responses that closely match your actual API data structure and content.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">2. Follow RESTful Conventions</h4>
                      <p className="text-gray-700">Use standard HTTP methods and URL patterns that match REST API conventions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">3. Test Error Scenarios</h4>
                      <p className="text-gray-700">Create mock endpoints that return error responses to test your error handling code.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">4. Organize by Projects</h4>
                      <p className="text-gray-700">Group related APIs into projects to keep your mock endpoints organized and manageable.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">5. Document Your APIs</h4>
                      <p className="text-gray-700">Keep track of your mock API endpoints and their expected behavior for team collaboration.</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h4 className="font-semibold text-indigo-800 mb-3">Ready to Get Started?</h4>
                    <p className="text-indigo-700 mb-4">
                      Create your first project and start building mock APIs for your development workflow.
                    </p>
                    <Link 
                      to="/signup" 
                      className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Get Started Now
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;