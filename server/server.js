const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3001;

// Configure multer for in-memory file uploads (no disk storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// In-memory storage for endpoint rules and state
let endpointRules = [];
let queryHeaderRules = [];
let stateStore = {}; // Persistent state store for state conditions

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));

// API endpoint to manage state variables
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

// API endpoint to save endpoint rules
app.post("/api/endpoints", (req, res) => {
  try {
    const {
      id,
      projectName,
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

    if (!projectName || !method || !path) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rule = {
      id: id || Date.now().toString(),
      projectName,
      method: method.toUpperCase(),
      path,
      matchType: matchType || "path_exact",
      delay: parseInt(delay) || 0,
      status: parseInt(status) || 200,
      headers: headers ? JSON.parse(headers) : { "Content-Type": "application/json" },
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

    endpointRules = endpointRules.filter(
      (r) =>
        r.id !== rule.id &&
        !(
          r.projectName === projectName &&
          r.method === method.toUpperCase() &&
          r.path === path &&
          r.matchType === matchType
        )
    );

    endpointRules.push(rule);
    console.log(`Endpoint saved: ${method.toUpperCase()} ${projectName}${path}`);
    console.log('Rule details:', JSON.stringify(rule, null, 2));
    res.json({ success: true, rule });
  } catch (error) {
    console.error('Error saving endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to sync query/header rules
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

// Request matching functions
function matchesCondition(rule, req, projectName, endpointPath) {
  const { matchType, path: matchValue } = rule;

  // Check state conditions FIRST (AND logic - all must match)
  if (rule.stateConditions && rule.stateConditions.length > 0) {
    const allStateConditionsValid = rule.stateConditions.every((condition) => {
      // Only check conditions that are fully configured
      if (!condition.variable || !condition.type || !condition.operator) {
        return true; // Skip incomplete conditions
      }
      return matchStateCondition(condition, req);
    });
    if (!allStateConditionsValid) return false;
  }

  // Then check request conditions
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

function matchRequestCondition(condition, req) {
  const { matchType, value, paramName, paramOperator, paramValue, headerName, headerValue } = condition;

  switch (matchType) {
    case 'path_exact':
      return req.path === value;
    case 'path_starts':
      return req.path.startsWith(value);
    case 'path_contains':
      return req.path.includes(value);
    case 'path_template':
      return matchTemplate(req.path, value);
    case 'path_regex':
      try {
        const regex = new RegExp(value);
        return regex.test(req.path);
      } catch {
        return false;
      }
    case 'body_contains':
      return req.body && String(req.body).includes(value);
    case 'body_param':
      return matchBodyParam(req.body, paramName, paramOperator, paramValue);
    case 'body_regex':
      try {
        const regex = new RegExp(value);
        return regex.test(req.body ? String(req.body) : '');
      } catch {
        return false;
      }
    case 'header_regex':
      try {
        const regex = new RegExp(headerValue);
        const headerVal = req.headers[headerName.toLowerCase()];
        return regex.test(headerVal ? String(headerVal) : '');
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function matchBodyParam(body, paramName, operator, value) {
  try {
    const bodyObj = typeof body === 'string' ? JSON.parse(body) : body;
    const paramValue = bodyObj[paramName];
    
    switch (operator) {
      case 'equals':
        return paramValue === value;
      case 'contains':
        return paramValue && String(paramValue).includes(String(value));
      case 'starts_with':
        return paramValue && String(paramValue).startsWith(String(value));
      case 'exists':
        return paramValue !== undefined && paramValue !== null;
      default:
        return false;
    }
  } catch {
    return false;
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
  const { variable, type, operator, value } = condition;
  const stateValue = stateStore[variable];

  if (type === 'Data Store') {
    switch (operator) {
      case 'equals':
        return stateValue === value;
      case 'not_equals':
        return stateValue !== value;
      case 'contains':
        return stateValue && String(stateValue).includes(String(value));
      case 'exists':
        return stateValue !== undefined && stateValue !== null;
      case 'not_exists':
        return stateValue === undefined || stateValue === null;
      default:
        return false;
    }
  } else if (type === 'List') {
    const listValue = Array.isArray(stateValue) ? stateValue : [];
    switch (operator) {
      case 'contains':
        return listValue.includes(value);
      case 'not_contains':
        return !listValue.includes(value);
      case 'length_equals':
        return listValue.length === parseInt(value);
      case 'length_greater':
        return listValue.length > parseInt(value);
      case 'length_less':
        return listValue.length < parseInt(value);
      default:
        return false;
    }
  } else if (type === 'Counter') {
    const counterValue = parseInt(stateValue) || 0;
    const compareValue = parseInt(value);
    switch (operator) {
      case 'equals':
        return counterValue === compareValue;
      case 'not_equals':
        return counterValue !== compareValue;
      case 'greater_than':
        return counterValue > compareValue;
      case 'less_than':
        return counterValue < compareValue;
      case 'greater_equal':
        return counterValue >= compareValue;
      case 'less_equal':
        return counterValue <= compareValue;
      default:
        return false;
    }
  }
  return false;
}

function processResponse(rule, req, res) {
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
    
    // Fallback to first response if none selected
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
      headers: rule.headers ? (typeof rule.headers === 'string' ? JSON.parse(rule.headers) : rule.headers) : {},
      body: rule.body || '{}'
    };
    delayMs = (parseInt(rule.delay) || 0) * 1000;
  }

  setTimeout(() => {
    Object.entries(selectedResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.removeHeader('Content-Disposition');
    res.removeHeader('Content-Transfer-Encoding');

    let responseBody = selectedResponse.body;
    responseBody = responseBody.trim();
    if (!responseBody) responseBody = '{}';
    if (responseBody) {
      responseBody = responseBody
        .replace(/{{timestamp}}/g, Date.now())
        .replace(/{{uuid}}/g, generateUUID())
        .replace(/{{randomNumber}}/g, Math.floor(Math.random() * 1000000))
        .replace(/{{currentDate}}/g, new Date().toISOString().split("T")[0]);
    }

    res.status(selectedResponse.status);
    res.setHeader('Content-Type', 'application/json');

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

  const projectName = urlParts[0];
  const endpointPath = "/" + urlParts.slice(1).join("/");

  console.log('Request:', req.method, decodedPath);
  if (req.file) {
    console.log('File received:', req.file.originalname, `(${req.file.size} bytes)`);
  }

  // Find matching endpoint rule
  const rule = endpointRules.find((r) => {
    if (
      r.projectName === projectName &&
      r.method === req.method.toUpperCase() &&
      matchesCondition(r, req, projectName, endpointPath)
    ) {
      const associatedRules = queryHeaderRules.filter((qh) => qh.endpointId === r.id);
      if (associatedRules.length === 0) return true;
      return associatedRules.some((qh) =>
        evaluateQueryHeaderConditions(qh.conditions, req.query, req.headers)
      );
    }
    return false;
  });

  console.log('Found rule:', rule ? rule.id : 'none');
  if (rule) {
    console.log('Response mode:', rule.responseMode);
    console.log('Weighted responses:', rule.weightedResponses);
  }

  if (!rule) {
    return res.status(404).json({
      error: `No mock endpoint found for ${req.method} ${decodedPath}`,
    });
  }

  processResponse(rule, req, res);
});

function evaluateQueryHeaderConditions(conditions, query, headers) {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every((condition) => {
    const { type, name, operator, value } = condition;
    
    if (!name || !operator || !value) {
      return true;
    }
    
    let actualValue;
    if (type === "query") {
      actualValue = query[name];
    } else if (type === "header") {
      actualValue = headers[name.toLowerCase()];
    }
    
    if (actualValue === undefined || actualValue === null) return false;
    
    const strValue = String(actualValue);
    const strExpected = String(value);
    
    switch (operator) {
      case "equals":
        return strValue === strExpected;
      case "not_equals":
        return strValue !== strExpected;
      case "contains":
        return strValue.includes(strExpected);
      case "regex":
        try {
          const regex = new RegExp(strExpected);
          return regex.test(strValue);
        } catch (e) {
          console.error('Invalid regex pattern:', strExpected, e);
          return false;
        }
      default:
        return false;
    }
  });
}

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
