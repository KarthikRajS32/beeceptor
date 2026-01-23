import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import { ArrowLeft, Plus, Edit2, Trash2, Activity, Copy, Check, ChevronDown, Clock, Code2, Move, X, Download, Upload } from "lucide-react";

const ProjectDetails = ({ user, onLogout }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
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

  // Load project and endpoints data
  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
    const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
    
    const foundProject = projects.find(p => p.id === projectId);
    if (!foundProject) {
      navigate('/dashboard');
      return;
    }
    
    setProject(foundProject);
    // Filter endpoints by projectId to ensure project-specific data
    const projectEndpoints = allEndpoints.filter(e => e.projectId === projectId);
    setEndpoints(projectEndpoints);
    
    // Register project mapping for browser access
    fetch('http://localhost:3001/api/projects/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: foundProject.id,
        projectName: foundProject.name
      })
    }).catch(error => console.error('Failed to register project mapping:', error));
    
    // Clear import state when switching projects to prevent data bleeding
    setImportMessage("");
    setShowImportMessage(false);
    
    // Reset form states for clean project switching
    resetForm();
  }, [projectId, navigate]);

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
        stateConditions: stateConditions,
        requestConditions: requestConditions,
        weightedResponses: weightedResponses,
        paramName: newParamName,
        paramOperator: newParamOperator,
        paramValue: newParamValue,
        headerName: newHeaderName,
        headerValue: newHeaderValue,
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
        const newEndpoint = {
          id: `ep_${Date.now()}`,
          backendId: result.rule.id,
          name: newEndpointName,
          projectId: project.id,
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
  };

  const handleDeleteEndpoint = (endpointId) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    const updatedEndpoints = endpoints.filter(e => e.id !== endpointId);
    setEndpoints(updatedEndpoints);
    
    // Update localStorage
    const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
    const filteredEndpoints = allEndpoints.filter(e => e.id !== endpointId);
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(filteredEndpoints));
    
    // Update project endpoint count
    const projects = JSON.parse(localStorage.getItem('beeceptor_projects') || '[]');
    const updatedProjects = projects.map(p => 
      p.id === project.id ? { ...p, endpointCount: Math.max(0, p.endpointCount - 1) } : p
    );
    localStorage.setItem('beeceptor_projects', JSON.stringify(updatedProjects));
    setProject(prev => ({ ...prev, endpointCount: Math.max(0, prev.endpointCount - 1) }));
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
          const currentProjectId = projectId;
          
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

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onSignUpClick={() => {}}
        isAuthenticated={!!user}
        user={user}
        onLogout={onLogout}
      />

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
              <p className="text-gray-700 text-md">
                {endpoints.length} endpoints in this project
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateEndpointModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create API
              </button>
              <button
                onClick={handleImportProject}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Import APIs
              </button>
              <button
                onClick={handleExportProject}
                disabled={endpoints.length === 0}
                className={`px-6 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2 ${
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
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <Activity className="w-5 h-5" />
                View Request Logs
              </button>
            </div>
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
              Request Logs ({requestLogs.length})
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
                                    http://localhost:3001/project/{project.id}/api{endpoint.name}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const url = `http://localhost:3001/project/${project.id}/api${endpoint.name}`;
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
                                  onClick={() => {
                                    setEditingEndpoint(endpoint);
                                    setEditingApiId(endpoint.id);
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
                                    setShowCreateEndpointModal(true);
                                  }}
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
                      onClick={() => setShowCreateEndpointModal(true)}
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
              {requestLogs.length > 0 ? (
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
                        {requestLogs.map((log) => (
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
        </div>
      </section>

      {/* Create Endpoint Modal */}
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
                          <label className="block text-md font-semibold text-gray-700 mb-2">
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
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Response
                        </button>
                      </div>
                      {weightedResponses.map((response, index) => (
                        <div key={index} className="border border-gray-200 rounded p-4 bg-gray-50">
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
                              <label className="block text-md font-semibold text-gray-700 mb-2">
                                Weight (%)
                              </label>
                              <input
                                type="number"
                                value={response.weight}
                                onChange={(e) => updateWeightedResponse(index, "weight", e.target.value)}
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
                                  value={response.delay || ""}
                                  onChange={(e) => updateWeightedResponse(index, "delay", e.target.value)}
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
                                value={response.status}
                                onChange={(e) => updateWeightedResponse(index, "status", e.target.value)}
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
                                onChange={(e) => updateWeightedResponse(index, "headers", e.target.value)}
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
                                onChange={(e) => updateWeightedResponse(index, "body", e.target.value)}
                                className="w-full h-24 px-3 py-2 bg-gray-900 text-green-400 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                                spellCheck="false"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
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

      <Footer />
    </div>
  );
};

export default ProjectDetails;