// Environment Manager - handles all environment-related localStorage operations

export const DEFAULT_ENVIRONMENTS = ['Default', 'Dev', 'QA', 'Prod'];

// Get all environments for a project
export const getProjectEnvironments = (projectId) => {
  const saved = localStorage.getItem(`beeceptor_envs_${projectId}`);
  const environments = saved ? JSON.parse(saved) : DEFAULT_ENVIRONMENTS;
  
  // Ensure Default is always present and first
  if (!environments.includes('Default')) {
    environments.unshift('Default');
  }
  
  return environments;
};

// Set environments for a project
export const setProjectEnvironments = (projectId, environments) => {
  localStorage.setItem(`beeceptor_envs_${projectId}`, JSON.stringify(environments));
};

// Get currently selected environment for a project
export const getSelectedEnvironment = (projectId) => {
  const saved = localStorage.getItem(`beeceptor_selected_env_${projectId}`);
  return saved || 'Default';
};

// Set selected environment for a project
export const setSelectedEnvironment = (projectId, environment) => {
  localStorage.setItem(`beeceptor_selected_env_${projectId}`, environment);
};

// Get all rules for a specific environment in a project
export const getEnvironmentRules = (projectId, environment) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  return endpoints.filter(e => 
    e.projectId === projectId && 
    e.environment === environment
  );
};

// Save endpoint with environment association
export const saveEndpointWithEnvironment = (projectId, environment, endpoint) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  const endpoints = allRules ? JSON.parse(allRules) : [];
  
  const existingIndex = endpoints.findIndex(e => e.id === endpoint.id);
  const endpointWithEnv = { ...endpoint, environment, projectId };
  
  if (existingIndex >= 0) {
    endpoints[existingIndex] = endpointWithEnv;
  } else {
    endpoints.push(endpointWithEnv);
  }
  
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(endpoints));
  return endpoints;
};

// Delete endpoint from all environments
export const deleteEndpointFromEnvironment = (endpointId) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  const filtered = endpoints.filter(e => e.id !== endpointId);
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(filtered));
  return filtered;
};

// Get all rules for a project across all environments
export const getAllProjectRules = (projectId) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  return endpoints.filter(e => e.projectId === projectId);
};

// Add new environment to a project
export const addEnvironmentToProject = (projectId, environmentName) => {
  const environments = getProjectEnvironments(projectId);
  if (!environments.includes(environmentName) && environmentName.trim()) {
    environments.push(environmentName.trim());
    setProjectEnvironments(projectId, environments);
  }
  return environments;
};

// Remove environment from a project (keeps Default)
export const removeEnvironmentFromProject = (projectId, environmentName) => {
  if (environmentName === 'Default') return getProjectEnvironments(projectId);
  
  const environments = getProjectEnvironments(projectId);
  const filtered = environments.filter(e => e !== environmentName);
  setProjectEnvironments(projectId, filtered);
  
  // If removed environment was selected, switch to Default
  if (getSelectedEnvironment(projectId) === environmentName) {
    setSelectedEnvironment(projectId, 'Default');
  }
  
  // Remove all endpoints in this environment
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (allRules) {
    const endpoints = JSON.parse(allRules);
    const updated = endpoints.filter(e => !(e.projectId === projectId && e.environment === environmentName));
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(updated));
  }
  
  return filtered;
};

// Copy endpoint to another environment
export const copyEndpointToEnvironment = (endpointId, fromEnvironment, toEnvironment, projectId) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  const sourceEndpoint = endpoints.find(e => e.id === endpointId && e.environment === fromEnvironment && e.projectId === projectId);
  
  if (sourceEndpoint) {
    const newEndpoint = { ...sourceEndpoint, id: `ep_${Date.now()}`, environment: toEnvironment };
    endpoints.push(newEndpoint);
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(endpoints));
  }
  
  return endpoints;
};

