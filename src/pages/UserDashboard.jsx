import React, { useState, useEffect } from "react";
import EnvironmentSelector from "./EnvironmentSelector";
import QueryHeaderRuleBuilder from "../components/QueryHeaderRuleBuilder";
import { FolderOpen, Plus, Edit2, Trash2, ArrowLeft, Calendar, Activity, Copy, Check, ChevronDown, Clock, Code2, Move, X, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getProjectEnvironments, getSelectedEnvironment, setSelectedEnvironment, getEnvironmentRules, saveEndpointWithEnvironment, deleteEndpointFromEnvironment, addEnvironmentToProject, removeEnvironmentFromProject, cloneEnvironment } from "../lib/environmentManager";
import { getQueryHeaderRules, saveQueryHeaderRules } from "../lib/queryHeaderRuleEngine";
import { useSyncQueryHeaderRules } from "../lib/useSyncQueryHeaderRules";


const UserDashboard = ({ user, onLogout }) => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectViewMode, setProjectViewMode] = useState("card"); // 'card' | 'table'
  const [editingProject, setEditingProject] = useState(null);
  const [copiedProjectUrl, setCopiedProjectUrl] = useState(null);
  const [showCreateEndpointModal, setShowCreateEndpointModal] = useState(false);
  const [showMockingRulesOnboarding, setShowMockingRulesOnboarding] = useState(false);
  const [showRequestLogs, setShowRequestLogs] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mockingRulesMessage, setMockingRulesMessage] = useState("");
  const [onboardingPrefill, setOnboardingPrefill] = useState(null);
  const [newResponseMode, setNewResponseMode] = useState("single");
  const [newEndpointName, setNewEndpointName] = useState("/");
  const [newEndpointMethod, setNewEndpointMethod] = useState("GET");
  const [newEndpointDelay, setNewEndpointDelay] = useState("");
  const [newEndpointStatus, setNewEndpointStatus] = useState("200");
  const [newEndpointHeaders, setNewEndpointHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [newEndpointBody, setNewEndpointBody] = useState('{\n  "status": "Awesome!"\n}');
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newIsFile, setNewIsFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [stateConditions, setStateConditions] = useState([]);
  const [requestConditions, setRequestConditions] = useState([]);
  const [newParamName, setNewParamName] = useState("");
  const [newParamOperator, setNewParamOperator] = useState("equals");
  const [newParamValue, setNewParamValue] = useState("");
  const [newHeaderName, setNewHeaderName] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [weightedResponses, setWeightedResponses] = useState([{
    weight: 100,
    status: "200",
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: '{\n  "status": "Awesome!"\n}'
  }]);
  const [activeResponseTab, setActiveResponseTab] = useState(0);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [newMatchType, setNewMatchType] = useState("path_exact");
  const [queryHeaderRuleTrigger, setQueryHeaderRuleTrigger] = useState(0);
  const [tempActiveId, setTempActiveId] = useState(`temp_${Date.now()}`);
  const navigate = useNavigate();

  // Load data from localStorage or use default mock data
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('beeceptor_projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('beeceptor_projects', JSON.stringify(projects));
  }, [projects]);

  const handleProjectClick = (project) => {
    const projectNameSlug = project.name.replace(/\s+/g, '-').toLowerCase();
    console.log('Navigating to project:', projectNameSlug);
    navigate(`/project/${projectNameSlug}`, { replace: false });
  };

  const handleDeleteProject = (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setProjects(projects.filter((p) => p.id !== projectId));
    // Also remove endpoints for this project
    const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
    const filteredEndpoints = allEndpoints.filter(e => e.projectId !== projectId);
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(filteredEndpoints));
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setShowCreateProjectModal(true);
  };


  // Helper functions and handlers
  const contentTypePresets = [
    { label: "JSON", value: '{\n  "Content-Type": "application/json"\n}' },
    { label: "XML", value: '{\n  "Content-Type": "application/xml"\n}' },
    { label: "HTML", value: '{\n  "Content-Type": "text/html"\n}' },
    { label: "Plain Text", value: '{\n  "Content-Type": "text/plain"\n}' }
  ];

  const fieldConfig = (() => {
    switch (newMatchType) {
      case "body_param":
        return {
          type: "triple",
          labels: ["Parameter Name", "Operator", "Parameter Value"]
        };
      case "header_regex":
        return {
          type: "double",
          labels: ["HTTP Header Name", "Match Header Value"]
        };
      default:
        return {
          type: "single",
          label: "Value",
          placeholder: "/api/users"
        };
    }
  })();

  // Dynamic field configuration based on match type
  const getFieldConfig = (matchType) => {
    switch (matchType) {
      case 'path_exact': return { type: 'single', label: 'Match Value / Expression', placeholder: 'e.g: /api/path' };
      case 'path_starts': return { type: 'single', label: 'Match Value / Expression', placeholder: '/api' };
      case 'path_contains': return { type: 'single', label: 'Match Value / Expression', placeholder: 'users' };
      case 'path_template': return { type: 'single', label: 'Path Pattern', placeholder: '/users/{id}' };
      case 'path_regex': return { type: 'single', label: 'Match Value / Expression', placeholder: '^/api/users/[0-9]+$' };
      case 'body_contains': return { type: 'single', label: 'Match Value / Expression', placeholder: 'search text' };
      case 'body_param': return { type: 'triple', labels: ['Parameter Name', 'Operator', 'Parameter Value'] };
      case 'body_regex': return { type: 'single', label: 'Match Value / Expression', placeholder: '"email":\\s*"[^"]+@[^"]+"' };
      case 'header_regex': return { type: 'double', labels: ['HTTP Header Name', 'Match Header Value'] };
      default: return { type: 'single', label: 'Match Value / Expression', placeholder: '/api/resource' };
    }
  };

  const handleMatchTypeChange = (newType) => {
    setNewMatchType(newType);
    const config = getFieldConfig(newType);
    if (config.type === 'single') {
      setNewEndpointName('');
    } else if (config.type === 'triple') {
      setNewParamName(''); setNewParamOperator('equals'); setNewParamValue('');
    } else if (config.type === 'double') {
      setNewHeaderName(''); setNewHeaderValue('');
    }
  };

  const getConditionPlaceholder = (matchType) => {
    switch (matchType) {
      case 'path_exact': return 'e.g: /api/path';
      case 'path_starts': return '/api';
      case 'path_contains': return 'users';
      case 'path_template': return '/users/{id}';
      case 'path_regex': return '^/api/users/[0-9]+$';
      case 'body_contains': return 'search text';
      case 'body_regex': return '"email":\\s*"[^"]+@[^"]+"';
      default: return '/api/resource';
    }
  };

  const getStateConditionOptions = (type) => {
    switch (type) {
      case "Data Store":
        return [
          { value: "exists", label: "exists" },
          { value: "not_exists", label: "does not exist" },
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "does not equal" }
        ];
      case "List":
        return [
          { value: "contains", label: "contains" },
          { value: "not_contains", label: "does not contain" },
          { value: "size_equals", label: "size equals" },
          { value: "size_greater", label: "size greater than" }
        ];
      case "Counter":
        return [
          { value: "equals", label: "equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" }
        ];
      default:
        return [];
    }
  };

  const addWeightedResponse = () => {
    if (weightedResponses.length < 4) {
      setWeightedResponses([...weightedResponses, {
        weight: 0,
        status: "200",
        headers: '{\n  "Content-Type": "application/json"\n}',
        body: '{\n  "status": "Awesome!"\n}'
      }]);
      setActiveResponseTab(weightedResponses.length);
    }
  };

  const removeWeightedResponse = (index) => {
    if (weightedResponses.length > 1) {
      setWeightedResponses(weightedResponses.filter((_, i) => i !== index));
      if (activeResponseTab >= weightedResponses.length - 1) {
        setActiveResponseTab(Math.max(0, weightedResponses.length - 2));
      }
    }
  };

  const updateWeightedResponse = (index, field, value) => {
    const updated = [...weightedResponses];
    updated[index][field] = value;
    setWeightedResponses(updated);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result
      });
      setNewEndpointHeaders(`{\n  "Content-Type": "${file.type || 'application/octet-stream'}"\n}`);
      setFileUploadLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCreateEndpoint = () => {
    // Placeholder function - implement endpoint creation logic
    console.log('Creating endpoint...');
    setShowCreateEndpointModal(false);
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
      // Create new project with clean state
      const newProject = {
        id: `proj_${Date.now()}`,
        name: newProjectName,
        url: generateProjectUrl(newProjectName),
        createdDate: new Date().toISOString().split("T")[0],
        endpointCount: 0,
        userId: user?.id,
      };
      setProjects([...projects, newProject]);
      
      // Register project mapping for browser access
      fetch('http://localhost:3001/api/projects/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newProject.id,
          projectName: newProject.name
        })
      }).catch(error => console.error('Failed to register project mapping:', error));
    }
    
    setNewProjectName("");
    setShowCreateProjectModal(false);
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

  return (
    <div className="flex flex-col">

      {/* Main Dashboard Section */}
      <section className="flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-8 pb-16">
        {/* Background Glow Effect */}
        <div className="absolute top-[14em] left-[20em] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Projects List View */}
          <div>
              {/* Page Header */}
              <div className="flex justify-between items-center mb-14">
                <span>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
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
                                    project.id,
                                  );
                                }}
                                className="text-gray-800  transition-colors cursor-pointer"
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
                              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                              title="Edit project"
                            >
                              <Edit2 className="w-5 h-5 " />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
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
                        <Link
                          to={`/project/${project.name.replace(/\s+/g, '-').toLowerCase()}`}
                          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-600 text-blue-700 py-2 rounded-lg transition-colors font-medium block text-center"
                        >
                          View Details
                        </Link>
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
                                          project.id,
                                        )
                                      }
                                      className="text-gray-500  transition-colors cursor-pointer"
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
                                  <Link
                                    to={`/project/${project.name.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-gray-500 hover:text-gray-700 transition-colors text-md font-medium cursor-pointer"
                                  >
                                    View
                                  </Link>
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-gray-600 hover:text-gray-500 transition-colors cursor-pointer"
                                    title="Edit project"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
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
                Mocking Rules
              </h2>
              <button
                onClick={() => {
                  setShowCreateEndpointModal(false);
                  setNewResponseMode("single");
                  setOnboardingPrefill(null);
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
                      {(() => {
                        const fieldConfig = getFieldConfig(newMatchType);
                        if (fieldConfig.type === "single") {
                          return (
                            <>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
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
                          );
                        } else if (fieldConfig.type === "triple") {
                          return (
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
                                  onChange={(e) => setNewParamOperator(e.target.value)}
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
                          );
                        } else if (fieldConfig.type === "double") {
                          return (
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
                                  onChange={(e) => setNewHeaderValue(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 font-mono text-sm"
                                  placeholder="Bearer\\s+[A-Za-z0-9-._~+/]+=*"
                                />
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* State Conditions - Beeceptor Style */}
                  {stateConditions.length > 0 && (
                    <div className="mt-6 space-y-3 p-4 bg-blue-50 rounded border border-blue-200">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
                        State Conditions
                      </h4>
                      {stateConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-3 items-end"
                        >
                          {index > 0 && (
                            <div className="col-span-2 flex justify-end">
                              <span className="text-sm font-bold text-gray-700 mr-2">
                                AND
                              </span>
                            </div>
                          )}
                          <div
                            className={
                              index > 0 ? "col-span-10" : "col-span-12"
                            }
                          >
                            <div className="grid grid-cols-12 gap-3 items-end">
                              <div className="col-span-3">
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                  Variable
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
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                  Type
                                </label>
                                <select
                                  value={condition.type}
                                  onChange={(e) => {
                                    const updated = [...stateConditions];
                                    updated[index].type = e.target.value;
                                    updated[index].operator = "";
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
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
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
                                    ),
                                  )}
                                </select>
                              </div>
                              <div className="col-span-3">
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
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
                                      condition.operator,
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
                                      stateConditions.filter(
                                        (_, i) => i !== index,
                                      ),
                                    );
                                  }}
                                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Remove state condition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                                  condition.matchType || "path_exact",
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
                                    (_, i) => i !== index,
                                  ),
                                );
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                              title="Remove condition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Always visible action buttons - moved to be more prominent */}
                  {/* <div className="mt-6 pt-4 border-t-2 border-blue-200 bg-blue-50 p-4 rounded">
                    <div className="flex justify-center gap-3">
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer shadow-sm"
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer shadow-sm"
                      >
                        + Add Request Condition
                      </button>
                      <button
                        onClick={() =>
                          setQueryHeaderRuleTrigger((prev) => prev + 1)
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer shadow-sm"
                      >
                        + Add Query & Header Rule
                      </button>
                    </div>
                  </div> */}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <button
                        onClick={() => setStateConditions([...stateConditions, { variable: "", type: "Data Store", operator: "equals", value: "" }])}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add State Condition
                      </button>
                      <button
                        onClick={() => setRequestConditions([...requestConditions, { matchType: "path_exact", value: "" }])}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Request Condition
                      </button>
                      <button
                        onClick={() => setQueryHeaderRuleTrigger(prev => prev + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Query & Header Rule
                      </button>
                    </div>

                    <QueryHeaderRuleBuilder
                      key={tempActiveId}
                      endpointId={editingEndpoint ? (editingEndpoint.backendId || editingEndpoint.id) : tempActiveId}
                      triggerAddRule={queryHeaderRuleTrigger}
                    />
                  </div>
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
                      {/* Delay */}
                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                          Response delayed by (sec)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            step="0.01"
                            value={newEndpointDelay}
                            onChange={(e) =>
                              setNewEndpointDelay(e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-l text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                            placeholder="0.00"
                          />
                          <span className="px-3 py-2.5 bg-gray-200 border border-l-0 border-gray-300 text-gray-600 text-sm font-medium rounded-r flex items-center">
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
                          disabled={weightedResponses.length >= 4}
                          className={`text-sm font-medium cursor-pointer ${
                            weightedResponses.length >= 4
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                        >
                          + Add Response {weightedResponses.length >= 4 && "(Max 4)"}
                        </button>
                      </div>
                      
                      {/* Response Tabs */}
                      <div className="flex border-b border-gray-200">
                        {weightedResponses.map((response, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveResponseTab(index)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              activeResponseTab === index
                                ? "border-blue-500 text-blue-600 bg-blue-50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Response {index + 1} ({response.weight}%)
                          </button>
                        ))}
                      </div>

                      {/* Active Response Content */}
                      {weightedResponses[activeResponseTab] && (
                        <div className="border border-gray-200 rounded p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-700">
                              Response {activeResponseTab + 1}
                            </h5>
                            {weightedResponses.length > 1 && (
                              <button
                                onClick={() => removeWeightedResponse(activeResponseTab)}
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
                                min="0"
                                max="100"
                                value={weightedResponses[activeResponseTab].weight}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    activeResponseTab,
                                    "weight",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="50"
                              />
                            </div>

                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Response delayed by
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={weightedResponses[activeResponseTab].delay || ""}
                                  onChange={(e) =>
                                    updateWeightedResponse(
                                      activeResponseTab,
                                      "delay",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-l text-gray-900 focus:outline-none focus:border-blue-500 text-sm"
                                  placeholder="0.00"
                                />
                                <span className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 text-gray-600 text-sm font-medium rounded-r flex items-center">
                                  sec
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Return HTTP status as
                              </label>
                              <input
                                type="number"
                                min="100"
                                max="599"
                                value={weightedResponses[activeResponseTab].status}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    activeResponseTab,
                                    "status",
                                    e.target.value,
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
                                value={weightedResponses[activeResponseTab].headers}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    activeResponseTab,
                                    "headers",
                                    e.target.value,
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
                                value={weightedResponses[activeResponseTab].body}
                                onChange={(e) =>
                                  updateWeightedResponse(
                                    activeResponseTab,
                                    "body",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-24 px-3 py-2 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                spellCheck="false"
                              />
                            </div>
                          </div>
                        </div>
                      )}
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
                                  !showContentTypeDropdown,
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

                      {/* Body - Always Editable */}
                      <div>
                        <label className="text-md font-semibold text-gray-700 mb-2 block">
                          Response Body
                        </label>
                        <textarea
                          value={newEndpointBody}
                          onChange={(e) => setNewEndpointBody(e.target.value)}
                          className="w-full h-40 px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}

                  {/* File Upload Section - Separate from Response Body */}
                  {newIsFile && newResponseMode === "single" && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-4">
                        Send a file/blob (Request Payload)
                      </h4>
                      {uploadedFile ? (
                        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded text-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">
                                {uploadedFile.name
                                  .split(".")
                                  .pop()
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {uploadedFile.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(uploadedFile.size / 1024).toFixed(1)} KB •{" "}
                                {uploadedFile.type}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={handleFileSelect}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className="w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <div className="text-gray-500 mb-2">
                            Click to select a file
                          </div>
                          <div className="text-xs text-gray-400">
                            or drag and drop
                          </div>
                        </div>
                      )}
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
                    '{\n  "Content-Type": "application/json"\n}',
                  );
                  setNewEndpointBody('{\n  "status": "Awesome!"\n}');
                  setNewRuleDescription("");
                  setNewResponseMode("single");
                  setNewIsFile(false);
                  setUploadedFile(null);
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
                  setOnboardingPrefill(null);

                  // Cleanup temp rules
                  const currentRules = getQueryHeaderRules();
                  const filteredRules = currentRules.filter(
                    (r) => !r.endpointId.startsWith("temp_"),
                  );
                  saveQueryHeaderRules(filteredRules);
                  setTempActiveId(`temp_${Date.now()}`);
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

      {/* Mocking Rules Onboarding Modal */}
      {showMockingRulesOnboarding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[100] px-4">
          {/* Top-right Notification */}
          {mockingRulesMessage && (
            <div className="fixed top-24 right-8 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-[101] max-w-sm">
              {mockingRulesMessage}
            </div>
          )}
          <div className="bg-white rounded-lg max-w-6xl w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 flex justify-between items-center border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-600">Mocking Rules</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMockingRulesOnboarding(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-10 pt-8 pb-4">
              {/* Main Heading Section */}
              <div className="text-center">
                <h1 className="text-[28px] font-medium text-[#374151] flex items-center justify-center gap-2">
                  Build something awesome!
                </h1>
                <p className="text-[#6b7280] text-[17px] mb-6">
                  Create your first mock rule to start customizing API
                  responses.
                </p>

                <h3 className="text-[#4b5563] text-xl font-medium mb-4">
                  Discover What's Possible
                </h3>

                {/* Cards Grid */}
                <div className="flex max-w-2xl justify-center mx-auto gap-5">
                  {/* Delay Card */}
                  <div
                    onClick={() => {
                      setShowMockingRulesOnboarding(false);
                      setOnboardingPrefill({ delay: "5.00" });
                      setShowCreateEndpointModal(true);
                    }}
                    className="p-6 border border-gray-200 rounded-lg bg-white hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col gap-4 cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#f3f3f3ff] flex items-center justify-center border border-gray-50">
                      <Clock className="w-5 h-5 text-[#64748b]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1f2937] text-[15px] mb-2 leading-tight">
                        Add Delay to Proxy Response
                      </h4>
                      <p className="text-[13px] text-[#6b7280] leading-[1.6] font-normal">
                        Introduce a delay to mimic slow or flaky network
                        conditions. Helps test timeouts and retry behaviors in
                        your app.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Mock Card */}
                  <div
                    onClick={() => {
                      setShowMockingRulesOnboarding(false);
                      setOnboardingPrefill({
                        body: '[\n  {\n    "id": "{{faker \'string.uuid\'}}",\n    "name": "{{faker \'person.firstName\'}} {{faker \'person.lastName\'}}",\n    "email": "{{faker \'internet.email\'}}",\n    "address": "{{faker \'location.streetAddress\'}}",\n    "country": "{{faker \'location.country\'}}",\n    "phone": "{{faker \'phone.number\'}}"\n  }\n]',
                      });
                      setShowCreateEndpointModal(true);
                    }}
                    className="p-6 border border-gray-200 rounded-lg bg-white hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col gap-4 cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#f3f3f3ff] flex items-center justify-center border border-gray-50">
                      <Code2 className="w-5 h-5 text-[#64748b]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1f2937] text-[15px] mb-2 leading-tight">
                        Create a Dynamic Mock Response
                      </h4>
                      <p className="text-[13px] text-[#6b7280] leading-[1.6] font-normal">
                        Learn how to build dynamic API responses using
                        Beeceptor's template engine — ideal for testing
                        different output scenarios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex items-center justify-center gap-6 mt-12 bg-white sticky bottom-0">
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setShowMockingRulesOnboarding(false);
                      setOnboardingPrefill(null);
                      setShowCreateEndpointModal(true);
                    }}
                    className="bg-[#2998e4] hover:bg-[#2587cd] text-white px-5 py-2.5 rounded-l-md font-medium transition-all flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Mock Rule
                  </button>
                  {/* <button className="bg-[#2998e4] hover:bg-[#2587cd] text-white px-2.5 py-2.5 rounded-r-md border-l border-white/20 transition-all shadow-sm">
                    <ChevronDown className="w-4 h-4" />
                  </button> */}
                </div>
                {/* <button className="flex items-center gap-1.5 text-[#3b82f6] hover:text-blue-600 font-medium transition-colors text-[15px]">
                  <Sparkles className="w-4 h-4" />
                  Create with AI <span className="text-[10px] bg-blue-50 px-1 rounded font-bold ml-0.5">B</span>
                </button> */}
              </div>
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

    </div>
  );
};

export default UserDashboard;