const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// In-memory storage for endpoint rules
let endpointRules = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.raw());

// API endpoint to save endpoint rules
app.post("/api/endpoints", (req, res) => {
  const {
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

  console.log('Received delay:', delay, 'Type:', typeof delay);

  const rule = {
    id: Date.now().toString(),
    projectName,
    method: method.toUpperCase(),
    path,
    matchType: matchType || "path_exact",
    delay: parseInt(delay) || 0,
    status: parseInt(status) || 200,
    headers: headers
      ? JSON.parse(headers)
      : { "Content-Type": "application/json" },
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

  // Remove existing rule with same project, method, and path
  endpointRules = endpointRules.filter(
    (r) =>
      !(
        r.projectName === projectName &&
        r.method === method.toUpperCase() &&
        r.path === path &&
        r.matchType === matchType
      )
  );

  endpointRules.push(rule);
  res.json({ success: true, rule });
});

// API endpoint to get all endpoint rules
app.get("/api/endpoints", (req, res) => {
  res.json(endpointRules);
});

// API endpoint to delete endpoint rule
app.delete("/api/endpoints/:id", (req, res) => {
  const { id } = req.params;
  endpointRules = endpointRules.filter((r) => r.id !== id);
  res.json({ success: true });
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

  const projectName = urlParts[0];
  const endpointPath = "/" + urlParts.slice(1).join("/");

  console.log('Request:', req.method, decodedPath);
  console.log('All rules:', endpointRules.length);

  // Find matching endpoint rule
  const rule = endpointRules.find(
    (r) =>
      r.projectName === projectName &&
      r.method === req.method.toUpperCase() &&
      matchesCondition(r, req, projectName, endpointPath)
  );

  console.log('Matched rule:', rule ? `${rule.method} ${rule.path} (delay: ${rule.delay}s)` : 'No match');

  if (!rule) {
    return res.status(404).json({
      error: `No mock endpoint found for ${req.method} ${decodedPath}`,
    });
  }

  processResponse(rule, req, res);
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  // console.log('Stored endpoints:', endpointRules.map(r => `${r.method} ${r.projectName}${r.path}`));
});
