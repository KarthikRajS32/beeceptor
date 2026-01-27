// Environment Integration - Helper functions for UserDashboard
import { 
  getProjectEnvironments, 
  getSelectedEnvironment, 
  setSelectedEnvironment,
  addEnvironmentToProject,
  removeEnvironmentFromProject
} from './environmentManager';

export const initializeProjectEnvironments = (projectId) => {
  const environments = getProjectEnvironments(projectId);
  const selected = getSelectedEnvironment(projectId);
  return { environments, selected };
};

export const handleEnvironmentSwitch = (projectId, environment) => {
  setSelectedEnvironment(projectId, environment);
  return environment;
};

export const handleAddEnvironment = (projectId, envName) => {
  return addEnvironmentToProject(projectId, envName);
};

export const handleRemoveEnvironment = (projectId, envName) => {
  return removeEnvironmentFromProject(projectId, envName);
};
