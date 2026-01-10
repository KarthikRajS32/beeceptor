## Environment Selection Implementation - Beeceptor Clone

### Architecture Overview

#### 1. Environment Manager (`src/lib/environmentManager.js`)
Core logic layer handling all environment operations:

**Key Functions:**
- `getProjectEnvironments(projectId)` - Retrieves all environments for a project
- `getSelectedEnvironment(projectId)` - Gets currently active environment
- `setSelectedEnvironment(projectId, environment)` - Persists environment selection
- `getEnvironmentRules(projectId, environment)` - Filters endpoints by environment
- `addEnvironmentToProject(projectId, envName)` - Creates new environment
- `removeEnvironmentFromProject(projectId, envName)` - Deletes environment (keeps Default)

**Storage:**
- `beeceptor_envs_{projectId}` - List of environments per project
- `beeceptor_selected_env_{projectId}` - Currently selected environment
- `beeceptor_endpoints` - Endpoints with `environment` field for scoping

#### 2. Environment Selector Component (`src/components/EnvironmentSelector.jsx`)
Beeceptor-style dropdown UI:

**Features:**
- Displays current environment
- Dropdown list of all project environments
- Add new environment form (inline)
- Delete environment button (except Default)
- Keyboard support (Enter to add, Escape to cancel)

**Props:**
```javascript
{
  selectedEnvironment: string,
  onEnvironmentChange: (env) => void,
  environments: string[],
  onAddEnvironment: (name) => void,
  onRemoveEnvironment: (name) => void
}
```

#### 3. UserDashboard Integration
Project details view includes environment selector:

**State Management:**
```javascript
const [selectedEnvironment, setSelectedEnvironmentState] = useState('Default');
const [projectEnvironments, setProjectEnvironments] = useState([]);
```

**Initialization (useEffect):**
```javascript
useEffect(() => {
  if (selectedProject) {
    setSelectedEnvironmentState(getSelectedEnvironment(selectedProject.id));
    setProjectEnvironments(getProjectEnvironments(selectedProject.id));
  }
}, [selectedProject]);
```

**Environment-Scoped Endpoints:**
```javascript
const getProjectEndpoints = (projectId) => {
  return getEnvironmentRules(projectId, selectedEnvironment);
};
```

#### 4. Data Flow

```
User selects environment
    ↓
EnvironmentSelector.onEnvironmentChange()
    ↓
UserDashboard.handleEnvironmentChange()
    ↓
setSelectedEnvironment(projectId, environment) [localStorage]
    ↓
setSelectedEnvironmentState(environment) [React state]
    ↓
getProjectEndpoints() re-filters endpoints
    ↓
Table re-renders with environment-specific rules
```

### Default Environments
- Default
- Dev
- QA
- Prod

### Key Behaviors

**Environment Persistence:**
- Selected environment persists across page reloads
- Per-project (different projects can have different selected environments)
- Stored in localStorage with project ID key

**Rule Scoping:**
- Endpoints tagged with `environment` field
- `getEnvironmentRules()` returns endpoints matching selected environment OR Default
- Default environment rules apply to all environments (fallback)
- Environment-specific rules override Default

**Environment Management:**
- Cannot delete Default environment
- Switching to deleted environment reverts to Default
- New environments created on-demand
- Environments are project-specific

### Usage Example

```javascript
// In UserDashboard project details view
<EnvironmentSelector
  selectedEnvironment={selectedEnvironment}
  onEnvironmentChange={handleEnvironmentChange}
  environments={projectEnvironments}
  onAddEnvironment={(name) => {
    const updated = handleAddEnvironment(selectedProject.id, name);
    setProjectEnvironments(updated);
  }}
  onRemoveEnvironment={(name) => {
    const updated = handleRemoveEnvironment(selectedProject.id, name);
    setProjectEnvironments(updated);
  }}
/>
```

### localStorage Schema

```javascript
// Environments list
localStorage['beeceptor_envs_proj_123'] = '["Default","Dev","QA","Prod"]'

// Selected environment
localStorage['beeceptor_selected_env_proj_123'] = 'Dev'

// Endpoints with environment field
localStorage['beeceptor_endpoints'] = [
  {
    id: 'ep_1',
    name: '/api/users',
    projectId: 'proj_123',
    environment: 'Dev',
    method: 'GET',
    ...
  },
  {
    id: 'ep_2',
    name: '/api/users',
    projectId: 'proj_123',
    environment: 'Default',
    method: 'GET',
    ...
  }
]
```

### Matching Beeceptor Behavior

✅ Environment dropdown in project details
✅ Project-specific environments
✅ Multiple environments (Default, Dev, QA, Prod)
✅ Environment-scoped mock rules
✅ Persistent environment selection
✅ Default environment as fallback
✅ Add/remove environments UI
✅ localStorage persistence
✅ No database required
