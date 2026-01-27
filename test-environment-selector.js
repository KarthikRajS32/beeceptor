// Test script for EnvironmentSelector functionality
console.log('🧪 Testing EnvironmentSelector...\n');

// Test environment management functions
import { 
  getProjectEnvironments, 
  addEnvironmentToProject, 
  removeEnvironmentFromProject,
  cloneEnvironment,
  getSelectedEnvironment,
  setSelectedEnvironment 
} from './src/lib/environmentManager.js';

const testProjectId = 'test_project_123';

console.log('1. Testing getProjectEnvironments...');
const initialEnvs = getProjectEnvironments(testProjectId);
console.log('Initial environments:', initialEnvs);

console.log('2. Testing addEnvironmentToProject...');
const afterAdd = addEnvironmentToProject(testProjectId, 'Staging');
console.log('After adding Staging:', afterAdd);

console.log('3. Testing environment selection...');
setSelectedEnvironment(testProjectId, 'Staging');
const selected = getSelectedEnvironment(testProjectId);
console.log('Selected environment:', selected);

console.log('4. Testing removeEnvironmentFromProject...');
const afterRemove = removeEnvironmentFromProject(testProjectId, 'Staging');
console.log('After removing Staging:', afterRemove);

console.log('5. Testing selected environment after removal...');
const selectedAfterRemoval = getSelectedEnvironment(testProjectId);
console.log('Selected after removal:', selectedAfterRemoval);

console.log('\n✅ EnvironmentSelector tests completed!');