// Clone entire environment with all endpoints
export const cloneEnvironment = (projectId, fromEnvironment, toEnvironmentName) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  const endpoints = allRules ? JSON.parse(allRules) : [];
  
  // Get all endpoints from source environment
  const sourceEndpoints = endpoints.filter(e => e.projectId === projectId && e.environment === fromEnvironment);
  
  // Create cloned endpoints with new environment
  const clonedEndpoints = sourceEndpoints.map(ep => ({
    ...ep,
    id: `ep_${Date.now()}_${Math.random()}`,
    environment: toEnvironmentName
  }));
  
  // Add cloned endpoints
  const updated = [...endpoints, ...clonedEndpoints];
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(updated));
  
  // Add environment to project
  addEnvironmentToProject(projectId, toEnvironmentName);
  
  return updated;
};

// Get environment-specific endpoint override
export const getEndpointOverride = (projectId, path, method, environment) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return null;
  
  const endpoints = JSON.parse(allRules);
  return endpoints.find(e => 
    e.projectId === projectId && 
    e.name === path && 
    e.method === method && 
    e.environment === environment
  );
};

// Get environment variables for a project
export const getEnvironmentVariables = (projectId, environment) => {
  const saved = localStorage.getItem(`beeceptor_env_vars_${projectId}_${environment}`);
  return saved ? JSON.parse(saved) : {};
};

// Set environment variables
export const setEnvironmentVariables = (projectId, environment, variables) => {
  localStorage.setItem(`beeceptor_env_vars_${projectId}_${environment}`, JSON.stringify(variables));
  return variables;
};

// Add environment variable
export const addEnvironmentVariable = (projectId, environment, key, value) => {
  const vars = getEnvironmentVariables(projectId, environment);
  vars[key] = value;
  return setEnvironmentVariables(projectId, environment, vars);
};

// Remove environment variable
export const removeEnvironmentVariable = (projectId, environment, key) => {
  const vars = getEnvironmentVariables(projectId, environment);
  delete vars[key];
  return setEnvironmentVariables(projectId, environment, vars);
};

// Get all endpoints for comparison across environments
export const getEndpointsByPath = (projectId, path) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return {};
  
  const endpoints = JSON.parse(allRules);
  const result = {};
  
  endpoints
    .filter(e => e.projectId === projectId && e.name === path)
    .forEach(e => {
      result[e.environment] = e;
    });
  
  return result;
};

// Bulk copy endpoints to environment
export const bulkCopyEndpointsToEnvironment = (projectId, fromEnvironment, toEnvironment, endpointIds = null) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  let sourceEndpoints = endpoints.filter(e => e.projectId === projectId && e.environment === fromEnvironment);
  
  if (endpointIds) {
    sourceEndpoints = sourceEndpoints.filter(e => endpointIds.includes(e.id));
  }
  
  const newEndpoints = sourceEndpoints.map(ep => ({
    ...ep,
    id: `ep_${Date.now()}_${Math.random()}`,
    environment: toEnvironment
  }));
  
  const updated = [...endpoints, ...newEndpoints];
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(updated));
  
  return updated;
};

// Get environment-specific endpoint (override)
export const getEnvironmentSpecificEndpoint = (endpointId, environment, projectId) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return null;
  
  const endpoints = JSON.parse(allRules);
  return endpoints.find(e => e.id === endpointId && e.environment === environment && e.projectId === projectId);
};

// Update endpoint for specific environment
export const updateEndpointForEnvironment = (endpointId, environment, projectId, updates) => {
  const allRules = localStorage.getItem('beeceptor_endpoints');
  if (!allRules) return [];
  
  const endpoints = JSON.parse(allRules);
  const index = endpoints.findIndex(e => e.id === endpointId && e.environment === environment && e.projectId === projectId);
  
  if (index >= 0) {
    endpoints[index] = { ...endpoints[index], ...updates };
  }
  
  localStorage.setItem('beeceptor_endpoints', JSON.stringify(endpoints));
  return endpoints;
};
