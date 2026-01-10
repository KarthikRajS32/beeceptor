## Quick Reference - UserDashboard.jsx Modifications

### File: `src/pages/UserDashboard.jsx`

---

### CHANGE 1: Update Imports (Line ~16)

**Current Line 16:**
```javascript
import { getProjectEnvironments, getSelectedEnvironment, setSelectedEnvironment, getEnvironmentRules, saveEndpointWithEnvironment, deleteEndpointFromEnvironment } from "../lib/environmentManager";
```

**Replace With:**
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

### CHANGE 2: Add EnvironmentSelector UI (After Line ~1100)

**Find This Section:**
```javascript
{/* Project Details View */}
{currentView === "project-details" && selectedProject && (
  <div>
    {/* Back Button */}
    <button
      onClick={handleBackToProjects}
      className="flex items-center px-3 py-2 rounded-md gap-2 text-white bg-blue-600 transition-colors mb-8 text-lg"
    >
      <ArrowLeft className="w-5 h-5" />
      Back to Projects
    </button>

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

**Add This After The Project Header (Before Endpoints Table):**
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

### CHANGE 3: Update New Endpoint Creation (Line ~350)

**Find This Code:**
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

**Add This Line After `projectId`:**
```javascript
          environment: selectedEnvironment,
```

**Result:**
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

### CHANGE 4: Update Endpoint Update Logic (Line ~320)

**Find This Code:**
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

**Add This Line At The End (Before closing brace):**
```javascript
          environment: editingEndpoint.environment,
```

**Result:**
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
          environment: editingEndpoint.environment,  // ADD THIS LINE
        };
```

---

### Summary of Changes

| Change | Type | Location | Lines | Time |
|--------|------|----------|-------|------|
| 1. Update imports | Import | Line 16 | 1 | 1 min |
| 2. Add EnvironmentSelector UI | JSX | After line 1100 | 20 | 3 min |
| 3. Add environment to new endpoint | Object field | Line 350 | 1 | 1 min |
| 4. Preserve environment on update | Object field | Line 320 | 1 | 1 min |

**Total Time: ~6 minutes**

---

### Verification Checklist

After making changes:

- [ ] File compiles without errors (`npm run dev`)
- [ ] No TypeScript/ESLint errors
- [ ] Environment selector appears in project details
- [ ] Can switch environments
- [ ] Can add new environment
- [ ] Can remove environment
- [ ] Endpoints filter by environment
- [ ] Default environment rules show in all environments
- [ ] Environment selection persists on reload
- [ ] Multiple projects have independent environments

---

### Rollback Instructions

If needed to revert:

1. **Revert imports**: Remove `addEnvironmentToProject`, `removeEnvironmentFromProject`
2. **Remove EnvironmentSelector UI**: Delete the entire environment selector div
3. **Remove environment field**: Delete `environment: selectedEnvironment,` from new endpoint
4. **Remove environment preservation**: Delete `environment: editingEndpoint.environment,` from updated endpoint

---

### Common Issues & Fixes

**Issue: "EnvironmentSelector is not defined"**
- Fix: Verify import statement includes EnvironmentSelector
- Check: `import EnvironmentSelector from "../components/EnvironmentSelector";`

**Issue: "addEnvironmentToProject is not defined"**
- Fix: Add to imports from environmentManager
- Check: Line 16 imports include `addEnvironmentToProject`

**Issue: Environment selector not showing**
- Fix: Verify you're in project details view (not projects list)
- Check: `currentView === "project-details"`

**Issue: Endpoints not filtering**
- Fix: Verify `getProjectEndpoints()` is being called
- Check: Table uses `getProjectEndpoints(selectedProject.id)`

**Issue: Environment not persisting**
- Fix: Check browser localStorage
- DevTools → Application → Storage → localStorage
- Look for keys: `beeceptor_envs_*` and `beeceptor_selected_env_*`

---

### Testing Commands

```bash
# Start development server
npm run dev

# Check for errors
npm run lint

# Build for production
npm run build
```

---

### File Locations Reference

- **Core Logic**: `src/lib/environmentManager.js`
- **UI Component**: `src/components/EnvironmentSelector.jsx`
- **Integration**: `src/pages/UserDashboard.jsx`
- **Documentation**: `USERDASHBOARD_CHANGES.md`

---

### Quick Copy-Paste

**Import Statement:**
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

**EnvironmentSelector Component:**
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

**New Endpoint Field:**
```javascript
environment: selectedEnvironment,
```

**Updated Endpoint Field:**
```javascript
environment: editingEndpoint.environment,
```
