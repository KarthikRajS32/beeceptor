# Beeceptor Clone - Mock API Testing

A Beeceptor-like application for creating and testing mock APIs locally.

## Setup Instructions

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Start the Backend Server
```bash
cd server
npm start
```
The server will run on http://localhost:3001

### 3. Start the Frontend (in a new terminal)
```bash
npm run dev
```
The frontend will run on http://localhost:5173

## How to Use

1. **Create a Project**: Click "Create New Project" and give it a name (e.g., "demo")

2. **Add Endpoints**: 
   - Click on your project to view details
   - Click "Create New Endpoint"
   - Configure your endpoint:
     - Method: GET, POST, PUT, DELETE, etc.
     - Path: /users, /api/data, etc.
     - Response delay, status code, headers, and body

3. **Test Your Endpoints**:
   - After creating an endpoint, you'll see a test URL in the endpoint table
   - Click the test button or visit the URL directly in your browser
   - Example: http://localhost:3001/demo/users

## Example Usage

1. Create project named "demo"
2. Add GET endpoint "/users" with response body:
   ```json
   {
     "users": [
       {"id": 1, "name": "John Doe"},
       {"id": 2, "name": "Jane Smith"}
     ]
   }
   ```
3. Visit http://localhost:3001/demo/users to see your mock response

## Features

- ✅ Create projects and endpoints
- ✅ Configure HTTP method, path, status, headers, body, and delay
- ✅ Test endpoints directly in browser
- ✅ Real-time mock API responses
- ✅ Beeceptor-style URL structure
- ✅ In-memory endpoint storage