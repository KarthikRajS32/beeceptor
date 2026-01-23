const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// In-memory storage for endpoint rules and request logs
let endpointRules = [];
let requestLogs = [];

// Middleware
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // Disable credentials for wildcard origin
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text());
app.use(express.raw());

// Project mapping storage for browser access
let projectMappings = new Map(); // projectId -> projectName

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString(), port: PORT });
});

// Add preflight OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
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

// API endpoint to save endpoint rules
app.post("/api/endpoints", (req, res) => {
  try {
    console.log('POST /api/endpoints - Request received');
    console.log('Request headers:', req.headers);
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

    // Store project mapping for browser access
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
      body,
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
    };

    console.log('Created rule:', JSON.stringify(rule, null, 2));

    // Remove existing rule with same project, method, and path
    const beforeCount = endpointRules.length;
    endpointRules = endpointRules.filter(
      (r) =>
        !(
          r.projectName === projectName &&
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

// API endpoint to register project mappings for browser access
app.post("/api/projects/register", (req, res) => {
  const { projectId, projectName } = req.body;
  if (projectId && projectName) {
    projectMappings.set(projectId, projectName);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "projectId and projectName required" });
  }
});

// API endpoint to get all endpoint rules
app.get("/api/endpoints", (req, res) => {
  res.json(endpointRules);
});

// API endpoint to get request logs for a project
app.get("/api/logs/:projectName", (req, res) => {
  const { projectName } = req.params;
  const projectLogs = requestLogs.filter(log => log.projectName === projectName);
  res.json(projectLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
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

  // Update while preserving original ID
  endpointRules[index] = {
    ...endpointRules[index],
    ...req.body,
    id: endpointRules[index].id  // Force preserve original ID
  };

  res.json({ success: true, rule: endpointRules[index] });
});

// Request matching functions
function matchesCondition(rule, req, projectName, endpointPath) {
  const {
    matchType,
    path: matchValue,
    paramName,
    paramOperator,
    paramValue,
    headerName,
    headerValue,
  } = rule;

  // Check state conditions first
  if (rule.stateConditions && rule.stateConditions.length > 0) {
    const stateMatches = rule.stateConditions.every((condition) =>
      matchStateCondition(condition, req)
    );
    if (!stateMatches) return false;
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

    case "body_contains":
      const bodyStr =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body || "");
      return bodyStr.includes(matchValue);

    case "body_param":
      return matchBodyParamAdvanced(
        req.body,
        paramName,
        paramOperator,
        paramValue
      );

    case "body_regex":
      try {
        const bodyStr =
          typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body || "");
        const regex = new RegExp(matchValue);
        return regex.test(bodyStr);
      } catch {
        return false;
      }

    case "header_regex":
      try {
        const regex = new RegExp(headerValue);
        const headerVal = req.headers[headerName.toLowerCase()];
        return headerVal && regex.test(headerVal);
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
      return true; // Template variable matches any value
    }
    return part === pathParts[index];
  });
}

function matchStateCondition(condition, req) {
  const { variable, operator, value } = condition;

  // Get state value from request headers (Beeceptor-style state management)
  const stateValue =
    req.headers[`x-state-${variable.toLowerCase()}`] ||
    req.headers[`x-beeceptor-state-${variable.toLowerCase()}`] ||
    req.query[variable] ||
    (req.body && req.body[variable]);

  switch (operator) {
    case "equals":
      return stateValue === value;
    case "not_equals":
      return stateValue !== value;
    case "contains":
      return stateValue && stateValue.toString().includes(value);
    case "starts_with":
      return stateValue && stateValue.toString().startsWith(value);
    case "ends_with":
      return stateValue && stateValue.toString().endsWith(value);
    case "exists":
      return stateValue !== undefined && stateValue !== null;
    case "not_exists":
      return stateValue === undefined || stateValue === null;
    case "greater_than":
      return parseFloat(stateValue) > parseFloat(value);
    case "less_than":
      return parseFloat(stateValue) < parseFloat(value);
    default:
      return stateValue === value;
  }
}

function matchBodyParamAdvanced(body, paramName, operator, expectedValue) {
  if (!body || !paramName) return false;

  let actualValue;

  if (typeof body === "object") {
    actualValue = body[paramName];
  } else if (typeof body === "string") {
    const params = new URLSearchParams(body);
    actualValue = params.get(paramName);
  } else {
    return false;
  }

  switch (operator) {
    case "equals":
      return actualValue === expectedValue;
    case "contains":
      return actualValue && actualValue.toString().includes(expectedValue);
    case "starts_with":
      return actualValue && actualValue.toString().startsWith(expectedValue);
    case "exists":
      return actualValue !== null && actualValue !== undefined;
    default:
      return actualValue === expectedValue;
  }
}

