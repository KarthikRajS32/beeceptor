// Query & Header Rule Engine - Beeceptor-compatible request matching

export const QUERY_HEADER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  REGEX: 'regex',
};

export const CONDITION_TYPES = {
  QUERY: 'query',
  HEADER: 'header',
};

export const OPERATOR_LABELS = {
  [QUERY_HEADER_OPERATORS.EQUALS]: 'equals',
  [QUERY_HEADER_OPERATORS.NOT_EQUALS]: 'not equals',
  [QUERY_HEADER_OPERATORS.CONTAINS]: 'contains',
  [QUERY_HEADER_OPERATORS.REGEX]: 'regex',
};

// localStorage schema for query/header rules
export const RULE_STORAGE_KEY = 'beeceptor_query_header_rules';

export const createQueryHeaderRule = (endpointId, conditions = []) => ({
  id: `qh_${Date.now()}`,
  endpointId,
  conditions,
  createdAt: new Date().toISOString(),
});

export const saveQueryHeaderRules = (rules) => {
  localStorage.setItem(RULE_STORAGE_KEY, JSON.stringify(rules));
};

export const getQueryHeaderRules = () => {
  try {
    const stored = localStorage.getItem(RULE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse query/header rules from localStorage:', e);
    return [];
  }
};

export const getEndpointQueryHeaderRules = (endpointId) => {
  const rules = getQueryHeaderRules();
  return rules.filter(r => r.endpointId === endpointId);
};

export const deleteQueryHeaderRule = (ruleId) => {
  const rules = getQueryHeaderRules();
  const filtered = rules.filter(r => r.id !== ruleId);
  saveQueryHeaderRules(filtered);
};

export const updateQueryHeaderRule = (ruleId, conditions) => {
  const rules = getQueryHeaderRules();
  const updated = rules.map(r => 
    r.id === ruleId ? { ...r, conditions } : r
  );
  saveQueryHeaderRules(updated);
};

// Evaluate a single condition against request
const evaluateCondition = (condition, query, headers) => {
  const { type, name, operator, value } = condition;
  
  if (!name || !operator || !value) {
    return false;
  }
  
  let actualValue;
  if (type === CONDITION_TYPES.QUERY) {
    actualValue = query[name];
  } else if (type === CONDITION_TYPES.HEADER) {
    actualValue = headers[name.toLowerCase()];
  }
  
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  const strValue = String(actualValue);
  const strExpected = String(value);

  switch (operator) {
    case QUERY_HEADER_OPERATORS.EQUALS:
      return strValue === strExpected;
    case QUERY_HEADER_OPERATORS.NOT_EQUALS:
      return strValue !== strExpected;
    case QUERY_HEADER_OPERATORS.CONTAINS:
      return strValue.includes(strExpected);
    case QUERY_HEADER_OPERATORS.REGEX:
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
};

// Evaluate all conditions with AND logic
export const evaluateQueryHeaderConditions = (conditions, query, headers) => {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  return conditions.every(condition => {
    if (!condition.name || !condition.operator || !condition.value) {
      return true;
    }
    return evaluateCondition(condition, query, headers);
  });
};

// Find matching rule for endpoint based on query/header conditions
export const findMatchingQueryHeaderRule = (endpointId, query, headers) => {
  const rules = getEndpointQueryHeaderRules(endpointId);
  
  for (const rule of rules) {
    if (rule.conditions && rule.conditions.length > 0) {
      if (evaluateQueryHeaderConditions(rule.conditions, query, headers)) {
        return rule;
      }
    }
  }
  
  return null;
};
