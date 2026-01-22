// ============================================================================
// QUERY & HEADER RULE BACKEND INTEGRATION
// Add this code to server.js
// ============================================================================

// 1. Add after other in-memory storage declarations:
let queryHeaderRules = [];

// 2. Add these API endpoints:

app.post('/api/query-header-rules', (req, res) => {
  const { rules } = req.body;
  queryHeaderRules = rules || [];
  res.json({ success: true });
});

app.get('/api/query-header-rules/:endpointId', (req, res) => {
  const { endpointId } = req.params;
  const rules = queryHeaderRules.filter(r => r.endpointId === endpointId);
  res.json(rules);
});

// 3. Add this helper function:

function evaluateQueryHeaderConditions(conditions, query, headers) {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every(condition => {
    const { type, name, operator, value } = condition;

    let actualValue;
    if (type === 'query') {
      actualValue = query[name];
    } else if (type === 'header') {
      actualValue = headers[name.toLowerCase()];
    }

    if (actualValue === undefined || actualValue === null) {
      return false;
    }

    const strValue = String(actualValue);
    const strExpected = String(value);

    switch (operator) {
      case 'equals':
        return strValue === strExpected;
      case 'not_equals':
        return strValue !== strExpected;
      case 'contains':
        return strValue.includes(strExpected);
      default:
        return false;
    }
  });
}

// 4. Replace the existing matchesCondition function with this enhanced version:

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

  // Check path matching
  let pathMatches = false;
  switch (matchType) {
    case 'path_exact':
      pathMatches = endpointPath === matchValue;
      break;
    case 'path_starts':
      pathMatches = endpointPath.startsWith(matchValue);
      break;
    case 'path_contains':
      pathMatches = endpointPath.includes(matchValue);
      break;
    case 'path_template':
      pathMatches = matchTemplate(endpointPath, matchValue);
      break;
    case 'path_regex':
      try {
        const regex = new RegExp(matchValue);
        pathMatches = regex.test(endpointPath);
      } catch {
        pathMatches = false;
      }
      break;
    case 'body_contains':
      const bodyStr =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body || '');
      pathMatches = bodyStr.includes(matchValue);
      break;
    case 'body_param':
      pathMatches = matchBodyParamAdvanced(
        req.body,
        paramName,
        paramOperator,
        paramValue
      );
      break;
    case 'body_regex':
      try {
        const bodyStr =
          typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body || '');
        const regex = new RegExp(matchValue);
        pathMatches = regex.test(bodyStr);
      } catch {
        pathMatches = false;
      }
      break;
    case 'header_regex':
      try {
        const regex = new RegExp(headerValue);
        const headerVal = req.headers[headerName.toLowerCase()];
        pathMatches = headerVal && regex.test(headerVal);
      } catch {
        pathMatches = false;
      }
      break;
    default:
      pathMatches = endpointPath === matchValue;
  }

  if (!pathMatches) return false;

  // Check query/header conditions (AND logic)
  if (rule.queryHeaderRuleId) {
    const qhRule = queryHeaderRules.find(r => r.id === rule.queryHeaderRuleId);
    if (qhRule && qhRule.conditions && qhRule.conditions.length > 0) {
      return evaluateQueryHeaderConditions(qhRule.conditions, req.query, req.headers);
    }
  }

  return true;
}

// 5. Update the catch-all route logging to include query/header info:

app.all('*', (req, res) => {
  const decodedPath = decodeURIComponent(req.path);
  const urlParts = decodedPath.split('/').filter((part) => part);

  if (urlParts.length === 0) {
    return res.status(404).json({ error: 'Project name required' });
  }

  const projectName = urlParts[0];
  const endpointPath = '/' + urlParts.slice(1).join('/');

  console.log('Request:', req.method, decodedPath);
  console.log('Query:', req.query);
  console.log('Headers:', Object.keys(req.headers));

  // Find matching endpoint rule with query/header support
  const rule = endpointRules.find(
    (r) =>
      r.projectName === projectName &&
      r.method === req.method.toUpperCase() &&
      matchesCondition(r, req, projectName, endpointPath)
  );

  console.log('Matched rule:', rule ? `${rule.method} ${rule.path}` : 'No match');

  if (!rule) {
    return res.status(404).json({
      error: `No mock endpoint found for ${req.method} ${decodedPath}`,
    });
  }

  processResponse(rule, req, res);
});
