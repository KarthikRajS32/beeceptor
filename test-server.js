// Simple server test script
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    port: PORT,
    message: 'Server is running successfully!'
  });
});

// Test POST endpoint
app.post('/api/endpoints', (req, res) => {
  console.log('✅ POST /api/endpoints received');
  console.log('Request body:', req.body);
  res.json({ 
    success: true, 
    message: 'Endpoint created successfully',
    data: req.body
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/endpoints`);
  console.log(`\n✅ Server is ready to accept requests!\n`);
});