function processResponse(rule, req, res) {
  // Determine which response to use (single or weighted)
  let response = rule;
  if (rule.responseMode === "weighted" && rule.weightedResponses && rule.weightedResponses.length > 0) {
    const totalWeight = rule.weightedResponses.reduce((sum, r) => sum + parseInt(r.weight || 0), 0);
    let random = Math.random() * totalWeight;
    for (const weightedResponse of rule.weightedResponses) {
      random -= parseInt(weightedResponse.weight || 0);
      if (random <= 0) {
        response = weightedResponse;
        break;
      }
    }
  }

  // Get delay in seconds and convert to milliseconds
  const delayMs = (parseInt(response.delay) || 0) * 1000;
  console.log('Processing response with delay:', response.delay, 'seconds =', delayMs, 'ms');

  // Apply delay if specified
  setTimeout(() => {
    // Set response headers
    const headers = response.headers ? (typeof response.headers === 'string' ? JSON.parse(response.headers) : response.headers) : rule.headers;
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Process dynamic values in response body
    let responseBody = response.body || rule.body;
    if (responseBody) {
      responseBody = responseBody
        .replace(/{{timestamp}}/g, Date.now())
        .replace(/{{uuid}}/g, generateUUID())
        .replace(/{{randomNumber}}/g, Math.floor(Math.random() * 1000000))
        .replace(/{{currentDate}}/g, new Date().toISOString().split("T")[0])
        .replace(
          /{{requestIP}}/g,
          req.ip || req.connection.remoteAddress || "unknown"
        );
    }

    // Send response
    const status = response.status || rule.status;
    res.status(status);

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
  }, delayMs);
}

function logRequest(req, projectName, endpointPath, status = 200) {
  const logEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    projectName,
    method: req.method,
    path: endpointPath,
    fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    queryParams: req.query,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
    status
  };
  
  requestLogs.push(logEntry);
  
  // Keep only last 1000 logs to prevent memory issues
  if (requestLogs.length > 1000) {
    requestLogs = requestLogs.slice(-1000);
  }
  
  console.log('Logged request:', req.method, endpointPath);
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// Catch-all route for mock API responses
app.all("*", (req, res) => {
  const decodedPath = decodeURIComponent(req.path);
  const urlParts = decodedPath.split("/").filter((part) => part);

  if (urlParts.length === 0) {
    return res.status(404).json({ error: "Project name required" });
  }

  let projectName, endpointPath;
  
  // Handle different URL formats:
  // 1. /project/{projectId}/api/{endpoint} - Browser access format
  // 2. /{projectName}/{endpointPath} - Direct format
  if (urlParts[0] === 'project' && urlParts.length >= 4 && urlParts[2] === 'api') {
    // Format: /project/{projectId}/api/{endpoint}
    const projectId = urlParts[1];
    
    // Look up project name from projectId
    projectName = projectMappings.get(projectId);
    if (!projectName) {
      // Fallback: use projectId as projectName for backward compatibility
      projectName = projectId;
    }
    
    endpointPath = "/" + urlParts.slice(3).join("/");
  } else {
    // Format: /{projectName}/{endpointPath} or /{projectName}
    projectName = urlParts[0];
    endpointPath = urlParts.length > 1 ? "/" + urlParts.slice(1).join("/") : "/";
  }

  console.log('Request:', req.method, decodedPath);
  console.log('Resolved - Project:', projectName, 'Endpoint:', endpointPath);
  console.log('Available projects:', Array.from(projectMappings.entries()));

  // Find matching endpoint rule - strict project isolation
  const rule = endpointRules.find(
    (r) =>
      r.projectName === projectName &&
      r.method === req.method.toUpperCase() &&
      matchesCondition(r, req, projectName, endpointPath)
  );

  console.log('Matched rule:', rule ? `${rule.method} ${rule.path} (delay: ${rule.delay}s)` : 'No match');

  if (!rule) {
    // Log the request even if no rule matches
    logRequest(req, projectName, endpointPath, 404);
    
    // Get available endpoints for this specific project only
    const projectEndpoints = endpointRules
      .filter(r => r.projectName === projectName)
      .map(r => `${r.method} ${r.path}`);
    
    return res.status(404).json({
      error: `No mock endpoint found for ${req.method} ${decodedPath}`,
      project: projectName,
      requestedEndpoint: endpointPath,
      availableEndpoints: projectEndpoints.length > 0 ? projectEndpoints : ['No endpoints configured for this project'],
      supportedFormats: [
        `/${projectName}{endpoint}`,
        `/project/{projectId}/api{endpoint}`
      ],
      totalProjects: Array.from(new Set(endpointRules.map(r => r.projectName))).length,
      totalEndpoints: endpointRules.filter(r => r.projectName === projectName).length
    });
  }

  // Log the request before processing response
  logRequest(req, projectName, endpointPath, rule.status || 200);

  processResponse(rule, req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/endpoints`);
  console.log(`\n✅ Server is ready to accept requests!\n`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`📡 Listening on all interfaces (0.0.0.0:${PORT})`);
});
