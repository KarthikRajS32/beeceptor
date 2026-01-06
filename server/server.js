const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// In-memory storage for endpoint rules
let endpointRules = [];

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to save endpoint rules
app.post('/api/endpoints', (req, res) => {
  const { projectName, method, path, delay, status, headers, body } = req.body;
  
  const rule = {
    id: Date.now().toString(),
    projectName,
    method: method.toUpperCase(),
    path,
    delay: parseInt(delay) || 0,
    status: parseInt(status) || 200,
    headers: headers ? JSON.parse(headers) : { 'Content-Type': 'application/json' },
    body
  };
  
  // Remove existing rule with same project, method, and path
  endpointRules = endpointRules.filter(r => 
    !(r.projectName === projectName && r.method === method.toUpperCase() && r.path === path)
  );
  
  endpointRules.push(rule);
  res.json({ success: true, rule });
});

// API endpoint to get all endpoint rules
app.get('/api/endpoints', (req, res) => {
  res.json(endpointRules);
});

// API endpoint to delete endpoint rule
app.delete('/api/endpoints/:id', (req, res) => {
  const { id } = req.params;
  endpointRules = endpointRules.filter(r => r.id !== id);
  res.json({ success: true });
});

// Catch-all route for mock API responses
app.all('*', (req, res) => {
  const decodedPath = decodeURIComponent(req.path);
  const urlParts = decodedPath.split('/').filter(part => part);
  
  if (urlParts.length === 0) {
    return res.status(404).json({ error: 'Project name required' });
  }
  
  const projectName = urlParts[0];
  const endpointPath = '/' + urlParts.slice(1).join('/');
  
  // Find matching endpoint rule
  const rule = endpointRules.find(r => 
    r.projectName === projectName && 
    r.method === req.method.toUpperCase() && 
    r.path === endpointPath
  );
  
  if (!rule) {
    return res.status(404).json({ 
      error: `No mock endpoint found for ${req.method} ${decodedPath}` 
    });
  }
  
  // Apply delay if specified
  setTimeout(() => {
    // Set response headers
    Object.entries(rule.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Send response
    res.status(rule.status);
    
    if (rule.body) {
      try {
        const parsedBody = JSON.parse(rule.body);
        res.json(parsedBody);
      } catch {
        res.send(rule.body);
      }
    } else {
      res.end();
    }
  }, rule.delay);
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});