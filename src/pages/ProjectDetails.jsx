import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnvironmentSelector from "./EnvironmentSelector";
import { ArrowLeft, Plus, Edit2, Trash2, Activity, Copy, Check, ChevronDown, Clock, Code2, Move, X, Download, Upload, Sparkles, Calendar, FolderOpen } from "lucide-react";
import QueryHeaderRuleBuilder from "../components/QueryHeaderRuleBuilder";
import { getQueryHeaderRules, saveQueryHeaderRules } from "../lib/queryHeaderRuleEngine";
import { getProjectEnvironments, getSelectedEnvironment, setSelectedEnvironment, getEnvironmentRules, saveEndpointWithEnvironment, deleteEndpointFromEnvironment, addEnvironmentToProject, removeEnvironmentFromProject, cloneEnvironment } from "../lib/environmentManager";
import { useSyncQueryHeaderRules } from "../lib/useSyncQueryHeaderRules";

const GlobalVariablesManager = ({ globalVars, projectEnvironments, onSave }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  const showNotification = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleExport = () => {
    if (Object.keys(globalVars).length === 0) {
      showNotification("No variables to export");
      return;
    }

    const exportData = {
      version: "1.0",
      type: "global-variables",
      exportedAt: new Date().toISOString(),
      variables: globalVars
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'global-variables.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${Object.keys(globalVars).length} variables`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);
          
          if (!importData.variables || typeof importData.variables !== 'object') {
            throw new Error('Invalid file format');
          }

          // Merge with existing variables
          const mergedVars = { ...globalVars, ...importData.variables };
          
          // Ensure all environments exist for imported variables
          Object.keys(importData.variables).forEach(varName => {
            projectEnvironments.forEach(env => {
              if (!mergedVars[varName][env]) {
                mergedVars[varName][env] = "";
              }
            });
          });

          onSave(mergedVars);
          showNotification(`Imported ${Object.keys(importData.variables).length} variables`);
        } catch (error) {
          showNotification("Error: Invalid file format");
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const addVariable = () => {
    if (!newVarName.trim()) return;
    if (globalVars[newVarName]) {
      alert("Variable already exists");
      return;
    }
    const updated = { ...globalVars };
    updated[newVarName] = {};
    projectEnvironments.forEach(env => {
      updated[newVarName][env] = "";
    });
    onSave(updated);
    setNewVarName("");
    setIsAdding(false);
  };

  const updateVarValue = (varName, env, value) => {
    const updated = { ...globalVars };
    updated[varName] = { ...updated[varName], [env]: value };
    onSave(updated);
  };

  const deleteVariable = (varName) => {
    if (!confirm(`Delete variable ${varName}?`)) return;
    const updated = { ...globalVars };
    delete updated[varName];
    onSave(updated);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
      {/* Success/Error Message */}
      {showMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg animate-fadeIn">
          {message}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Global Variables</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={Object.keys(globalVars).length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              Object.keys(globalVars).length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex gap-4 items-end animate-fadeIn">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="e.g. supportNumber or API_KEY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addVariable}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Object.keys(globalVars).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Variable</th>
                {projectEnvironments.map(env => (
                  <th key={env} className="text-left py-3 px-4 font-semibold text-gray-700">{env}</th>
                ))}
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(globalVars).map(varName => (
                <tr key={varName} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 px-4 font-mono text-blue-600 font-medium">{`{{${varName}}}`}</td>
                  {projectEnvironments.map(env => (
                    <td key={env} className="py-2 px-4">
                      <input
                        key={`${varName}-${env}`}
                        type="text"
                        value={globalVars[varName][env] || ""}
                        onChange={(e) => updateVarValue(varName, env, e.target.value)}
                        placeholder={`Value for ${env}`}
                        className="w-full px-2 py-1 border border-transparent hover:border-gray-200 focus:border-blue-400 rounded transition-all duration-200 focus:outline-none focus:bg-white bg-gray-50/50 hover:shadow-sm"
                      />
                    </td>
                  ))}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => deleteVariable(varName)}
                      className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No global variables defined yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add variables to reuse values across mock responses.</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          How to use
        </h4>
        <p className="text-blue-700 text-sm leading-relaxed">
          Reference global variables in your response bodies using double curly braces: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">{"{{VARIABLE_NAME}}"}</code>.
          When a request is received, the variable will be automatically replaced with the value defined for that environment.
        </p>
      </div>
    </div>
  );
};

const ProjectDetails = ({ user, onLogout }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [activeTab, setActiveTab] = useState("endpoints");
  const [showCreateEndpointModal, setShowCreateEndpointModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  
  // Form states for endpoint creation
  const [newEndpointName, setNewEndpointName] = useState("/");
  const [newEndpointMethod, setNewEndpointMethod] = useState("GET");
  const [newEndpointDelay, setNewEndpointDelay] = useState("0.00");
  const [newEndpointStatus, setNewEndpointStatus] = useState("200");
  const [newEndpointHeaders, setNewEndpointHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [newEndpointBody, setNewEndpointBody] = useState('{\n  "status": "Awesome!"\n}');
  const [newRuleDescription, setNewRuleDescription] = useState("");
  const [newMatchType, setNewMatchType] = useState("path_exact");
  const [newResponseMode, setNewResponseMode] = useState("single");
  const [newIsFile, setNewIsFile] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [editingApiId, setEditingApiId] = useState(null);
  const [stateConditions, setStateConditions] = useState([]);
  const [requestConditions, setRequestConditions] = useState([]);
  const [newParamName, setNewParamName] = useState("");
  const [newParamOperator, setNewParamOperator] = useState("equals");
  const [newParamValue, setNewParamValue] = useState("");
  const [newHeaderName, setNewHeaderName] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [weightedResponses, setWeightedResponses] = useState([{ weight: 100, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' }]);
  const [importMessage, setImportMessage] = useState("");
  const [showImportMessage, setShowImportMessage] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const [showMockingRulesOnboarding, setShowMockingRulesOnboarding] = useState(false);
  const [onboardingPrefill, setOnboardingPrefill] = useState(null);
  const [queryHeaderRuleTrigger, setQueryHeaderRuleTrigger] = useState(0);
  const [tempActiveId, setTempActiveId] = useState(`temp_${Date.now()}`);
  const [selectedEnvironment, setSelectedEnvironmentState] = useState('Default');
  const [projectEnvironments, setProjectEnvironments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [showDynamicValueDropdown, setShowDynamicValueDropdown] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState(0);
  const [copiedProjectUrl, setCopiedProjectUrl] = useState(null);
  const [mockingRulesMessage, setMockingRulesMessage] = useState(null);
  const [globalVars, setGlobalVars] = useState({});
  
  // Missing state variables from UserDashboard
  const [rulesEnabled, setRulesEnabled] = useState(true);
  
  useSyncQueryHeaderRules();

  useEffect(() => {
    if (mockingRulesMessage) {
      const timer = setTimeout(() => setMockingRulesMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [mockingRulesMessage]);

  // Load project and endpoints data
  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
    const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
    
    const foundProject = projects.find(p => p.name.replace(/\s+/g, '-').toLowerCase() === projectName);
    if (!foundProject) {
      navigate('/dashboard');
      return;
    }
    
    setProject(foundProject);
    const projectId = foundProject.id;
    // Filter endpoints by projectId to ensure project-specific data
    const currentEnv = getSelectedEnvironment(projectId);
    const projectEndpoints = allEndpoints.filter(e => 
      e.projectId === projectId && e.environment === currentEnv
    );
    setEndpoints(projectEndpoints);
    
    // Initialize environment management
    setSelectedEnvironmentState(getSelectedEnvironment(projectId));
    setProjectEnvironments(getProjectEnvironments(projectId));
    
    // Register project mapping for browser access (optional - don't block if server unavailable)
    fetch('http://localhost:3001/api/projects/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: foundProject.id,
        projectName: foundProject.name
      })
    }).catch(error => {
      // Silently ignore registration errors - this is optional functionality
      console.warn('Project registration failed (server may not be running):', error.message);
    });
    
    // Clear import state when switching projects to prevent data bleeding
    setImportMessage("");
    setShowImportMessage(false);
    
    // Reset form states for clean project switching
    resetForm();

    // Load global variables for the project
    const fetchGlobalVars = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/variables/${projectName}`);
        if (response.ok) {
          const vars = await response.json();
          setGlobalVars(vars);
        }
      } catch (error) {
        console.error('Error fetching global variables:', error);
      }
    };
    fetchGlobalVars();
  }, [projectName, navigate]);

  const handleEnvironmentChange = (environment) => {
    setSelectedEnvironmentState(environment);
    setActiveTab("endpoints"); // Reset to endpoints tab when environment changes
    if (project?.id) {
      setSelectedEnvironment(project.id, environment);
    }
  };

  // Filter endpoints by environment
  useEffect(() => {
    if (project?.id && selectedEnvironment) {
      const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
      const environmentEndpoints = allEndpoints.filter(e => 
        e.projectId === project.id && e.environment === selectedEnvironment
      );
      setEndpoints(environmentEndpoints);
    }
  }, [project, selectedEnvironment]);

  // Handle onboarding pre-fills
  useEffect(() => {
    if (onboardingPrefill && !editingEndpoint && showCreateEndpointModal) {
      if (onboardingPrefill.delay) setNewEndpointDelay(onboardingPrefill.delay);
      if (onboardingPrefill.body) setNewEndpointBody(onboardingPrefill.body);
    }
  }, [onboardingPrefill, editingEndpoint, showCreateEndpointModal]);


  // Test server connectivity function
  const testServerConnection = async () => {
    console.log('🔍 Testing server connection...');
    try {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server connection successful:', data);
        alert('✅ Server is running and accessible!');
      } else {
        console.error('❌ Server responded with error:', response.status);
        alert(`❌ Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      alert(`❌ Cannot connect to server: ${error.message}`);
    }
  };

  const fetchRequestLogs = async (projectName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/logs/${projectName}`);
      if (response.ok) {
        const logs = await response.json();
        setRequestLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching request logs:', error);
    }
  };

  const fetchAnalytics = async (projectName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${projectName}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === "logs" && project?.name) {
      fetchRequestLogs(project.name);
    } else if (activeTab === "analytics" && project?.name) {
      fetchAnalytics(project.name);
    }
  }, [activeTab, project?.name, selectedEnvironment]);

  const handleCreateEndpoint = async () => {
    if (isCreatingEndpoint) return;
    setIsCreatingEndpoint(true);
    
    if (!newEndpointName.trim() || !project) {
      alert('Please enter a valid endpoint path');
      setIsCreatingEndpoint(false);
      return;
    }

    const isEditMode = Boolean(editingEndpoint);
    
    try {
      // Check server connectivity first
      try {
        const healthCheck = await fetch('http://localhost:3001/health');
        if (!healthCheck.ok) {
          throw new Error('Server not responding');
        }
      } catch (healthError) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:3001');
      }

      const requestData = {
        projectName: project.name,
        projectId: project.id,
        method: newEndpointMethod,
        path: newEndpointName,
        delay: parseInt(newEndpointDelay) || 0,
        status: newEndpointStatus,
        headers: newEndpointHeaders,
        body: newEndpointBody,
        description: newRuleDescription,
        matchType: newMatchType,
        responseMode: newResponseMode,
        isFile: newIsFile,
        stateConditions: stateConditions.filter(c => c.variable && c.type && c.operator),
        requestConditions: requestConditions,
        weightedResponses: weightedResponses,
        paramName: newParamName,
        paramOperator: newParamOperator,
        paramValue: newParamValue,
        headerName: newHeaderName,
        headerValue: newHeaderValue,
        environment: selectedEnvironment,
      };

      const url = isEditMode 
        ? `http://localhost:3001/api/endpoints/${editingEndpoint.backendId}`
        : 'http://localhost:3001/api/endpoints';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (isEditMode) {
        // Update existing endpoint - preserve backendId
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
          weightedResponses: weightedResponses,
          backendId: editingEndpoint.backendId  // Preserve original backendId
        };


        setEndpoints(prev => prev.map(ep => ep.id === editingEndpoint.id ? updatedEndpoint : ep));
        
        const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
        localStorage.setItem('beeceptor_endpoints', 
          JSON.stringify(allEndpoints.map(ep => ep.id === editingEndpoint.id ? updatedEndpoint : ep))
        );
        
        setImportMessage('✅ API endpoint updated successfully!');
      } else {
        // Create new endpoint
        const newEndpointId = `ep_${Date.now()}`;
        const finalRuleId = result.rule.id;

        // Sync query/header rules from tempActiveId or editing ID to final ID
        const allQhRules = getQueryHeaderRules();
        const updatedQhRules = allQhRules.map(r => 
          r.endpointId === tempActiveId ? { ...r, endpointId: finalRuleId } : r
        );
        saveQueryHeaderRules(updatedQhRules);

        const newEndpoint = {
          id: newEndpointId,
          backendId: finalRuleId,
          name: newEndpointName,
          projectId: project.id,
          environment: selectedEnvironment, // Add environment to new endpoints
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
          weightedResponses: weightedResponses,
        };


        setEndpoints(prev => [...prev, newEndpoint]);
        
        const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
        localStorage.setItem('beeceptor_endpoints', JSON.stringify([...allEndpoints, newEndpoint]));
        
        const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
        const updatedProjects = projects.map(p => 
          p.id === project.id ? { ...p, endpointCount: p.endpointCount + 1 } : p
        );
        localStorage.setItem('beeceptor_projects', JSON.stringify(updatedProjects));
        setProject(prev => ({ ...prev, endpointCount: prev.endpointCount + 1 }));
        
        setImportMessage('✅ API endpoint created successfully!');
      }

      resetForm();
      setShowCreateEndpointModal(false);
      setShowImportMessage(true);
      setTimeout(() => setShowImportMessage(false), 3000);
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} endpoint: ${error.message}`);
    } finally {
      setIsCreatingEndpoint(false);
    }
  };

  const resetForm = () => {
    setNewEndpointName("/");
    setNewEndpointMethod("GET");
    setNewEndpointDelay("0.00");
    setNewEndpointStatus("200");
    setNewEndpointHeaders('{\n  "Content-Type": "application/json"\n}');
    setNewEndpointBody('{\n  "status": "Awesome!"\n}');
    setNewRuleDescription("");
    setNewMatchType("path_exact");
    setNewResponseMode("single");
    setNewIsFile(false);
    setEditingEndpoint(null);
    setEditingApiId(null);
    setStateConditions([]);
    setRequestConditions([]);
    setNewParamName("");
    setNewParamOperator("equals");
    setNewParamValue("");
    setNewHeaderName("");
    setNewHeaderValue("");
    setWeightedResponses([{ weight: 100, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' }]);
    setIsCreatingEndpoint(false);
    setShowMethodDropdown(false);
    setOnboardingPrefill(null);

    // Cleanup temp rules
    const currentRules = getQueryHeaderRules();
    const filteredRules = currentRules.filter(r => !r.endpointId.startsWith('temp_'));
    saveQueryHeaderRules(filteredRules);
    setTempActiveId(`temp_${Date.now()}`);
  };

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


  const handleDeleteEndpoint = (endpointId) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;
    const updatedEndpoints = deleteEndpointFromEnvironment(endpointId);
    setEndpoints(updatedEndpoints);
    if (project) {
      const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
      const updatedProjects = projects.map(p => 
        p.id === project.id ? { ...p, endpointCount: Math.max(0, p.endpointCount - 1) } : p
      );
      localStorage.setItem('beeceptor_projects', JSON.stringify(updatedProjects));
      setProject(prev => ({ ...prev, endpointCount: Math.max(0, prev.endpointCount - 1) }));
    }
  };

  // Missing handleEditEndpoint function from UserDashboard
  const handleEditEndpoint = (endpoint) => {
    setEditingEndpoint(endpoint);
    setNewEndpointName(endpoint.name);
    setNewEndpointMethod(endpoint.method);
    setNewEndpointDelay(endpoint.delay || "0.00");
    setNewEndpointStatus(endpoint.status || "200");
    setNewEndpointHeaders(endpoint.headers || '{\n  "Content-Type": "application/json"\n}');
    setNewEndpointBody(endpoint.body || '{\n  "status": "Awesome!"\n}');
    setNewRuleDescription(endpoint.description || "");
    setNewMatchType(endpoint.matchType || "path_exact");
    setNewResponseMode(endpoint.responseMode || "single");
    setNewIsFile(endpoint.isFile || false);
    const safeFile = endpoint.uploadedFile && typeof endpoint.uploadedFile === 'object' && endpoint.uploadedFile.name ? endpoint.uploadedFile : null;
    setUploadedFile(safeFile);
    setStateConditions(endpoint.stateConditions || []);
    setRequestConditions(endpoint.requestConditions || []);
    setNewParamName(endpoint.paramName || "");
    setNewParamOperator(endpoint.paramOperator || "equals");
    setNewParamValue(endpoint.paramValue || "");
    setNewHeaderName(endpoint.headerName || "");
    setNewHeaderValue(endpoint.headerValue || "");
    setWeightedResponses(endpoint.weightedResponses || [{ weight: 100, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' }]);
    setTempActiveId(endpoint.id);
    setShowCreateEndpointModal(true);
  };

  // Content-Type presets
  const contentTypePresets = [
    { label: "JSON (application/json)", value: '{\n  "Content-Type": "application/json;charset=utf-8"\n}' },
    { label: "XML (application/xml)", value: '{\n  "Content-Type": "application/xml;charset=utf-8"\n}' },
    { label: "HTML (text/html)", value: '{\n  "Content-Type": "text/html;charset=utf-8"\n}' },
    { label: "JavaScript (text/javascript)", value: '{\n  "Content-Type": "text/javascript;charset=utf-8"\n}' },
    { label: "CSV (text/csv)", value: '{\n  "Content-Type": "text/csv;charset=utf-8"\n}' },
    { label: "Plain Text (text/plain)", value: '{\n  "Content-Type": "text/plain"\n}' },
  ];

  // Dynamic value options with template syntax
  const dynamicValues = [
    // Built-in Helpers
    { label: 'Current Timestamp', value: '{{timestamp}}' },
    { label: 'Random UUID', value: '{{uuid}}' },
    { label: 'Random Number', value: '{{randomNumber}}' },
    { label: 'Random Number (Range)', value: '{{randomNumber 1 100}}' },
    { label: 'Current Date', value: '{{currentDate}}' },
    { label: 'Current Time', value: '{{currentTime}}' },
    { label: 'Request IP', value: '{{request.ip}}' },
    { label: 'Random String', value: '{{randomString}}' },
    { label: 'Random String (Length)', value: '{{randomString 8}}' },
    { label: 'Random Boolean', value: '{{randomBoolean}}' },
    
    // Math Operations
    { label: 'Add Numbers', value: '{{add 10 5}}' },
    { label: 'Subtract Numbers', value: '{{subtract 10 5}}' },
    { label: 'Multiply Numbers', value: '{{multiply 10 5}}' },
    { label: 'Divide Numbers', value: '{{divide 10 5}}' },
    
    // String Manipulation
    { label: 'Uppercase Text', value: '{{uppercase "hello world"}}' },
    { label: 'Lowercase Text', value: '{{lowercase "HELLO WORLD"}}' },
    { label: 'Capitalize Text', value: '{{capitalize "hello world"}}' },
    
    // Date Formatting
    { label: 'Format Date', value: '{{formatDate timestamp "YYYY-MM-DD"}}' },
    { label: 'Format DateTime', value: '{{formatDate timestamp "YYYY-MM-DD HH:mm:ss"}}' },
    
    // Request Context
    { label: 'Request Method', value: '{{request.method}}' },
    { label: 'Request Path', value: '{{request.path}}' },
    { label: 'Request Header', value: '{{request.headers.authorization}}' },
    { label: 'Query Parameter', value: '{{request.query.id}}' },
    { label: 'Request Body Field', value: '{{request.body.username}}' },
    
    // Environment
    { label: 'Current Environment', value: '{{environment}}' },
    
    // Conditional Logic Examples
    { label: 'If-Else Block', value: '{{#if equals request.method "POST"}}\n  "message": "POST request"\n{{else}}\n  "message": "Other request"\n{{/if}}' },
    { label: 'Header Check', value: '{{#if contains request.headers.user-agent "Chrome"}}\n  "browser": "Chrome"\n{{else}}\n  "browser": "Other"\n{{/if}}' },
    
    // Loop Examples
    { label: 'Loop Array', value: '{{#each request.body.items}}\n  {\n    "index": {{@index}},\n    "item": "{{this}}"\n  }{{#unless @last}},{{/unless}}\n{{/each}}' },
    { label: 'Loop with Conditions', value: '{{#each request.body.users}}\n  {{#if @first}}[{{/if}}\n  {\n    "id": {{@index}},\n    "name": "{{this.name}}"\n  }{{#unless @last}},{{/unless}}\n  {{#if @last}}]{{/if}}\n{{/each}}' },
    
    // Faker.js Helpers - Person
    { label: 'Faker: First Name', value: '{{faker "person.firstName"}}' },
    { label: 'Faker: Last Name', value: '{{faker "person.lastName"}}' },
    { label: 'Faker: Full Name', value: '{{faker "person.fullName"}}' },
    { label: 'Faker: Job Title', value: '{{faker "person.jobTitle"}}' },
    { label: 'Faker: Gender', value: '{{faker "person.gender"}}' },
    
    // Faker.js Helpers - Internet
    { label: 'Faker: Email', value: '{{faker "internet.email"}}' },
    { label: 'Faker: Username', value: '{{faker "internet.username"}}' },
    { label: 'Faker: Password', value: '{{faker "internet.password"}}' },
    { label: 'Faker: URL', value: '{{faker "internet.url"}}' },
    
    // Faker.js Helpers - Contact
    { label: 'Faker: Phone', value: '{{faker "phone.number"}}' },
    
    // Faker.js Helpers - Location
    { label: 'Faker: Street Address', value: '{{faker "location.streetAddress"}}' },
    { label: 'Faker: City', value: '{{faker "location.city"}}' },
    { label: 'Faker: State', value: '{{faker "location.state"}}' },
    { label: 'Faker: Zip Code', value: '{{faker "location.zipCode"}}' },
    { label: 'Faker: Country', value: '{{faker "location.country"}}' },
    
    // Faker.js Helpers - Company
    { label: 'Faker: Company Name', value: '{{faker "company.name"}}' },
    { label: 'Faker: Company Phrase', value: '{{faker "company.catchPhrase"}}' },
    
    // Faker.js Helpers - Finance
    { label: 'Faker: Amount', value: '{{faker "finance.amount"}}' },
    { label: 'Faker: Credit Card', value: '{{faker "finance.creditCardNumber"}}' },
    
    // Faker.js Helpers - Date
    { label: 'Faker: Past Date', value: '{{faker "date.past"}}' },
    { label: 'Faker: Future Date', value: '{{faker "date.future"}}' },
    
    // Faker.js Helpers - Lorem
    { label: 'Faker: Lorem Word', value: '{{faker "lorem.word"}}' },
    { label: 'Faker: Lorem Sentence', value: '{{faker "lorem.sentence"}}' },
    { label: 'Faker: Lorem Paragraph', value: '{{faker "lorem.paragraph"}}' },
    
    // Global Variables
    ...Object.keys(globalVars).map(varName => ({
      label: `Global: ${varName}`,
      value: `{{globals.${varName}}}`
    }))
  ];

  // Refs for cursor-aware editors
  const responseBodyRef = useRef(null);
  const [cursorMessage, setCursorMessage] = useState("");

  const insertDynamicValue = (value) => {
    const textarea = responseBodyRef.current;
    if (!textarea) {
      setCursorMessage("Place the cursor where you want to insert the dynamic value.");
      setTimeout(() => setCursorMessage(""), 3000);
      setShowDynamicValueDropdown(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = newEndpointBody;
    
    // Insert at cursor position
    const newValue = currentValue.substring(0, start) + value + currentValue.substring(end);
    setNewEndpointBody(newValue);
    
    // Restore cursor position after the inserted value
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + value.length, start + value.length);
    }, 0);
    
    setShowDynamicValueDropdown(false);
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

  const addWeightedResponse = () => {
    if (weightedResponses.length >= 4) return;
    
    const newResponses = [...weightedResponses];
    
    // Exact weight distribution logic
    if (newResponses.length === 1) {
      // Going from 1 to 2 responses: 50%, 50%
      newResponses[0].weight = 50;
      newResponses.push({ weight: 50, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' });
    } else if (newResponses.length === 2) {
      // Going from 2 to 3 responses: 50%, 25%, 25%
      newResponses[1].weight = 25;
      newResponses.push({ weight: 25, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' });
    } else if (newResponses.length === 3) {
      // Going from 3 to 4 responses: 50%, 25%, 12.5%, 12.5%
      newResponses[2].weight = 12.5;
      newResponses.push({ weight: 12.5, status: '200', headers: '{\n  "Content-Type": "application/json"\n}', body: '{\n  "status": "Awesome!"\n}' });
    }
    
    setWeightedResponses(newResponses);
    setActiveResponseTab(newResponses.length - 1); // Switch to the new tab
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

  // Strict JSON schema validation
  const validateImportData = (data) => {
    // Check if empty file
    if (!data || (typeof data === 'string' && data.trim() === '')) {
      return { valid: false, error: 'Empty file' };
    }

    // Check single root object
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { valid: false, error: 'Invalid JSON format' };
    }
    
    // Check version
    if (!data.version || data.version !== '1.0') {
      return { valid: false, error: 'Missing or unsupported version' };
    }
    
    // Check project object
    if (!data.project || typeof data.project !== 'object') {
      return { valid: false, error: 'Missing project object' };
    }
    
    // Check project name (required)
    if (!data.project.name || typeof data.project.name !== 'string') {
      return { valid: false, error: 'Missing project name' };
    }
    
    // Check APIs array
    if (!data.apis || !Array.isArray(data.apis)) {
      return { valid: false, error: 'Missing APIs array' };
    }
    
    // Require at least 1 API
    if (data.apis.length === 0) {
      return { valid: false, error: 'At least one API is required' };
    }
    
    // Validate each API
    const requiredApiFields = ['id', 'name', 'method', 'status', 'headers', 'body', 'delay', 'matchType', 'responseMode', 'isFile', 'createdDate'];
    for (let i = 0; i < data.apis.length; i++) {
      const api = data.apis[i];
      if (typeof api !== 'object' || api === null) {
        return { valid: false, error: `API ${i + 1}: Invalid format` };
      }
      
      for (const field of requiredApiFields) {
        if (api[field] === undefined || api[field] === null) {
          return { valid: false, error: `API ${i + 1}: Missing ${field}` };
        }
      }
    }
    
    return { valid: true };
  };

  // Export functionality - Only enabled if APIs exist
  const handleExportProject = () => {
    if (!project) {
      setImportMessage('Error: No project data');
      setShowImportMessage(true);
      setTimeout(() => setShowImportMessage(false), 3000);
      return;
    }

    // Block export if no APIs
    if (!endpoints || endpoints.length === 0) {
      setImportMessage('No APIs to export');
      setShowImportMessage(true);
      setTimeout(() => setShowImportMessage(false), 3000);
      return;
    }

    const exportData = {
      version: '1.0',
      project: {
        id: project.id,
        name: project.name,
        createdDate: project.createdDate,
        exportedAt: new Date().toISOString()
      },
      apis: endpoints.map(endpoint => ({
        id: endpoint.id,
        name: endpoint.name,
        method: endpoint.method,
        status: Number(endpoint.status),
        headers: endpoint.headers,
        body: endpoint.body,
        delay: Number(endpoint.delay) || 0,
        description: endpoint.description || '',
        matchType: endpoint.matchType,
        responseMode: endpoint.responseMode,
        isFile: Boolean(endpoint.isFile),
        createdDate: endpoint.createdDate
      }))
    };

    try {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setImportMessage('Error: Failed to export project');
      setShowImportMessage(true);
      setTimeout(() => setShowImportMessage(false), 3000);
    }
  };

  // Import functionality - Fixed file upload handling
  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    // Fix: Ensure the input change event is properly handled
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        setImportMessage('Error: No file selected');
        setShowImportMessage(true);
        setTimeout(() => setShowImportMessage(false), 3000);
        return;
      }

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        setImportMessage('Error: Please select a valid JSON file');
        setShowImportMessage(true);
        setTimeout(() => setShowImportMessage(false), 3000);
        return;
      }

      // Check if file is empty
      if (file.size === 0) {
        setImportMessage('Error: Empty file');
        setShowImportMessage(true);
        setTimeout(() => setShowImportMessage(false), 3000);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileContent = event.target.result;
          
          // Check for empty content
          if (!fileContent || fileContent.trim() === '') {
            throw new Error('Empty file');
          }

          let importData;
          try {
            importData = JSON.parse(fileContent);
          } catch (parseError) {
            throw new Error('Invalid JSON format');
          }
          
          // Strict validation
          const validation = validateImportData(importData);
          if (!validation.valid) {
            throw new Error(validation.error);
          }

          // Import to current project instead of creating new project
          const currentProjectId = project.id;
          
          // Process APIs for current project
          const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
          const newApis = importData.apis.map((api, index) => {
            // Safe parsing for headers and body
            let headers = api.headers;
            let body = api.body;
            
            if (typeof headers === 'string') {
              try {
                JSON.parse(headers); // Validate JSON
              } catch {
                headers = '{"Content-Type": "application/json"}';
              }
            }
            
            return {
              id: `ep_${Date.now()}_${index}`,
              backendId: null, // Will be set after server sync
              name: api.name,
              method: api.method,
              status: String(Number(api.status)),
              headers: headers,
              body: body,
              delay: String(Number(api.delay) || 0),
              description: api.description || '',
              matchType: api.matchType,
              responseMode: api.responseMode,
              isFile: Boolean(api.isFile),
              projectId: currentProjectId, // Link to current project
              environment: selectedEnvironment, // Add to current environment
              createdDate: new Date().toISOString().split('T')[0],
              requestCount: 0
            };
          });

          // Save APIs to current project
          localStorage.setItem('beeceptor_endpoints', JSON.stringify([...allEndpoints, ...newApis]));
          
          // Update current project endpoint count
          const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
          const updatedProjects = projects.map(p => 
            p.id === currentProjectId ? { ...p, endpointCount: p.endpointCount + newApis.length } : p
          );
          localStorage.setItem('beeceptor_projects', JSON.stringify(updatedProjects));
          
          // Update local state
          setEndpoints(prev => [...prev, ...newApis]);
          setProject(prev => ({ ...prev, endpointCount: prev.endpointCount + newApis.length }));

          // Sync to server and update backend IDs
          const syncToServer = async () => {
            const updatedApis = [];
            for (let i = 0; i < newApis.length; i++) {
              const api = newApis[i];
              try {
                const response = await fetch('http://localhost:3001/api/endpoints', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    projectName: project.name,
                    projectId: project.id,
                    method: api.method,
                    path: api.name,
                    delay: Number(api.delay),
                    status: api.status,
                    headers: api.headers,
                    body: api.body,
                    description: api.description,
                    matchType: api.matchType,
                    responseMode: api.responseMode,
                    isFile: api.isFile
                  })
                });
                if (response.ok) {
                  const result = await response.json();
                  api.backendId = result.rule?.id;
                }
                updatedApis.push(api);
              } catch (error) {
                console.error('Server sync error:', error);
                updatedApis.push(api);
              }
            }
            
            // Update localStorage with backend IDs
            const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
            const finalEndpoints = allEndpoints.map(ep => {
              const updated = updatedApis.find(ua => ua.id === ep.id);
              return updated || ep;
            });
            localStorage.setItem('beeceptor_endpoints', JSON.stringify(finalEndpoints));
          };
          syncToServer();

          // Success message
          setImportMessage(`Successfully imported ${newApis.length} APIs to current project`);
          setShowImportMessage(true);
          setTimeout(() => {
            setShowImportMessage(false);
          }, 3000);
          
        } catch (error) {
          setImportMessage(`Error: ${error.message}`);
          setShowImportMessage(true);
          setTimeout(() => setShowImportMessage(false), 4000);
        }
      };
      
      reader.onerror = () => {
        setImportMessage('Error: Failed to read file');
        setShowImportMessage(true);
        setTimeout(() => setShowImportMessage(false), 3000);
      };
      
      reader.readAsText(file);
    });
    
    // Trigger file selection
    input.click();
  };

  const handleSaveGlobalVars = async (newVars) => {
    setGlobalVars(newVars);
    try {
      await fetch(`http://localhost:3001/api/variables/${project.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: newVars })
      });
    } catch (error) {
      console.error('Error saving global variables:', error);
    }
  };


  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">

      <section className="flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-8 pb-16">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-3 py-2 rounded-md gap-2 text-white bg-blue-600 transition-colors mb-8 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </button>

          {/* Project Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3 leading-tight">
                {project.name}
              </h1>
              {/* <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-700 text-sm font-mono">
                  {project.url || generateProjectUrl(project.name)}
                </span>
                <button
                  onClick={() => handleCopyProjectUrl(
                    project.url || generateProjectUrl(project.name),
                    project.id
                  )}
                  className="text-gray-800 transition-colors cursor-pointer"
                  title="Copy Project URL"
                >
                  {copiedProjectUrl === project.id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div> */}
              <p className="text-gray-700 text-md">
                {endpoints.length} endpoints in this project
              </p>
            </div>

            <div className="flex gap-4 ">
              <button
                onClick={() => setShowMockingRulesOnboarding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create API
              </button>

              <button
                onClick={handleImportProject}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Import APIs
              </button>
              <button
                onClick={handleExportProject}
                disabled={endpoints.length === 0}
                className={`px-5 py-2 rounded-lg text-lg font-medium transition-all flex items-center gap-2 ${
                  endpoints.length === 0 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                title={endpoints.length === 0 ? 'No APIs to export' : 'Export APIs'}
              >
                <Download className="w-5 h-5" />
                Export APIs
              </button>
              <button
                onClick={() => {
                  setActiveTab("logs");
                  fetchRequestLogs(project.name);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Activity className="w-5 h-5" />
                View Request Logs
              </button>
            </div>
          </div>

          {/* Environment Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <EnvironmentSelector
              selectedEnvironment={selectedEnvironment}
              onEnvironmentChange={handleEnvironmentChange}
              environments={projectEnvironments}
              onAddEnvironment={(envName) => {
                const updated = [...projectEnvironments, envName];
                setProjectEnvironments(updated);
                addEnvironmentToProject(project.id, envName);
              }}
              onRemoveEnvironment={(envName) => {
                const updated = projectEnvironments.filter(e => e !== envName);
                setProjectEnvironments(updated);
                removeEnvironmentFromProject(project.id, envName);
                // If we removed the current environment, switch to Default
                if (selectedEnvironment === envName) {
                  handleEnvironmentChange('Default');
                }
              }}
              // onCopyEnvironment={(fromEnv, toEnvName) => {
              //   if (toEnvName && toEnvName.trim() && !projectEnvironments.includes(toEnvName)) {
              //     cloneEnvironment(project.id, fromEnv, toEnvName);
              //     const updated = [...projectEnvironments, toEnvName];
              //     setProjectEnvironments(updated);
              //     // Refresh endpoints to show the cloned ones
              //     const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
              //     const projectEndpoints = allEndpoints.filter(e => e.projectId === project.id);
              //     setEndpoints(projectEndpoints);
              //   }
              // }}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "endpoints"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              Endpoints
            </button>
            <button
              onClick={() => {
                setActiveTab("logs");
                fetchRequestLogs(project.name);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              Request Logs ({requestLogs.filter(log => (log.environment || "Default") === selectedEnvironment).length})
            </button>
            <button
              onClick={() => {
                setActiveTab("analytics");
                fetchAnalytics(project.name);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("variables")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "variables"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              Variables
            </button>
          </div>

          {/* Import Success/Error Message */}
          {showImportMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              importMessage.includes('Error') 
                ? 'bg-red-100 border border-red-300 text-red-700'
                : 'bg-green-100 border border-green-300 text-green-700'
            }`}>
              {importMessage}
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === "endpoints" && (
            <>
              {endpoints.length > 0 ? (
                <div className="bg-white border border-gray-400 bg-gray-100 rounded-2xl overflow-hidden mb-8">
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
                        {endpoints.map((endpoint) => (
                          <tr
                            key={endpoint.id}
                            className="border border-gray-400 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-gray-900 font-mono">
                                  {endpoint.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700 text-sm font-mono">
                                    http://localhost:3001/{project.name}{endpoint.name}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const url = `http://localhost:3001/${project.name}${endpoint.name}`;
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
                                    ? "bg-blue-600 border-blue-600"
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
                                  className="text-gray-700 hover:text-blue-600 transition-colors"
                                  title="Edit endpoint"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEndpoint(endpoint.id)}
                                  className="text-gray-700 hover:text-red-400 transition-colors"
                                  title="Delete endpoint"
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
                  <div className="bg-gray-500 rounded-lg p-8 text-center">
                    <p className="text-white text-lg mb-4">
                      No APIs created yet in this project.
                    </p>
                    <button
                      onClick={() => setShowMockingRulesOnboarding(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First API
                    </button>

                  </div>
                </div>
              )}
            </>
          )}

          {/* Request Logs Tab */}
          {activeTab === "logs" && (
            <>
              {requestLogs.filter(log => (log.environment || "Default") === selectedEnvironment).length > 0 ? (
                <div className="bg-white border border-gray-400 bg-gray-100 rounded-2xl overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-400">
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Method
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Endpoint
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Time
                          </th>
                          <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                            Status
                          </th>
                          <th className="text-right px-6 py-4 text-gray-900 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestLogs
                          .filter(log => (log.environment || "Default") === selectedEnvironment)
                          .map((log) => (
                          <tr
                            key={log.id}
                            className="border border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedLog(log)}
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 border-2 text-white rounded-lg text-sm font-medium ${
                                  log.method === "GET"
                                    ? "bg-green-600 border-green-600"
                                    : log.method === "POST"
                                    ? "bg-blue-600 border-blue-600"
                                    : log.method === "PUT"
                                    ? "bg-yellow-500 border-yellow-500"
                                    : log.method === "DELETE"
                                    ? "bg-red-600 border-red-600"
                                    : "bg-gray-500 border-gray-500"
                                }`}
                              >
                                {log.method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900 font-mono text-sm">
                                {log.path}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-800 text-sm">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  log.status >= 200 && log.status < 300
                                    ? "bg-green-100 text-green-800"
                                    : log.status >= 400
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLog(log);
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="bg-gray-500 rounded-lg p-8 text-center">
                    <Activity className="w-12 h-12 text-white mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">No requests logged yet</p>
                    <p className="text-gray-300 text-sm">
                      Make requests to your endpoints to see them here
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <>
              {(() => {
                const filteredAnalytics = analytics.filter(a => (a.environment || "Default") === selectedEnvironment);
                return filteredAnalytics.length > 0 ? (
                  <>
                    {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium mb-1">Total Requests</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {filteredAnalytics.reduce((sum, a) => sum + a.totalCalls, 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium mb-1">Avg Response Time</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {filteredAnalytics.length > 0
                              ? Math.round(
                                  filteredAnalytics.reduce((sum, a) => sum + a.avgResponseTime, 0) / filteredAnalytics.length
                                )
                              : 0}
                            <span className="text-lg text-gray-600 ml-1">ms</span>
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium mb-1">Total Errors</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {filteredAnalytics.reduce((sum, a) => sum + a.errorCount, 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint-wise Analytics Table */}
                  <div className="bg-white border border-gray-400 bg-gray-100 rounded-2xl overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-400">
                            <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                              Method
                            </th>
                            <th className="text-left px-6 py-4 text-gray-900 font-semibold">
                              Endpoint
                            </th>
                            <th className="text-center px-6 py-4 text-gray-900 font-semibold">
                              Total Calls
                            </th>
                            <th className="text-center px-6 py-4 text-gray-900 font-semibold">
                              Avg Response Time
                            </th>
                            <th className="text-center px-6 py-4 text-gray-900 font-semibold">
                              Errors (4xx/5xx)
                            </th>
                            <th className="text-center px-6 py-4 text-gray-900 font-semibold">
                              Error Rate
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAnalytics.map((item, index) => {
                            const errorRate = item.totalCalls > 0 
                              ? ((item.errorCount / item.totalCalls) * 100).toFixed(1)
                              : 0;
                            
                            return (
                              <tr
                                key={index}
                                className="border border-gray-400 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-3 py-1 border-2 text-white rounded-lg text-sm font-medium ${
                                      item.method === "GET"
                                        ? "bg-green-600 border-green-600"
                                        : item.method === "POST"
                                        ? "bg-blue-600 border-blue-600"
                                        : item.method === "PUT"
                                        ? "bg-yellow-500 border-yellow-500"
                                        : item.method === "DELETE"
                                        ? "bg-red-600 border-red-600"
                                        : "bg-gray-500 border-gray-500"
                                    }`}
                                  >
                                    {item.method}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-900 font-mono text-sm">
                                    {item.path}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-gray-900 font-semibold">
                                    {item.totalCalls.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-gray-900 font-semibold">
                                    {item.avgResponseTime} ms
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                      item.errorCount > 0
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {item.errorCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                      parseFloat(errorRate) > 10
                                        ? "bg-red-100 text-red-800"
                                        : parseFloat(errorRate) > 0
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {errorRate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="bg-gray-500 rounded-lg p-8 text-center">
                      <Activity className="w-12 h-12 text-white mx-auto mb-4" />
                      <p className="text-white text-lg mb-2">No analytics data for "{selectedEnvironment}" yet</p>
                      <p className="text-gray-300 text-sm">
                        Make requests in this environment to see analytics
                      </p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Variables Tab */}
          {activeTab === "variables" && (
            <GlobalVariablesManager 
              globalVars={globalVars} 
              projectEnvironments={projectEnvironments} 
              onSave={handleSaveGlobalVars} 
            />
          )}
        </div>
      </section>

      {/* Create Endpoint Modal */}
      {/* Mocking Rules Onboarding Modal */}
      {showMockingRulesOnboarding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[100] px-4">
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
                        body: '[\n  {{#each request.body.users}}\n  {\n    "id": "{{faker \'person.firstName\'}}",\n    "name": "{{faker \'person.firstName\'}} {{faker \'person.lastName\'}}",\n    "email": "{{faker \'internet.email\'}}",\n    "address": "{{faker \'location.streetAddress\'}}",\n    "country": "{{faker \'location.country\'}}",\n    "phone": "{{faker \'phone.number\'}}",\n    "index": {{@index}},\n    "isFirst": {{@first}},\n    "isLast": {{@last}}\n  }{{#unless @last}},{{/unless}}\n  {{/each}}\n]',
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateEndpointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-100 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl flex flex-col font-sans">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-600">
                {editingEndpoint ? "Edit Mocking Rule" : "Mocking Rules"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateEndpointModal(false);
                  resetForm();
                }}
                className="text-gray-700 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Section 1: Request Condition */}
              <div className="rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="px-6 py-2 bg-blue-600 rounded-t-md">
                  <h3 className="text-md font-semibold text-white tracking-wider">
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
                          onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:border-blue-500 transition-all font-medium flex items-center justify-between text-sm"
                        >
                          <span>{newEndpointMethod}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showMethodDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-20 py-1 max-h-60 overflow-y-auto scrollbar-hide">
                            {["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].map((method) => (
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
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        Request Condition
                      </label>
                      <div className="relative">
                        <select
                          value={newMatchType}
                          onChange={(e) => handleMatchTypeChange(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm appearance-none pr-10"
                        >
                          <option value="path_exact">request path exactly matches</option>
                          <option value="path_starts">request path starts with</option>
                          <option value="path_contains">request path contains</option>
                          <option value="path_template">request path matches template</option>
                          <option value="path_regex">request path matches a regular expression</option>
                          <option value="body_contains">request body contains</option>
                          <option value="body_param">request body parameter matches</option>
                          <option value="body_regex">request body matches a regular expression</option>
                          <option value="header_regex">request header matches a regular expression</option>
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
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm"
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
                  <h3 className="text-md font-semibold text-white tracking-wider">
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
                    <>
                      <div className="grid grid-cols-2 gap-8 mb-6">
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
                              onChange={(e) => setNewEndpointDelay(e.target.value)}
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

                      {/* Headers and Body */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Headers */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-md font-semibold text-gray-700">
                              Response Headers
                            </label>
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer relative">
                              <button
                                onClick={() => setShowContentTypeDropdown(!showContentTypeDropdown)}
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
                            onChange={(e) => setNewEndpointHeaders(e.target.value)}
                            className="w-full h-40 px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                            spellCheck="false"
                          />
                        </div>

                        {/* Body */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-md font-semibold text-gray-700">
                              Response Body
                            </label>
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer relative">
                              <button
                                onClick={() => setShowDynamicValueDropdown(!showDynamicValueDropdown)}
                                className="flex items-center gap-1"
                              >
                                Insert Dynamic Value ▼
                              </button>
                              {showDynamicValueDropdown && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-30 py-1 min-w-64 max-h-60 overflow-y-auto">
                                  {dynamicValues.map((item, index) => (
                                    <button
                                      key={index}
                                      onClick={() => insertDynamicValue(item.value)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </span>
                          </div>
                          {/* Cursor Message */}
                          {cursorMessage && (
                            <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded text-sm">
                              {cursorMessage}
                            </div>
                          )}
                          <textarea
                            ref={responseBodyRef}
                            value={newEndpointBody}
                            onChange={(e) => setNewEndpointBody(e.target.value)}
                            onClick={() => setCursorMessage("")}
                            onFocus={() => setCursorMessage("")}
                            className="w-full h-40 px-4 py-3 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    </>
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
                              <label className="block text-md font-semibold text-gray-700 mb-2">
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
                  <label className="block text-md font-semibold text-gray-700 mb-2">
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
                  resetForm();
                }}
                className="px-8 py-2.5 bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Save Rule button clicked!');
                  handleCreateEndpoint();
                }}
                disabled={isCreatingEndpoint}
                className={`px-10 py-2.5 rounded font-bold shadow-lg transition-colors ${
                  isCreatingEndpoint 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isCreatingEndpoint ? 'Creating...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Request Details - {selectedLog.method} {selectedLog.path}
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedLog.method === "GET" ? "bg-green-100 text-green-800" :
                        selectedLog.method === "POST" ? "bg-blue-100 text-blue-800" :
                        selectedLog.method === "PUT" ? "bg-yellow-100 text-yellow-800" :
                        selectedLog.method === "DELETE" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedLog.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Path:</span>
                      <span className="font-mono text-sm">{selectedLog.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedLog.status >= 200 && selectedLog.status < 300 ? "bg-green-100 text-green-800" :
                        selectedLog.status >= 400 ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedLog.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp:</span>
                      <span className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Headers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Headers</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(selectedLog.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="font-mono text-sm break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Request Body */}
              {selectedLog.body && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Body</h3>
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {typeof selectedLog.body === 'object' ? JSON.stringify(selectedLog.body, null, 2) : selectedLog.body}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;