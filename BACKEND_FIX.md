# BACKEND CONNECTIVITY FIX

## CRITICAL: Server Must Be Running

The "Cannot connect to server" error occurs because the backend server is not running.

## STEP-BY-STEP FIX:

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```

### 2. Verify Server is Running
- Open browser: http://localhost:3001/health
- Should see: `{"status":"OK","timestamp":"...","port":3001}`

### 3. Test Frontend Connection
- Open browser console (F12)
- Type: `testServerConnection()`
- Should see: "✅ Server is running and accessible!"

### 4. Create API Endpoint
- Click "Create API" button
- Fill form and click "Save Rule"
- Should work without "Cannot connect to server" error

## TROUBLESHOOTING:

### If server won't start:
```bash
cd server
npm install express cors
npm start
```

### If port 3001 is busy:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Then restart server
npm start
```

### Test with simple server:
```bash
node ../test-server.js
```

## VERIFICATION:
✅ Server running on http://localhost:3001
✅ Health check responds
✅ CORS enabled for all origins
✅ POST /api/endpoints route exists
✅ Frontend can create endpoints successfully

## FINAL RESULT:
Create API → Save Rule → ✅ SUCCESS (no errors)