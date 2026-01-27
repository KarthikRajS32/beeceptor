const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const TemplateEngine = require('./templateEngine');

const app = express();
const PORT = 3001;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// In-memory storage
let endpointRules = [];
let requestLogs = [];
let queryHeaderRules = [];
let stateStore = {};
let projectMappings = new Map();
let analyticsData = new Map(); // key: projectName_method_path, value: { totalCalls, totalResponseTime, errorCount }
let globalVariables = new Map(); // key: projectName, value: { varName: { envName: value } }

// Initialize template engine
const templateEngine = new TemplateEngine();

// Helper to normalize project names
const slugify = (name) => name?.toString().toLowerCase().replace(/\s+/g, '-') || '';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString(), port: PORT });
});

// OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

// API endpoint to save endpoint rules
app.post("/api/endpoints", (req, res) => {
  try {
    console.log('POST /api/endpoints - Request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      projectName,
      projectId,
      method,
      path,
      delay,
      status,
      headers,
      body,
      matchType,
      stateConditions,
      requestConditions,
      responseMode,
      weightedResponses,
      isFile,
      paramName,
      paramOperator,
      paramValue,
      headerName,
      headerValue,
      environment,
    } = req.body;

    // Validate required fields
    if (!projectName || !method || !path) {
      console.error('Missing required fields:', { projectName, method, path });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['projectName', 'method', 'path'],
        received: { projectName, method, path }
      });
    }

    // Store project mapping
    if (projectId) {
      projectMappings.set(projectId, projectName);
      console.log('Updated project mapping:', projectId, '->', projectName);
    }

    let parsedHeaders;
    try {
      parsedHeaders = headers ? JSON.parse(headers) : { "Content-Type": "application/json" };
    } catch (headerError) {
      console.error('Invalid headers JSON:', headerError);
      return res.status(400).json({ error: 'Invalid headers format', details: headerError.message });
    }

    const rule = {
      id: Date.now().toString(),
      projectName,
      projectId: projectId || null,
      method: method.toUpperCase(),
      path,
      matchType: matchType || "path_exact",
      delay: parseInt(delay) || 0,
      status: parseInt(status) || 200,
      headers: parsedHeaders,
      body: body || '{}',
      stateConditions: stateConditions || [],
      requestConditions: requestConditions || [],
      responseMode: responseMode || "single",
      weightedResponses: (weightedResponses || []).map(r => ({
        ...r,
        weight: parseInt(r.weight) || 0,
        delay: parseInt(r.delay) || 0,
        status: parseInt(r.status) || 200,
        headers: typeof r.headers === 'string' ? r.headers : JSON.stringify(r.headers),
      })),
      isFile: isFile || false,
      paramName: paramName || "",
      paramOperator: paramOperator || "equals",
      paramValue: paramValue || "",
      headerName: headerName || "",
      headerValue: headerValue || "",
      environment: environment || "Default",
    };

    console.log('Created rule:', JSON.stringify(rule, null, 2));

    // Remove existing rule with same project, method, and path
    const beforeCount = endpointRules.length;
    endpointRules = endpointRules.filter(
      (r) =>
        !(
          slugify(r.projectName) === slugify(projectName) &&
          r.method === method.toUpperCase() &&
          r.path === path &&
          r.matchType === matchType
        )
    );
    const afterCount = endpointRules.length;
    if (beforeCount !== afterCount) {
      console.log('Removed existing rule, count:', beforeCount, '->', afterCount);
    }

    endpointRules.push(rule);
    console.log('Total endpoint rules:', endpointRules.length);
    
    res.json({ success: true, rule, message: 'Endpoint created successfully' });
  } catch (error) {
    console.error('Error in POST /api/endpoints:', error);
    res.status(500).json({ 
      error: 'Failed to create endpoint', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to get all endpoint rules
app.get("/api/endpoints", (req, res) => {
  res.json(endpointRules);
});

// API endpoint to register project mappings for browser access
app.post("/api/projects/register", (req, res) => {
  const { projectId, projectName } = req.body;
  if (projectId && projectName) {
    projectMappings.set(projectId, projectName);
    console.log('Registered project mapping:', projectId, '->', projectName);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "projectId and projectName required" });
  }
});

// API endpoint to get request logs for a project
app.get("/api/logs/:projectName", (req, res) => {
  const { projectName } = req.params;
  const targetSlug = slugify(projectName);
  const projectLogs = requestLogs.filter(log => slugify(log.projectName) === targetSlug);
  res.json(projectLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// API endpoint to get analytics for a project
app.get("/api/analytics/:projectName", (req, res) => {
  const { projectName } = req.params;
  const targetSlug = slugify(projectName);
  
  const projectAnalytics = [];
  analyticsData.forEach((value, key) => {
    if (value.projectName === targetSlug) {
      projectAnalytics.push({
        environment: value.environment || "Default",
        method: value.method,
        path: value.path,
        totalCalls: value.totalCalls,
        avgResponseTime: value.totalCalls > 0 ? Math.round(value.totalResponseTime / value.totalCalls) : 0,
        errorCount: value.errorCount
      });
    }
  });
  
  res.json(projectAnalytics);
});

// API endpoint to delete endpoint rule
app.delete("/api/endpoints/:id", (req, res) => {
  const { id } = req.params;
  endpointRules = endpointRules.filter((r) => r.id !== id);
  res.json({ success: true });
});

// API endpoint to update endpoint rule
app.put("/api/endpoints/:id", (req, res) => {
  const { id } = req.params;
  const index = endpointRules.findIndex(e => e.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Endpoint not found" });
  }

  endpointRules[index] = {
    ...endpointRules[index],
    ...req.body,
    id: endpointRules[index].id
  };

  res.json({ success: true, rule: endpointRules[index] });
});

// State management endpoints
app.post("/api/state/:variable", (req, res) => {
  const { variable } = req.params;
  const { value, action } = req.body;

  if (action === 'set') {
    stateStore[variable] = value;
  } else if (action === 'increment') {
    stateStore[variable] = (parseInt(stateStore[variable]) || 0) + 1;
  } else if (action === 'decrement') {
    stateStore[variable] = (parseInt(stateStore[variable]) || 0) - 1;
  } else if (action === 'delete') {
    delete stateStore[variable];
  }

  res.json({ success: true, state: stateStore });
});

app.get("/api/state", (req, res) => {
  res.json(stateStore);
});

app.post("/api/state/reset", (req, res) => {
  stateStore = {};
  res.json({ success: true });
});

// Query/header rules endpoints
app.post("/api/query-header-rules", (req, res) => {
  const { rules } = req.body;
  queryHeaderRules = rules || [];
  res.json({ success: true });
});

app.get("/api/query-header-rules/:endpointId", (req, res) => {
  const { endpointId } = req.params;
  const rules = queryHeaderRules.filter((r) => r.endpointId === endpointId);
  res.json(rules);
});

// Template validation endpoint
app.post("/api/template/validate", (req, res) => {
  const { template } = req.body;
  
  if (!template) {
    return res.status(400).json({ error: "Template required" });
  }

  const validation = templateEngine.validate(template);
  res.json(validation);
});
app.get("/api/variables/:projectName", (req, res) => {
  const { projectName } = req.params;
  const projectVars = globalVariables.get(slugify(projectName)) || {};
  res.json(projectVars);
});

app.post("/api/variables/:projectName", (req, res) => {
  const { projectName } = req.params;
  const { variables } = req.body;
  
  if (!variables || typeof variables !== 'object') {
    return res.status(400).json({ error: "Variables object required" });
  }

  globalVariables.set(slugify(projectName), variables);
  console.log(`Updated global variables for project: ${projectName}`);
  res.json({ success: true, variables: globalVariables.get(slugify(projectName)) });
});

// Helper functions
function matchesCondition(rule, req, projectName, endpointPath) {
  const { matchType, path: matchValue } = rule;

  // Check state conditions first
  if (rule.stateConditions && rule.stateConditions.length > 0) {
    const allStateConditionsValid = rule.stateConditions.every((condition) => {
      if (!condition.variable || !condition.type || !condition.operator) {
        return true;
      }
      return matchStateCondition(condition, req);
    });
    if (!allStateConditionsValid) return false;
  }

  // Check request conditions
  if (rule.requestConditions && rule.requestConditions.length > 0) {
    const allRequestConditionsValid = rule.requestConditions.every((condition) => {
      return matchRequestCondition(condition, req);
    });
    if (!allRequestConditionsValid) return false;
  }

  switch (matchType) {
    case "path_exact":
      return endpointPath === matchValue;
    case "path_starts":
      return endpointPath.startsWith(matchValue);
    case "path_contains":
      return endpointPath.includes(matchValue);
    case "path_template":
      return matchTemplate(endpointPath, matchValue);
    case "path_regex":
      try {
        const regex = new RegExp(matchValue);
        return regex.test(endpointPath);
      } catch {
        return false;
      }
    default:
      return endpointPath === matchValue;
  }
}

function matchTemplate(path, template) {
  const pathParts = path.split("/");
  const templateParts = template.split("/");

  if (pathParts.length !== templateParts.length) {
    return false;
  }

  return templateParts.every((part, index) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      return true;
    }
    return part === pathParts[index];
  });
}

function matchStateCondition(condition, req) {
  const { variable, operator, value } = condition;
  const stateValue = stateStore[variable];

  switch (operator) {
    case "equals":
      return stateValue === value;
    case "not_equals":
      return stateValue !== value;
    case "contains":
      return stateValue && String(stateValue).includes(String(value));
    case "exists":
      return stateValue !== undefined && stateValue !== null;
    case "not_exists":
      return stateValue === undefined || stateValue === null;
    default:
      return false;
  }
}

function matchRequestCondition(condition, req) {
  // Implementation for request conditions
  return true;
}

function processResponse(rule, req, res, projectName, endpointPath) {
  const startTime = Date.now();
  let selectedResponse;
  let delayMs = 0;

  if (rule.responseMode === 'weighted' && rule.weightedResponses && rule.weightedResponses.length > 0) {
    // Weighted response selection
    const totalWeight = rule.weightedResponses.reduce((sum, r) => sum + (parseInt(r.weight) || 0), 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (const response of rule.weightedResponses) {
      currentWeight += parseInt(response.weight) || 0;
      if (random <= currentWeight) {
        selectedResponse = {
          status: parseInt(response.status) || 200,
          headers: typeof response.headers === 'string' ? JSON.parse(response.headers) : response.headers,
          body: response.body || '{}'
        };
        delayMs = (parseInt(response.delay) || 0) * 1000;
        break;
      }
    }
    
    if (!selectedResponse) {
      const firstResponse = rule.weightedResponses[0];
      selectedResponse = {
        status: parseInt(firstResponse.status) || 200,
        headers: typeof firstResponse.headers === 'string' ? JSON.parse(firstResponse.headers) : firstResponse.headers,
        body: firstResponse.body || '{}'
      };
      delayMs = (parseInt(firstResponse.delay) || 0) * 1000;
    }
  } else {
    // Single response mode
    selectedResponse = {
      status: rule.status,
      headers: rule.headers || {},
      body: rule.body || '{}'
    };
    delayMs = (parseInt(rule.delay) || 0) * 1000;
  }

  console.log('Processing response with delay:', delayMs, 'ms');

  setTimeout(() => {
    // Set response headers
    Object.entries(selectedResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    let responseBody = selectedResponse.body;
    
    // Process template with full context
    if (responseBody) {
      // Build template context
      const projectVars = globalVariables.get(slugify(projectName)) || {};
      const currentEnv = rule.environment || "Default";
      
      // Get environment-specific global variables
      const envGlobals = {};
      Object.entries(projectVars).forEach(([varName, envValues]) => {
        envGlobals[varName] = envValues[currentEnv] !== undefined ? envValues[currentEnv] : (envValues["Default"] || "");
      });
      
      const context = templateEngine.buildContext(req, currentEnv, envGlobals, stateStore);
      
      // Process template
      responseBody = templateEngine.processTemplate(responseBody, context);
    }

    // Send response
    res.status(selectedResponse.status);
    
    if (responseBody) {
      try {
        const parsedBody = JSON.parse(responseBody);
        res.json(parsedBody);
      } catch {
        res.send(responseBody);
      }
    } else {
      res.end();
    }
    
    // Update analytics after response is sent
    const responseTime = Date.now() - startTime;
    updateAnalytics(projectName, req.method, endpointPath, responseTime, selectedResponse.status, rule.environment || "Default");
  }, delayMs);
}

function logRequest(req, projectName, endpointPath, status = 200, environment = "Default", responseTime = 0) {
  const logEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    projectName: slugify(projectName),
    environment,
    method: req.method,
    path: endpointPath,
    fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    queryParams: req.query,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
    status,
    responseTime
  };
  
  requestLogs.push(logEntry);
  
  if (requestLogs.length > 1000) {
    requestLogs = requestLogs.slice(-1000);
  }
  
  console.log('Logged request:', req.method, endpointPath);
}

function updateAnalytics(projectName, method, path, responseTime, status, environment = "Default") {
  const key = `${slugify(projectName)}_${environment}_${method}_${path}`;
  
  if (!analyticsData.has(key)) {
    analyticsData.set(key, {
      projectName: slugify(projectName),
      environment,
      method,
      path,
      totalCalls: 0,
      totalResponseTime: 0,
      errorCount: 0
    });
  }
  
  const analytics = analyticsData.get(key);
  analytics.totalCalls++;
  analytics.totalResponseTime += responseTime;
  
  if (status >= 400) {
    analytics.errorCount++;
  }
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Catch-all route for mock API responses
app.all("*", upload.single('file'), (req, res) => {
  const decodedPath = decodeURIComponent(req.path);
  const urlParts = decodedPath.split("/").filter((part) => part);

  if (urlParts.length === 0) {
    return res.status(404).json({ error: "Project name required" });
  }

  let projectName, endpointPath;
  
  // Handle URL format: /{projectName}/{endpointPath}
  projectName = urlParts[0];
  endpointPath = urlParts.length > 1 ? "/" + urlParts.slice(1).join("/") : "/";

  console.log('Request:', req.method, decodedPath);
  console.log('Resolved - Project:', projectName, 'Endpoint:', endpointPath);

  // Find matching endpoint rule
  const rule = endpointRules.find(
    (r) =>
      slugify(r.projectName) === slugify(projectName) &&
      r.method === req.method.toUpperCase() &&
      matchesCondition(r, req, projectName, endpointPath)
  );

  console.log('Matched rule:', rule ? `${rule.method} ${rule.path} (delay: ${rule.delay}s)` : 'No match');
  console.log('Available rules for project:', endpointRules.filter(r => slugify(r.projectName) === slugify(projectName)).map(r => `${r.method} ${r.path}`));

  if (!rule) {
    const responseTime = 0;
    logRequest(req, projectName, endpointPath, 404, "Default", responseTime);
    updateAnalytics(projectName, req.method, endpointPath, responseTime, 404, "Default");
    
    const projectEndpoints = endpointRules
      .filter(r => slugify(r.projectName) === slugify(projectName))
      .map(r => `${r.method} ${r.path}`);
    
    return res.status(404).json({
      error: `No mock endpoint found for ${req.method} ${decodedPath}`,
      project: projectName,
      requestedEndpoint: endpointPath,
      availableEndpoints: projectEndpoints.length > 0 ? projectEndpoints : ['No endpoints configured for this project'],
      totalEndpoints: endpointRules.filter(r => r.projectName === projectName).length
    });
  }

  // Log the request before processing response
  const startTime = Date.now();
  logRequest(req, projectName, endpointPath, rule.status || 200, rule.environment || "Default", 0);

  processResponse(rule, req, res, projectName, endpointPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/endpoints`);
  console.log(`\n✅ Server is ready to accept requests!\n`);
});