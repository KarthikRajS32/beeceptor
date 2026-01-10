## Integration Guide - Adding EnvironmentSelector to UserDashboard

### Step 1: Import EnvironmentSelector
Already done in UserDashboard.jsx:
```javascript
import EnvironmentSelector from "../components/EnvironmentSelector";
```

### Step 2: Add Environment State (Already Present)
```javascript
const [selectedEnvironment, setSelectedEnvironmentState] = useState('Default');
const [projectEnvironments, setProjectEnvironments] = useState([]);
```

### Step 3: Initialize Environments on Project Selection (Already Present)
```javascript
useEffect(() => {
  if (selectedProject) {
    setSelectedEnvironmentState(getSelectedEnvironment(selectedProject.id));
    setProjectEnvironments(getProjectEnvironments(selectedProject.id));
  }
}, [selectedProject]);
```

### Step 4: Add Handler Functions (Already Present)
```javascript
const handleEnvironmentChange = (environment) => {
  if (selectedProject) {
    setSelectedEnvironmentState(environment);
    setSelectedEnvironment(selectedProject.id, environment);
  }
};
```

### Step 5: Add EnvironmentSelector to Project Details Header

**Location:** In the "Project Details View" section, after the project title

**Current Code (around line 1100):**
```javascript
{/* Project Header */}
<div className="flex justify-between items-center mb-10">
  <span>
    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
      {selectedProject.name}
    </h1>
    <p className="text-gray-700 text-md">
      {getProjectEndpoints(selectedProject.id).length} endpoints
      in this project
    </p>
  </span>

  <div className="flex gap-4">
    <button
      onClick={() => setShowMockingRulesOnboarding(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Endpoint Rules
    </button>
  </div>
</div>
```

**Add After Project Header (New Code):**
```javascript
{/* Environment Selector */}
<div className="mb-8 flex items-center gap-4">
  <span className="text-sm font-medium text-gray-600">Environment:</span>
  <EnvironmentSelector
    selectedEnvironment={selectedEnvironment}
    onEnvironmentChange={handleEnvironmentChange}
    environments={projectEnvironments}
    onAddEnvironment={(name) => {
      const updated = addEnvironmentToProject(selectedProject.id, name);
      setProjectEnvironments(updated);
    }}
    onRemoveEnvironment={(name) => {
      const updated = removeEnvironmentFromProject(selectedProject.id, name);
      setProjectEnvironments(updated);
    }}
  />
</div>
```

### Step 6: Import Environment Functions
Add to imports at top of UserDashboard.jsx:
```javascript
import { 
  getProjectEnvironments, 
  getSelectedEnvironment, 
  setSelectedEnvironment, 
  getEnvironmentRules, 
  saveEndpointWithEnvironment, 
  deleteEndpointFromEnvironment,
  addEnvironmentToProject,
  removeEnvironmentFromProject
} from "../lib/environmentManager";
```

### Step 7: Update Endpoint Creation to Include Environment

In `handleCreateEndpoint()`, when creating new endpoint:
```javascript
const newEndpoint = {
  id: `ep_${Date.now()}`,
  name: newEndpointName,
  projectId: selectedProject.id,
  environment: selectedEnvironment,  // ADD THIS LINE
  createdDate: new Date().toISOString().split("T")[0],
  requestCount: 0,
  method: newEndpointMethod,
  // ... rest of fields
};
```

### Step 8: Verify getProjectEndpoints Uses Environment

Already implemented:
```javascript
const getProjectEndpoints = (projectId) => {
  return getEnvironmentRules(projectId, selectedEnvironment);
};
```

This automatically filters endpoints by the selected environment.

### Complete Integration Checklist

- [x] EnvironmentSelector component created
- [x] environmentManager.js with all functions
- [x] State variables in UserDashboard
- [x] useEffect to initialize environments
- [x] handleEnvironmentChange function
- [x] getProjectEndpoints filters by environment
- [ ] Add EnvironmentSelector UI to project details header
- [ ] Import addEnvironmentToProject, removeEnvironmentFromProject
- [ ] Update endpoint creation to include environment field
- [ ] Test environment switching
- [ ] Test adding/removing environments
- [ ] Test localStorage persistence

### Testing Checklist

1. **Create Project** → Create endpoints in Default environment
2. **Switch to Dev** → Endpoints should still show (Default is fallback)
3. **Add Dev-specific endpoint** → Should only show in Dev
4. **Switch back to Default** → Dev endpoint should disappear
5. **Add new environment** → Should appear in dropdown
6. **Delete environment** → Should revert to Default
7. **Reload page** → Selected environment should persist
8. **Different project** → Should have independent environment selection
