import React, { useState, useEffect } from "react";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import { FolderOpen, Plus, Edit2, Trash2, ArrowLeft, Calendar, Activity, Copy, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState("projects"); // 'projects' | 'project-details'
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateEndpointModal, setShowCreateEndpointModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newEndpointName, setNewEndpointName] = useState("/");
  const [newEndpointMethod, setNewEndpointMethod] = useState("GET");
  const [newEndpointDelay, setNewEndpointDelay] = useState("");
  const [newEndpointStatus, setNewEndpointStatus] = useState("200");
  const [newEndpointHeaders, setNewEndpointHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [newEndpointBody, setNewEndpointBody] = useState('{\n  "status": "Awesome!"\n}');
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newMatchType, setNewMatchType] = useState("path_exact"); // Updated default
  const [newResponseMode, setNewResponseMode] = useState("single"); // 'single' | 'weighted'
  const [newIsFile, setNewIsFile] = useState(false);
  const [stateConditions, setStateConditions] = useState([]);
  const [requestConditions, setRequestConditions] = useState([]);
  const [newParamName, setNewParamName] = useState("");
  const [newParamOperator, setNewParamOperator] = useState("equals");
  const [newParamValue, setNewParamValue] = useState("");
  const [newHeaderName, setNewHeaderName] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showDynamicValueDropdown, setShowDynamicValueDropdown] = useState(false);
  const [weightedResponses, setWeightedResponses] = useState([{ weight: 100, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' }]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [showRequestLogs, setShowRequestLogs] = useState(false);
  
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState("card"); // 'card' | 'table'
  const [editingProject, setEditingProject] = useState(null);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [copiedProjectUrl, setCopiedProjectUrl] = useState(null);
  const navigate = useNavigate();

  // Redundant handles in component, App.jsx now handles protection via ProtectedRoute

  // Load data from localStorage or use default mock data
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('beeceptor_projects');
    return saved ? JSON.parse(saved) : [
      {
        id: "proj_1",
        name: "project-alpha",
        url: "https://project-alpha.arjava.com",
        createdDate: "2024-01-15",
        endpointCount: 5,
        userId: user?.id,
      },
    ];
  });

  const [endpoints, setEndpoints] = useState(() => {
    const saved = localStorage.getItem('beeceptor_endpoints');
    return saved ? JSON.parse(saved) : [
      {
        id: "ep_1",
        name: "/api/users",
        projectId: "proj_1",
        createdDate: "2024-01-16",
        requestCount: 1234,
        method: "GET",
      }
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('beeceptor_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(endpoints));
  }, [endpoints]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setCurrentView("project-details");
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setCurrentView("projects");
  };

  const handleDeleteProject = (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setProjects(projects.filter((p) => p.id !== projectId));
    setEndpoints(endpoints.filter((e) => e.projectId !== projectId));
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setShowCreateProjectModal(true);
  };

  const handleEditEndpoint = (endpoint) => {
    setEditingEndpoint(endpoint);
    setNewEndpointName(endpoint.name);
    setNewEndpointMethod(endpoint.method);
    setNewEndpointDelay(endpoint.delay || "");
    setNewEndpointStatus(endpoint.status || "200");
    setNewEndpointHeaders(endpoint.headers || '{\n  "Content-Type": "application/json"\n}');
    setNewEndpointBody(endpoint.body || "");
    setNewRuleDescription(endpoint.description || "");
    setNewMatchType(endpoint.matchType || "path_exact");
    setNewResponseMode(endpoint.responseMode || "single");
    setNewIsFile(endpoint.isFile || false);
    setStateConditions(endpoint.stateConditions || []);
    setRequestConditions(endpoint.requestConditions || []);
    setNewParamName(endpoint.paramName || "");
    setNewParamOperator(endpoint.paramOperator || "equals");
    setNewParamValue(endpoint.paramValue || "");
    setNewHeaderName(endpoint.headerName || "");
    setNewHeaderValue(endpoint.headerValue || "");
    setShowCreateEndpointModal(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    if (editingProject) {
      // Update existing project
      const updatedProject = {
        ...editingProject,
        name: newProjectName,
        url: generateProjectUrl(newProjectName)
      };
      setProjects(projects.map(p => 
        p.id === editingProject.id ? updatedProject : p
      ));
      setEditingProject(null);
    } else {
      // Create new project
      const newProject = {
        id: `proj_${Date.now()}`,
        name: newProjectName,
        url: generateProjectUrl(newProjectName),
        createdDate: new Date().toISOString().split("T")[0],
        endpointCount: 0,
        userId: user?.id,
      };
      setProjects([...projects, newProject]);
    }
    
    setNewProjectName("");
    setShowCreateProjectModal(false);
  };

  const handleCreateEndpoint = async () => {
    if (!newEndpointName.trim() || !selectedProject) return;

    try {
      if (editingEndpoint) {
        // Send updated endpoint to backend server
        const response = await fetch('http://localhost:3001/api/endpoints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectName: selectedProject.name,
            method: newEndpointMethod,
            path: newEndpointName,
            delay: newEndpointDelay,
            status: newEndpointStatus,
            headers: newEndpointHeaders,
            body: newEndpointBody,
            description: newRuleDescription,
            matchType: newMatchType,
            responseMode: newResponseMode,
            isFile: newIsFile,
            stateConditions: stateConditions,
            requestConditions: requestConditions,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update endpoint');
        }

        // Update existing endpoint in frontend
        const updatedEndpoint = {
          ...editingEndpoint,
          name: newEndpointName,
          method: newEndpointMethod,
          delay: newEndpointDelay,
          status: newEndpointStatus,
          headers: newEndpointHeaders,
          body: newEndpointBody,
          description: newRuleDescription,
          matchType: newMatchType,
          responseMode: newResponseMode,
          isFile: newIsFile,
          stateConditions: stateConditions,
          requestConditions: requestConditions,
        };
        setEndpoints(endpoints.map(e => 
          e.id === editingEndpoint.id ? updatedEndpoint : e
        ));
        setEditingEndpoint(null);
      } else {
        // Send endpoint to backend server
        const response = await fetch('http://localhost:3001/api/endpoints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectName: selectedProject.name,
            method: newEndpointMethod,
            path: newEndpointName,
            delay: newEndpointDelay,
            status: newEndpointStatus,
            headers: newEndpointHeaders,
            body: newEndpointBody,
            description: newRuleDescription,
            matchType: newMatchType,
            responseMode: newResponseMode,
            isFile: newIsFile,
            stateConditions: stateConditions,
            requestConditions: requestConditions,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create endpoint');
        }

        // Create new endpoint for frontend display
        const newEndpoint = {
          id: `ep_${Date.now()}`,
          name: newEndpointName,
          projectId: selectedProject.id,
          createdDate: new Date().toISOString().split("T")[0],
          requestCount: 0,
          method: newEndpointMethod,
          delay: newEndpointDelay,
          status: newEndpointStatus,
          headers: newEndpointHeaders,
          body: newEndpointBody,
          description: newRuleDescription,
          matchType: newMatchType,
          responseMode: newResponseMode,
          isFile: newIsFile,
          stateConditions: stateConditions,
          requestConditions: requestConditions,
        };

        setEndpoints([...endpoints, newEndpoint]);
        
        // Update project endpoint count
        setProjects(
          projects.map((p) =>
            p.id === selectedProject.id
              ? { ...p, endpointCount: p.endpointCount + 1 }
              : p
          )
        );
      }

      // Reset form
      setNewEndpointName("/");
      setNewEndpointMethod("GET");
      setNewEndpointDelay("");
      setNewEndpointStatus("200");
      setNewEndpointHeaders('{\n  "Content-Type": "application/json"\n}');
      setNewEndpointBody('{\n  "status": "Awesome!"\n}');
      setNewRuleDescription("");
      setNewMatchType("path_exact");
      setNewResponseMode("single");
      setNewIsFile(false);
      setStateConditions([]);
      setRequestConditions([]);
      setNewParamName("");
      setNewParamOperator("equals");
      setNewParamValue("");
      setNewHeaderName("");
      setNewHeaderValue("");
      setWeightedResponses([{ weight: 50, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '' }]);
      setShowCreateEndpointModal(false);
    } catch (error) {
      console.error('Error creating endpoint:', error);
      alert('Failed to create endpoint. Make sure the server is running.');
    }
  };

  const handleDeleteEndpoint = (endpointId) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    setEndpoints(endpoints.filter((e) => e.id !== endpointId));
    
    // Update project endpoint count
    if (selectedProject) {
      setProjects(
        projects.map((p) =>
          p.id === selectedProject.id
            ? { ...p, endpointCount: Math.max(0, p.endpointCount - 1) }
            : p
        )
      );
    }
  };



  // Content-Type presets
  const contentTypePresets = [
    {
      label: "JSON (application/json)",
      value: '{\n  "Content-Type": "application/json;charset=utf-8"\n}',
    },
    {
      label: "XML (application/xml)",
      value: '{\n  "Content-Type": "application/xml;charset=utf-8"\n}',
    },
    {
      label: "HTML (text/html)",
      value: '{\n  "Content-Type": "text/html;charset=utf-8"\n}',
    },
    {
      label: "JavaScript (text/javascript)",
      value: '{\n  "Content-Type": "text/javascript;charset=utf-8"\n}',
    },
    {
      label: "CSV (text/csv)",
      value: '{\n  "Content-Type": "text/csv;charset=utf-8"\n}',
    },
    {
      label: "Plain Text (text/plain)",
      value: '{\n  "Content-Type": "text/plain"\n}',
    },
  ];

  // Dynamic value options
  const dynamicValues = [
    { label: 'Current Timestamp', value: '{{timestamp}}' },
    { label: 'Random UUID', value: '{{uuid}}' },
    { label: 'Random Number', value: '{{randomNumber}}' },
    { label: 'Current Date', value: '{{currentDate}}' },
    { label: 'Request IP', value: '{{requestIP}}' },
    { label: 'Faker: Name', value: '{{faker.name.firstName}}' },
    { label: 'Faker: Email', value: '{{faker.internet.email}}' },
    { label: 'Step Counter: Increment', value: "{{step-counter 'inc' 'counterName' 1}}" },
    { label: 'Step Counter: Get', value: "{{step-counter 'get' 'counterName'}}" },
    { label: 'Step Counter: Set', value: "{{step-counter 'set' 'counterName' 0}}" },
    { label: 'Data Store: Set', value: "{{data-store 'set' 'key' 'value'}}" },
    { label: 'Data Store: Get', value: "{{data-store 'get' 'key'}}" },
  ];

  const insertDynamicValue = (value) => {
    setNewEndpointBody(prev => prev + value);
    setShowDynamicValueDropdown(false);
  };

  const addWeightedResponse = () => {
    setWeightedResponses([...weightedResponses, { weight: 0, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' }]);
  };

  const removeWeightedResponse = (index) => {
    if (weightedResponses.length > 1) {
      setWeightedResponses(weightedResponses.filter((_, i) => i !== index));
    }
  };

  const updateWeightedResponse = (index, field, value) => {
    const updated = [...weightedResponses];
    updated[index][field] = value;
    setWeightedResponses(updated);
  };

  // Dynamic field configuration based on match type
  const getFieldConfig = (matchType) => {
    switch (matchType) {
      case 'path_exact':
        return { type: 'single', label: 'Match Value / Expression', placeholder: 'e.g: /api/path' };
      case 'path_starts':
        return { type: 'single', label: 'Match Value / Expression', placeholder: '/api' };
      case 'path_contains':
        return { type: 'single', label: 'Match Value / Expression', placeholder: 'users' };
      case 'path_template':
        return { type: 'single', label: 'Path Pattern', placeholder: '/users/{id}' };
      case 'path_regex':
        return { type: 'single', label: 'Match Value / Expression', placeholder: '^/api/users/[0-9]+$' };
      case 'body_contains':
        return { type: 'single', label: 'Match Value / Expression', placeholder: 'search text' };
      case 'body_param':
        return { type: 'triple', labels: ['Parameter Name', 'Operator', 'Parameter Value'] };
      case 'body_regex':
        return { type: 'single', label: 'Match Value / Expression', placeholder: '"email":\\s*"[^"]+@[^"]+"' };
      case 'header_regex':
        return { type: 'double', labels: ['HTTP Header Name', 'Match Header Value'] };
      default:
        return { type: 'single', label: 'Match Value / Expression', placeholder: '/api/resource' };
    }
  };

  // State condition type configurations
  const getStateConditionOptions = (type) => {
    switch (type) {
      case 'Data Store':
        return [
          { value: 'equals', label: 'equals' },
          { value: 'not_equals', label: 'not equals' },
          { value: 'contains', label: 'contains' },
          { value: 'exists', label: 'exists' },
          { value: 'not_exists', label: 'not exists' }
        ];
      case 'List':
        return [
          { value: 'contains', label: 'contains' },
          { value: 'not_contains', label: 'not contains' },
          { value: 'length_equals', label: 'length equals' },
          { value: 'length_greater', label: 'length greater than' },
          { value: 'length_less', label: 'length less than' }
        ];
      case 'Counter':
        return [
          { value: 'equals', label: 'equals' },
          { value: 'not_equals', label: 'not equals' },
          { value: 'greater_than', label: 'greater than' },
          { value: 'less_than', label: 'less than' },
          { value: 'greater_equal', label: 'greater than or equal' },
          { value: 'less_equal', label: 'less than or equal' }
        ];
      default:
        return [];
    }
  };

  const getConditionPlaceholder = (matchType) => {
    switch (matchType) {
      case 'path_exact':
        return 'e.g: /api/path';
      case 'path_starts':
        return '/api';
      case 'path_contains':
        return 'users';
      case 'path_template':
        return '/users/{id}';
      case 'path_regex':
        return '^/api/users/[0-9]+$';
      case 'body_contains':
        return 'search text';
      case 'body_regex':
        return '"email":\\s*"[^"]+@[^"]+"';
      default:
        return '/api/resource';
    }
  };

  const fieldConfig = getFieldConfig(newMatchType);

  // Handle match type change - reset input values like Beeceptor
  const handleMatchTypeChange = (newType) => {
    setNewMatchType(newType);
    const config = getFieldConfig(newType);
    
    if (config.type === 'single') {
      setNewEndpointName(''); // Clear the field, don't set placeholder as value
    } else if (config.type === 'triple') {
      setNewParamName('');
      setNewParamOperator('equals');
      setNewParamValue('');
    } else if (config.type === 'double') {
      setNewHeaderName('');
      setNewHeaderValue('');
    }
  };

  const generateProjectUrl = (projectName) => {
    const cleanName = projectName.replace(/\s+/g, '-').toLowerCase();
    return `https://${cleanName}.arjava.com`;
  };

  const handleCopyProjectUrl = async (url, projectId) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedProjectUrl(projectId);
      setTimeout(() => setCopiedProjectUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy project URL:', err);
    }
  };

  const getProjectEndpoints = (projectId) => {
    return endpoints.filter((e) => e.projectId === projectId);
  };


  const handleCopyUrl = async (url, endpointId) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(endpointId);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onSignUpClick={() => {}}
        isAuthenticated={!!user}
        user={user}
        onLogout={() => {
          console.log("UserDashboard onLogout called");
          onLogout();
        }}
      />

      {/* Main Dashboard Section */}
      <section className="flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-36 pb-16">
        {/* Background Glow Effect */}
        <div className="absolute top-[14em] left-[20em] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Projects List View */}
          {currentView === "projects" && (
            <div>
              {/* Page Header */}
              <div className="flex justify-between items-center mb-14">
                <span>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                    My Projects
                  </h1>
                  <p className="text-gray-600 text-md">
                    Manage your mock API projects and endpoints
                  </p>
                </span>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create New Project
                </button>
              </div>

              {/* View Toggle Tabs - Only show when projects exist */}
              {projects.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setProjectViewMode("card")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      projectViewMode === "card"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                    }`}
                  >
                    Card View
                  </button>
                  <button
                    onClick={() => setProjectViewMode("table")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      projectViewMode === "table"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                    }`}
                  >
                    Table View
                  </button>
                </div>
              )}

              {/* Card View */}
              {projectViewMode === "card" &&
                (projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-6 rounded-lg transition-all duration-300 group shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-gray-900 text-xl font-bold mb-2">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-gray-700 text-sm font-mono">
                                {project.url ||
                                  generateProjectUrl(project.name)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyProjectUrl(
                                    project.url ||
                                      generateProjectUrl(project.name),
                                    project.id
                                  );
                                }}
                                className="text-gray-800  transition-colors"
                                title="Copy Project URL"
                              >
                                {copiedProjectUrl === project.id ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <span className="text-gray-700 text-sm">
                              {project.endpointCount} endpoints
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="Edit project"
                            >
                              <Edit2 className="w-5 h-5 " />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>Created {project.createdDate}</span>
                        </div>
                        <button
                          onClick={() => handleProjectClick(project)}
                          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-600 text-blue-700 py-2 rounded-lg transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="bg-gray-500 rounded-lg p-8 text-center">
                      <p className="text-white text-lg">
                        You haven't created any project folders yet. Use the
                        'Create New Project' button to start a project.
                      </p>
                    </div>
                  </div>
                ))}

              {/* Table View */}
              {projectViewMode === "table" &&
                (projects.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Project Name
                            </th>
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Endpoints
                            </th>
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Created Date
                            </th>
                            <th className="text-right px-6 py-4 text-gray-800 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((project) => (
                            <tr
                              key={project.id}
                              className="border-b border-gray-300 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-800 font-medium">
                                    {project.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-700 text-sm font-mono">
                                      {project.url ||
                                        generateProjectUrl(project.name)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopyProjectUrl(
                                          project.url ||
                                            generateProjectUrl(project.name),
                                          project.id
                                        )
                                      }
                                      className="text-gray-500  transition-colors"
                                      title="Copy Project URL"
                                    >
                                      {copiedProjectUrl === project.id ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {project.endpointCount}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {project.createdDate}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-4">
                                  <button
                                    onClick={() => handleProjectClick(project)}
                                    className="text-gray-700 hover:text-gray-500 transition-colors text-md font-medium"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-gray-600 hover:text-gray-500 transition-colors"
                                    title="Edit project"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                    title="Delete project"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="bg-[#151b2b] rounded-lg p-8 text-center">
                      <p className="text-white text-lg">
                        You haven't created any project folders yet. Use the
                        'Create New Project' button to start a project.
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Project Details View */}
          {currentView === "project-details" && selectedProject && (
            <div>
              {/* Back Button */}
              <button
                onClick={handleBackToProjects}
                className="flex items-center px-3 py-2 rounded-md gap-2 text-white bg-blue-600 transition-colors mb-8 text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </button>

              {/* Project Header */}
              <div className="flex justify-between items-center mb-10">
                <span>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
                    {selectedProject.name}
                  </h1>
                  <p className="text-gray-700 text-md">
                    {getProjectEndpoints(selectedProject.id).length} endpoints
                    in this project
                  </p>
                </span>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCreateEndpointModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Endpoint
                  </button>
                  {/* <button
                  onClick={() => setShowRequestLogs(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  View Request Logs
                </button> */}
                </div>
              </div>

              {/* Endpoints Table or Empty State */}
              {getProjectEndpoints(selectedProject.id).length > 0 ? (
                <div className="bg- border border-gray-400 bg-gray-100 rounded-2xl overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-400">
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Endpoint Name
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Method
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Created Date
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Requests
                          </th>
                          <th className="text-right px-6 py-4 text-gray-900 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getProjectEndpoints(selectedProject.id).map(
                          (endpoint) => (
                            <tr
                              key={endpoint.id}
                              className="border border-gray-400  transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-900 font-mono">
                                    {endpoint.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-700 text-sm font-mono">
                                      http://localhost:3001/
                                      {selectedProject.name}
                                      {endpoint.name}
                                    </span>
                                    <button
                                      onClick={() => {
                                        const url = `http://localhost:3001/${selectedProject.name}${endpoint.name}`;
                                        window.open(url, "_blank");
                                      }}
                                      className="text-gray-600 transition-colors"
                                      title="Test Endpoint"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 border-2 text-white rounded-lg text-sm font-medium ${
                                    endpoint.method === "GET"
                                      ? "bg-green-600 border-green-600"
                                      : endpoint.method === "POST"
                                      ? "bg-[#7e57ffff] border-[#7e57ffff]"
                                      : endpoint.method === "PUT"
                                      ? "bg-yellow-500 border-yellow-500"
                                      : endpoint.method === "DELETE"
                                      ? "bg-red-600 border-red-600"
                                      : "bg-gray-500 border-gray-500"
                                  }`}
                                >
                                  {endpoint.method}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-800">
                                {endpoint.createdDate}
                              </td>
                              <td className="px-6 py-4 text-gray-800 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                {endpoint.requestCount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => handleEditEndpoint(endpoint)}
                                    className="text-gray-700 hover:text-[#7e57ffff] transition-colors"
                                    title="Edit endpoint"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteEndpoint(endpoint.id)
                                    }
                                    className="text-gray-700 hover:text-red-400 transition-colors"
                                    title="Delete endpoint"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="bg-gray-500 rounded-lg p-8 text-center">
                    <p className="text-white text-lg">
                      You have not created any endpoints yet. Use 'Create New
                      Endpoint' to create one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProject ? "Edit Project" : "Create New Project"}
            </h2>
            <div className="mb-6">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="my-awesome-project"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateProjectModal(false);
                  setNewProjectName("");
                  setEditingProject(null);
                }}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {editingProject ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Endpoint Modal */}
      {showCreateEndpointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-100 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl flex flex-col font-sans">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-600">
                {editingEndpoint
                  ? "Edit Mocking Rule"
                  : "Create New Mocking Rule"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateEndpointModal(false);
                  setNewResponseMode("single");
                }}
                className="text-gray-700 hover:text-gray-500 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Section 1: Request Condition */}
              <div className="rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="px-6 py-2 bg-blue-600 rounded-t-md">
                  <h3 className="text-md font-semibold text-white  tracking-wider">
                    When following condition is matched (for request)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-12 gap-6 items-end">
                    {/* Method */}
                    <div className="col-span-2">
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        Method
                      </label>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowMethodDropdown(!showMethodDropdown)
                          }
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-blue-500 transition-all font-medium flex items-center justify-between text-sm"
                        >
                          <span>{newEndpointMethod}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showMethodDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-20 py-1 max-h-60 overflow-y-auto scrollbar-hide">
                            {[
                              "GET",
                              "POST",
                              "PUT",
                              "PATCH",
                              "DELETE",
                              "OPTIONS",
                            ].map((method) => (
                              <button
                                key={method}
                                onClick={() => {
                                  setNewEndpointMethod(method);
                                  setShowMethodDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Condition Type */}
                    <div className="col-span-4">
                      <label className="block text-md font-semibold text-gray-700  mb-2">
                        Request Condition
                      </label>
                      <div className="relative">
                        <select
                          value={newMatchType}
                          onChange={(e) =>
                            handleMatchTypeChange(e.target.value)
                          }
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm appearance-none pr-10"
                        >
                          <option value="path_exact">
                            request path exactly matches
                          </option>
                          <option value="path_starts">
                            request path starts with
                          </option>
                          <option value="path_contains">
                            request path contains
                          </option>
                          <option value="path_template">
                            request path matches template
                          </option>
                          <option value="path_regex">
                            request path matches a regular expression
                          </option>
                          <option value="body_contains">
                            request body contains
                          </option>
                          <option value="body_param">
                            request body parameter matches
                          </option>
                          <option value="body_regex">
                            request body matches a regular expression
                          </option>
                          <option value="header_regex">
                            request header matches a regular expression
                          </option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Dynamic Match Value Fields */}
                    <div className="col-span-6">
                      {fieldConfig.type === "single" && (
                        <>
                          <label className="block text-md font-semibold text-gray-700  mb-2">
                            {fieldConfig.label}
                          </label>
                          <input
                            type="text"
                            value={newEndpointName}
                            onChange={(e) => setNewEndpointName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 font-mono text-sm"
                            placeholder={fieldConfig.placeholder}
                          />
                        </>
                      )}

                      {fieldConfig.type === "triple" && (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              {fieldConfig.labels[0]}
                            </label>
                            <input
                              type="text"
                              value={newParamName}
                              onChange={(e) => setNewParamName(e.target.value)}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                              placeholder="username"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              {fieldConfig.labels[1]}
                            </label>
                            <select
                              value={newParamOperator}
                              onChange={(e) =>
                                setNewParamOperator(e.target.value)
                              }
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                            >
                              <option value="equals">equals</option>
                              <option value="contains">contains</option>
                              <option value="starts_with">starts with</option>
                              <option value="exists">exists</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              {fieldConfig.labels[2]}
                            </label>
                            <input
                              type="text"
                              value={newParamValue}
                              onChange={(e) => setNewParamValue(e.target.value)}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                              placeholder="john"
                            />
                          </div>
                        </div>
                      )}

                      {fieldConfig.type === "double" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              {fieldConfig.labels[0]}
                            </label>
                            <input
                              type="text"
                              value={newHeaderName}
                              onChange={(e) => setNewHeaderName(e.target.value)}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                              placeholder="Authorization"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              {fieldConfig.labels[1]}
                            </label>
                            <input
                              type="text"
                              value={newHeaderValue}
                              onChange={(e) =>
                                setNewHeaderValue(e.target.value)
                              }
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 font-mono text-sm"
                              placeholder="Bearer\\s+[A-Za-z0-9-._~+/]+=*"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Conditions */}
                  {requestConditions.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {requestConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-6 items-center"
                        >
                          {/* AND Label Area */}
                          <div className="col-span-2 flex justify-end">
                            <span className="text-sm font-bold text-gray-900 mr-2">
                              AND
                            </span>
                          </div>
                          <div className="col-span-4">
                            <div className="relative">
                              <select
                                value={condition.matchType || "path_exact"}
                                onChange={(e) => {
                                  const updated = [...requestConditions];
                                  updated[index].matchType = e.target.value;
                                  updated[index].value = "";
                                  updated[index].headerName = "";
                                  updated[index].headerValue = "";
                                  updated[index].paramName = "";
                                  updated[index].paramValue = "";
                                  setRequestConditions(updated);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600 focus:outline-none focus:border-blue-500 text-sm appearance-none"
                              >
                                <option value="path_exact">
                                  request path exactly matches
                                </option>
                                <option value="path_starts">
                                  request path starts with
                                </option>
                                <option value="path_contains">
                                  request path contains
                                </option>
                                <option value="path_template">
                                  request path matches template
                                </option>
                                <option value="path_regex">
                                  request path matches a regular expression
                                </option>
                                <option value="body_contains">
                                  request body contains
                                </option>
                                <option value="body_param">
                                  request body parameter matches
                                </option>
                                <option value="body_regex">
                                  request body matches a regular expression
                                </option>
                                <option value="header_regex">
                                  request header matches a regular expression
                                </option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {(condition.matchType === "path_exact" ||
                            condition.matchType === "path_starts" ||
                            condition.matchType === "path_contains" ||
                            condition.matchType === "path_regex" ||
                            condition.matchType === "body_contains" ||
                            condition.matchType === "body_regex" ||
                            condition.matchType === "path_template" ||
                            !condition.matchType) && (
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={condition.value || ""}
                                onChange={(e) => {
                                  const updated = [...requestConditions];
                                  updated[index].value = e.target.value;
                                  setRequestConditions(updated);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm font-mono"
                                placeholder={getConditionPlaceholder(
                                  condition.matchType || "path_exact"
                                )}
                              />
                            </div>
                          )}

                          {condition.matchType === "body_param" && (
                            <div className="col-span-5 grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Parameter Name
                                </label>
                                <input
                                  type="text"
                                  value={condition.paramName || ""}
                                  onChange={(e) => {
                                    const updated = [...requestConditions];
                                    updated[index].paramName = e.target.value;
                                    setRequestConditions(updated);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                  placeholder="username"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Operator
                                </label>
                                <select
                                  value={condition.paramOperator || "equals"}
                                  onChange={(e) => {
                                    const updated = [...requestConditions];
                                    updated[index].paramOperator =
                                      e.target.value;
                                    setRequestConditions(updated);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                >
                                  <option value="equals">equals</option>
                                  <option value="contains">contains</option>
                                  <option value="starts_with">
                                    starts with
                                  </option>
                                  <option value="exists">exists</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Parameter Value
                                </label>
                                <input
                                  type="text"
                                  value={condition.paramValue || ""}
                                  onChange={(e) => {
                                    const updated = [...requestConditions];
                                    updated[index].paramValue = e.target.value;
                                    setRequestConditions(updated);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                  placeholder="john"
                                />
                              </div>
                            </div>
                          )}

                          {condition.matchType === "header_regex" && (
                            <div className="col-span-5 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                  HTTP Header Name
                                </label>
                                <input
                                  type="text"
                                  value={condition.headerName || ""}
                                  onChange={(e) => {
                                    const updated = [...requestConditions];
                                    updated[index].headerName = e.target.value;
                                    setRequestConditions(updated);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                  placeholder="Authorization"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Match Header Value
                                </label>
                                <input
                                  type="text"
                                  value={condition.headerValue || ""}
                                  onChange={(e) => {
                                    const updated = [...requestConditions];
                                    updated[index].headerValue = e.target.value;
                                    setRequestConditions(updated);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm font-mono"
                                  placeholder="Bearer\\s+[A-Za-z0-9-._~+/]+=*"
                                />
                              </div>
                            </div>
                          )}

                          <div className="col-span-1">
                            <button
                              onClick={() => {
                                setRequestConditions(
                                  requestConditions.filter(
                                    (_, i) => i !== index
                                  )
                                );
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove condition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => {
                        setStateConditions([
                          ...stateConditions,
                          {
                            variable: "",
                            type: "",
                            operator: "",
                            value: "",
                          },
                        ]);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      + Add State Condition
                    </button>
                    <button
                      onClick={() => {
                        setRequestConditions([
                          ...requestConditions,
                          {
                            matchType: "path_exact",
                            value: "",
                            headerName: "",
                            headerValue: "",
                            paramName: "",
                            paramOperator: "equals",
                            paramValue: "",
                          },
                        ]);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      + Add Request Condition
                    </button>
                  </div>

                  {/* State Conditions - Beeceptor Style */}
                  {stateConditions.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-md font-semibold text-gray-800 uppercas tracking-wide">
                        State Conditions
                      </h4>
                      {stateConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-4 items-end p-3 bg-gray-50 rounded border"
                        >
                          <div className="col-span-3">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                              Variable Name
                            </label>
                            <input
                              type="text"
                              value={condition.variable}
                              onChange={(e) => {
                                const updated = [...stateConditions];
                                updated[index].variable = e.target.value;
                                setStateConditions(updated);
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                              placeholder="counter_name"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-md font-semibold text-gray-700  mb-2">
                              Type
                            </label>
                            <select
                              value={condition.type}
                              onChange={(e) => {
                                const updated = [...stateConditions];
                                updated[index].type = e.target.value;
                                updated[index].operator = ""; // Reset operator when type changes
                                setStateConditions(updated);
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                            >
                              <option value="">Type</option>
                              <option value="Data Store">Data Store</option>
                              <option value="List">List</option>
                              <option value="Counter">Counter</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                              Condition
                            </label>
                            <select
                              value={condition.operator}
                              onChange={(e) => {
                                const updated = [...stateConditions];
                                updated[index].operator = e.target.value;
                                setStateConditions(updated);
                              }}
                              disabled={!condition.type}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100"
                            >
                              <option value="">Condition</option>
                              {getStateConditionOptions(condition.type).map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-md font-semibold text-gray-700  mb-2">
                              Value
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => {
                                const updated = [...stateConditions];
                                updated[index].value = e.target.value;
                                setStateConditions(updated);
                              }}
                              disabled={
                                !condition.operator ||
                                ["exists", "not_exists"].includes(
                                  condition.operator
                                )
                              }
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100"
                              placeholder="1"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => {
                                setStateConditions(
                                  stateConditions.filter((_, i) => i !== index)
                                );
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove state condition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Response Action */}
              <div className="rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="px-6 py-2 bg-blue-600 rounded-t-md">
                  <h3 className="text-md font-semibold text-white  tracking-wider">
                    Do the following (for response)
                  </h3>
                </div>

                <div className="p-6">
                  {/* Response Mode Toggle */}
                  <div className="flex justify-center mb-8 border-b border-gray-100 pb-4">
                    <div className="flex rounded p-1 bg-gray-100">
                      <button
                        onClick={() => setNewResponseMode("single")}
                        className={`px-6 py-1.5 text-md font-bold rounded transition-colors ${
                          newResponseMode === "single"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Single Response
                      </button>
                      <button
                        onClick={() => setNewResponseMode("weighted")}
                        className={`px-6 py-1.5 text-md font-bold rounded transition-colors ${
                          newResponseMode === "weighted"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Weighted Response
                      </button>
                    </div>
                  </div>

                  {/* Single Response Mode */}
                  {newResponseMode === "single" && (
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      {/* Delay */}
                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                          Response delayed by (sec)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            value={newEndpointDelay}
                            onChange={(e) =>
                              setNewEndpointDelay(e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-l text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                            placeholder="0"
                          />
                          <span className="px-3 py-2.5 bg-gray-200 border border-l-0 border-gray-300 text-gray-600 text-xs font-bold rounded-r flex items-center">
                            sec
                          </span>
                        </div>
                      </div>

                      {/* Status Code */}
                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2 flex justify-between">
                          <span>Return HTTP Status as</span>
                          <div className="flex items-center gap-2 normal-case font-normal text-gray-600">
                            <input
                              type="checkbox"
                              checked={newIsFile}
                              onChange={(e) => setNewIsFile(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">Send a file/blob</span>
                          </div>
                        </label>
                        <input
                          type="number"
                          value={newEndpointStatus}
                          onChange={(e) => setNewEndpointStatus(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Weighted Response Mode */}
                  {newResponseMode === "weighted" && (
                    <div className="space-y-6 mb-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-700">
                          Response Options
                        </h4>
                        <button
                          onClick={addWeightedResponse}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Response
                        </button>
                      </div>
                      {weightedResponses.map((response, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded p-4 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-700">
                              Response {index + 1}
                            </h5>
                            {weightedResponses.length > 1 && (
                              <button
                                onClick={() => removeWeightedResponse(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-md font-semibold text-gray-700  mb-2">
                                Weight (%)
                              </label>
                              <input
                                type="number"
                                value={response.weight}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    index,
                                    "weight",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="50"
                              />
                            </div>

                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Response delayed by (sec)
                              </label>
                              <input
                                type="number"
                                value={response.delay || ""}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    index,
                                    "delay",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Return HTTP status as
                              </label>
                              <input
                                type="number"
                                value={response.status}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    index,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="200"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Response headers
                              </label>
                              <textarea
                                value={response.headers}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    index,
                                    "headers",
                                    e.target.value
                                  )
                                }
                                className="w-full h-24 px-3 py-2 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                spellCheck="false"
                              />
                            </div>
                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Response body
                              </label>
                              <textarea
                                value={response.body}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    index,
                                    "body",
                                    e.target.value
                                  )
                                }
                                className="w-full h-24 px-3 py-2 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                spellCheck="false"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Single Response Headers and Body */}
                  {newResponseMode === "single" && (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Headers */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-md font-semibold text-gray-700 ">
                            Response Headers
                          </label>
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer relative">
                            <button
                              onClick={() =>
                                setShowContentTypeDropdown(
                                  !showContentTypeDropdown
                                )
                              }
                              className="flex items-center gap-1"
                            >
                              Set Content-Type ▼
                            </button>
                            {showContentTypeDropdown && (
                              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-30 py-1 min-w-54">
                                {contentTypePresets.map((preset, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setNewEndpointHeaders(preset.value);
                                      setShowContentTypeDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </span>
                        </div>
                        <textarea
                          value={newEndpointHeaders}
                          onChange={(e) =>
                            setNewEndpointHeaders(e.target.value)
                          }
                          className="w-full h-40 px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                          spellCheck="false"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-md font-semibold text-gray-700 ">
                            Response Body
                          </label>
                          {/* <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-200 relative"> */}
                          {/* <button
                              onClick={() =>
                                setShowDynamicValueDropdown(
                                  !showDynamicValueDropdown
                                )
                              }
                              className="flex items-center gap-1"
                            >
                              Insert Dynamic Value NEW
                            </button> */}
                          {/* {showDynamicValueDropdown && (
                              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-30 py-1 min-w-48">
                                {dynamicValues.map((item, index) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      insertDynamicValue(item.value)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            )} */}
                          {/* </span> */}
                        </div>
                        <textarea
                          value={newEndpointBody}
                          onChange={(e) => setNewEndpointBody(e.target.value)}
                          className="w-full h-40 px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Additional Information */}
              <div className="rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="px-6 py-2 bg-blue-600 rounded-t-md">
                  <h3 className="text-md font-semibold text-white tracking-wider">
                    Additional Information
                  </h3>
                </div>
                <div className="p-6">
                  <label className="block text-md font-semibold text-gray-700  mb-2">
                    Rule Description
                  </label>
                  <input
                    type="text"
                    value={newRuleDescription}
                    onChange={(e) => setNewRuleDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g. UUID Generator for User ID"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowCreateEndpointModal(false);
                  setNewEndpointName("/");
                  setNewEndpointMethod("GET");
                  setNewEndpointDelay("");
                  setNewEndpointStatus("200");
                  setNewEndpointHeaders(
                    '{\n  "Content-Type": "application/json"\n}'
                  );
                  setNewEndpointBody('{\n  "status": "Awesome!"\n}');
                  setNewRuleDescription("");
                  setNewResponseMode("single");
                  setStateConditions([]);
                  setRequestConditions([]);
                  setNewParamName("");
                  setNewParamOperator("equals");
                  setNewParamValue("");
                  setNewHeaderName("");
                  setNewHeaderValue("");
                  setWeightedResponses([
                    {
                      weight: 100,
                      status: "200",
                      headers: '{\n  "Content-Type": "application/json"\n}',
                      body: '{\n  "status": "Awesome!"\n}',
                    },
                  ]);
                  setEditingEndpoint(null);
                  setShowMethodDropdown(false);
                }}
                className="px-8 py-2.5 bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateEndpoint}
                className="px-10 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition-colors"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Logs Modal */}
      {showRequestLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Request Logs - {selectedProject?.name}
              </h2>
              <button
                onClick={() => setShowRequestLogs(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No requests logged yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Make requests to your endpoints to see them here
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserDashboard;
