// Beeceptor-compatible Template Engine
class TemplateEngine {
  constructor() {
    this.helpers = {
      // Comparison helpers
      equals: (a, b) => a === b,
      notEquals: (a, b) => a !== b,
      contains: (str, substr) => String(str).includes(String(substr)),
      startsWith: (str, prefix) => String(str).startsWith(String(prefix)),
      endsWith: (str, suffix) => String(str).endsWith(String(suffix)),
      gt: (a, b) => Number(a) > Number(b),
      lt: (a, b) => Number(a) < Number(b),
      gte: (a, b) => Number(a) >= Number(b),
      lte: (a, b) => Number(a) <= Number(b),
      
      // Math operations
      add: (a, b) => Number(a) + Number(b),
      subtract: (a, b) => Number(a) - Number(b),
      multiply: (a, b) => Number(a) * Number(b),
      divide: (a, b) => Number(a) / Number(b),
      
      // String manipulation
      uppercase: (str) => String(str).toUpperCase(),
      lowercase: (str) => String(str).toLowerCase(),
      capitalize: (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase(),
      
      // Date formatting
      formatDate: (timestamp, format) => this.formatDate(timestamp, format),
      
      // Array/Object helpers
      length: (arr) => Array.isArray(arr) ? arr.length : Object.keys(arr || {}).length,
      keys: (obj) => Object.keys(obj || {}),
      
      // Built-in helpers
      timestamp: () => Date.now(),
      uuid: () => this.generateUUID(),
      randomNumber: (min = 0, max = 1000000) => Math.floor(Math.random() * (max - min + 1)) + min,
      randomString: (length = 8) => Math.random().toString(36).substring(2, 2 + length),
      randomBoolean: () => Math.random() > 0.5,
      currentDate: () => new Date().toISOString().split('T')[0],
      currentTime: () => new Date().toTimeString().split(' ')[0],
      
      // Faker helpers
      faker: (path) => this.getFakerValue(path)
    };
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getFakerValue(path) {
    const fakerMap = {
      // Person
      'person.firstName': ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Emma', 'James'][Math.floor(Math.random() * 8)],
      'person.lastName': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)],
      'person.fullName': ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'David Brown', 'Lisa Garcia'][Math.floor(Math.random() * 6)],
      'person.jobTitle': ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Marketing Manager', 'Sales Director'][Math.floor(Math.random() * 6)],
      'person.gender': ['Male', 'Female', 'Non-binary'][Math.floor(Math.random() * 3)],
      
      // Internet
      'internet.email': `user${Math.floor(Math.random() * 1000)}@example.com`,
      'internet.username': `user${Math.floor(Math.random() * 1000)}`,
      'internet.password': Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      'internet.url': `https://example${Math.floor(Math.random() * 100)}.com`,
      
      // Phone
      'phone.number': `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      
      // Location
      'location.streetAddress': `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
      'location.city': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'][Math.floor(Math.random() * 7)],
      'location.state': ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA'][Math.floor(Math.random() * 8)],
      'location.zipCode': `${Math.floor(Math.random() * 90000) + 10000}`,
      'location.country': ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'][Math.floor(Math.random() * 6)],
      
      // Company
      'company.name': ['Acme Corp', 'Tech Solutions', 'Global Industries', 'Innovation Labs', 'Digital Dynamics', 'Future Systems'][Math.floor(Math.random() * 6)],
      'company.catchPhrase': ['Innovative solutions', 'Quality first', 'Customer focused', 'Technology leaders'][Math.floor(Math.random() * 4)],
      
      // Finance
      'finance.amount': (Math.random() * 10000).toFixed(2),
      'finance.creditCardNumber': `4${Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0')}`,
      
      // Date
      'date.past': new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      'date.future': new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      
      // Lorem
      'lorem.word': ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'][Math.floor(Math.random() * 8)],
      'lorem.sentence': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'lorem.paragraph': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    };
    return fakerMap[path] || `[${path}]`;
  }

  buildContext(req, environment, globalVars, stateStore) {
    return {
      request: {
        method: req.method,
        headers: req.headers || {},
        query: req.query || {},
        body: req.body || {},
        path: req.path || '',
        ip: req.ip || req.connection?.remoteAddress || 'unknown'
      },
      environment: environment || 'Default',
      globals: globalVars || {},
      state: stateStore || {},
      helpers: this.helpers
    };
  }

  processTemplate(template, context) {
    if (!template || typeof template !== 'string') {
      return template;
    }

    try {
      // Process loop blocks first
      let result = this.processLoops(template, context);
      
      // Process conditional blocks
      result = this.processConditionals(result, context);
      
      // Process variable substitutions
      result = this.processVariables(result, context);
      
      return result;
    } catch (error) {
      console.error('Template processing error:', error);
      return `[Template Error: ${error.message}]`;
    }
  }

  processConditionals(template, context) {
    // Process {{#if condition}} {{else}} {{/if}} blocks
    const ifRegex = /{{#if\s+(.+?)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;
    
    return template.replace(ifRegex, (match, condition, trueBranch, falseBranch = '') => {
      try {
        const conditionResult = this.evaluateCondition(condition.trim(), context);
        return conditionResult ? trueBranch : falseBranch;
      } catch (error) {
        return `[Condition Error: ${error.message}]`;
      }
    });
  }

  evaluateCondition(condition, context) {
    // Handle helper functions with parameters
    const helperMatch = condition.match(/(\w+)\s+(.+)/);
    if (helperMatch) {
      const [, helperName, params] = helperMatch;
      if (this.helpers[helperName]) {
        const args = this.parseParameters(params, context);
        return this.helpers[helperName](...args);
      }
    }

    // Handle simple variable access
    return this.resolveValue(condition, context);
  }

  parseParameters(params, context) {
    // Split parameters by spaces, handling quoted strings
    const args = [];
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    
    while ((match = regex.exec(params)) !== null) {
      const value = match[1] || match[2] || match[3];
      
      // If it's a quoted string, use as-is
      if (match[1] || match[2]) {
        args.push(value);
      } else {
        // Try to resolve as variable or convert to appropriate type
        const resolved = this.resolveValue(value, context);
        args.push(resolved !== undefined ? resolved : value);
      }
    }
    
    return args;
  }

  processVariables(template, context) {
    // Process {{variable}} substitutions
    const varRegex = /{{([^#\/][^}]*)}}/g;
    
    return template.replace(varRegex, (match, expression) => {
      try {
        const trimmed = expression.trim();
        
        // Handle helper functions
        const helperMatch = trimmed.match(/(\w+)\s+(.+)/);
        if (helperMatch) {
          const [, helperName, params] = helperMatch;
          if (this.helpers[helperName]) {
            const args = this.parseParameters(params, context);
            return this.helpers[helperName](...args);
          }
        }
        
        // Handle simple variables
        const value = this.resolveValue(trimmed, context);
        return value !== undefined ? value : match;
      } catch (error) {
        return `[Variable Error: ${error.message}]`;
      }
    });
  }

  resolveValue(path, context) {
    // Handle dot notation (e.g., request.headers.authorization)
    const parts = path.split('.');
    let current = context;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  formatDate(timestamp, format) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  processLoops(template, context) {
    const eachRegex = /{{#each\s+(.+?)}}([\s\S]*?){{\/each}}/g;
    
    return template.replace(eachRegex, (match, arrayPath, loopBody) => {
      try {
        const arrayValue = this.resolveValue(arrayPath.trim(), context);
        if (!Array.isArray(arrayValue)) {
          return `[Loop Error: ${arrayPath} is not an array]`;
        }
        
        return arrayValue.map((item, index) => {
          const loopContext = {
            ...context,
            '@index': index,
            '@first': index === 0,
            '@last': index === arrayValue.length - 1,
            '@key': index,
            'this': item
          };
          
          // Process nested loops and conditionals within loop body
          let processedBody = this.processConditionals(loopBody, loopContext);
          processedBody = this.processVariables(processedBody, loopContext);
          
          return processedBody;
        }).join('');
      } catch (error) {
        return `[Loop Error: ${error.message}]`;
      }
    });
  }

  validate(template) {
    const errors = [];
    
    // Check for unmatched conditional blocks
    const ifCount = (template.match(/{{#if/g) || []).length;
    const endifCount = (template.match(/{{\/if}}/g) || []).length;
    
    if (ifCount !== endifCount) {
      errors.push('Unmatched {{#if}} and {{/if}} blocks');
    }
    
    // Check for unmatched loop blocks
    const eachCount = (template.match(/{{#each/g) || []).length;
    const endeachCount = (template.match(/{{\/each}}/g) || []).length;
    
    if (eachCount !== endeachCount) {
      errors.push('Unmatched {{#each}} and {{/each}} blocks');
    }
    
    // Check for invalid syntax
    const invalidSyntax = template.match(/{{[^}]*$/);
    if (invalidSyntax) {
      errors.push('Unclosed template expression');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = TemplateEngine;