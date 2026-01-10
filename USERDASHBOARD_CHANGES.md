## UserDashboard.jsx - Required Code Additions

### Addition 1: Update Imports (Top of File)

**Current:**
```javascript
import { getProjectEnvironments, getSelectedEnvironment, setSelectedEnvironment, getEnvironmentRules, saveEndpointWithEnvironment, deleteEndpointFromEnvironment } from "../lib/environmentManager";
```

**Change To:**
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

---

### Addition 2: Add EnvironmentSelector to Project Details Header

**Location:** After the Project Header section (around line 1100)

**Find This Code:**
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

**Add This After (New Code):**
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

---

### Addition 3: Update handleCreateEndpoint Function

**Location:** In the `handleCreateEndpoint` function, when creating new endpoint

**Find This Code (around line 350):**
```javascript
// Create new endpoint for frontend display
const newEndpoint = {
  id: `ep_${Date.now()}`,
  name: newEndpointName,
  projectId: selectedProject.id,
  createdDate: new Date().toISOString().split("T")[0],
  requestCount: 0,
  method: newEndpointMethod,
  delay: newEndpointDelay,
  status: newEndpointStatus,
  headers: newEndpointHeaders,
  body: newEndpointBody,
  description: newRuleDescription,
  matchType: newMatchType,
  responseMode: newResponseMode,
  isFile: newIsFile,
  stateConditions: stateConditions,
  requestConditions: requestConditions,
};
```

**Change To (Add environment field):**
```javascript
// Create new endpoint for frontend display
const newEndpoint = {
  id: `ep_${Date.now()}`,
  name: newEndpointName,
  projectId: selectedProject.id,
  environment: selectedEnvironment,  // ADD THIS LINE
  createdDate: new Date().toISOString().split("T")[0],
  requestCount: 0,
  method: newEndpointMethod,
  delay: newEndpointDelay,
  status: newEndpointStatus,
  headers: newEndpointHeaders,
  body: newEndpointBody,
  description: newRuleDescription,
  matchType: newMatchType,
  responseMode: newResponseMode,
  isFile: newIsFile,
  stateConditions: stateConditions,
  requestConditions: requestConditions,
};
```

---

### Addition 4: Update Endpoint Editing

**Location:** In the `handleEditEndpoint` function

**Find This Code (around line 280):**
```javascript
const handleEditEndpoint = (endpoint) => {
  setEditingEndpoint(endpoint);
  setNewEndpointName(endpoint.name);
  setNewEndpointMethod(endpoint.method);
  // ... rest of fields
  setShowCreateEndpointModal(true);
};
```

**No changes needed** - The endpoint already has environment field, it will be preserved during edit.

---

### Addition 5: Update Endpoint Update Logic

**Location:** In `handleCreateEndpoint`, when updating existing endpoint

**Find This Code (around line 320):**
```javascript
// Update existing endpoint in frontend
const updatedEndpoint = {
  ...editingEndpoint,
  name: newEndpointName,
  method: newEndpointMethod,
  delay: newEndpointDelay,
  status: newEndpointStatus,
  headers: newEndpointHeaders,
  body: newEndpointBody,
  description: newRuleDescription,
  matchType: newMatchType,
  responseMode: newResponseMode,
  isFile: newIsFile,
  stateConditions: stateConditions,
  requestConditions: requestConditions,
};
```

**Change To (Preserve environment):**
```javascript
// Update existing endpoint in frontend
const updatedEndpoint = {
  ...editingEndpoint,
  name: newEndpointName,
  method: newEndpointMethod,
  delay: newEndpointDelay,
  status: newEndpointStatus,
  headers: newEndpointHeaders,
  body: newEndpointBody,
  description: newRuleDescription,
  matchType: newMatchType,
  responseMode: newResponseMode,
  isFile: newIsFile,
  stateConditions: stateConditions,
  requestConditions: requestConditions,
  environment: editingEndpoint.environment,  // ADD THIS LINE - preserve environment
};
```

---

### Complete Integration Checklist

- [ ] Update imports to include `addEnvironmentToProject`, `removeEnvironmentFromProject`
- [ ] Add EnvironmentSelector component to project details header
- [ ] Add `environment: selectedEnvironment` to new endpoint creation
- [ ] Add `environment: editingEndpoint.environment` to endpoint update
- [ ] Test environment switching
- [ ] Test adding new environment
- [ ] Test removing environment
- [ ] Test endpoint filtering by environment
- [ ] Test localStorage persistence
- [ ] Test page reload maintains environment selection

---

### Quick Copy-Paste Sections

**Import Statement (Replace entire import line):**
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

**Environment Selector UI (Add after Project Header):**
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

**New Endpoint Creation (Add to newEndpoint object):**
```javascript
environment: selectedEnvironment,
```

**Endpoint Update (Add to updatedEndpoint object):**
```javascript
environment: editingEndpoint.environment,
```

---

### Verification Steps

After making changes:

1. **Compile Check**
   ```bash
   npm run dev
   ```
   Should compile without errors

2. **Functional Test**
   - Navigate to project details
   - Verify environment selector appears
   - Click dropdown, verify environments list
   - Create endpoint in Default
   - Switch to Dev
   - Create endpoint in Dev
   - Switch back to Default
   - Verify only Default endpoint shows
   - Switch to Dev
   - Verify both endpoints show

3. **Persistence Test**
   - Select Dev environment
   - Reload page
   - Verify Dev is still selected
   - Verify endpoints are filtered correctly

4. **Add/Remove Test**
   - Click "Add Environment"
   - Type "Staging"
   - Press Enter
   - Verify "Staging" appears in dropdown
   - Click delete on "Staging"
   - Verify it's removed

---

### Troubleshooting

**Environment selector not showing:**
- Verify EnvironmentSelector component is imported
- Check that you're in project details view (not projects list)
- Verify selectedProject is not null

**Endpoints not filtering:**
- Check that getProjectEndpoints is being called
- Verify selectedEnvironment state is updating
- Check localStorage for environment field in endpoints

**Add environment not working:**
- Verify addEnvironmentToProject is imported
- Check that projectEnvironments state is updating
- Verify localStorage key format: `beeceptor_envs_{projectId}`

**Environment not persisting:**
- Check browser localStorage (DevTools → Application → Storage)
- Verify setSelectedEnvironment is being called
- Check localStorage key: `beeceptor_selected_env_{projectId}`
