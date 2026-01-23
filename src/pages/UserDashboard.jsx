import React, { useState, useEffect } from "react";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import { FolderOpen, Plus, Edit2, Trash2, Calendar, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ user, onLogout }) => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectViewMode, setProjectViewMode] = useState("card"); // 'card' | 'table'
  const [editingProject, setEditingProject] = useState(null);
  const [copiedProjectUrl, setCopiedProjectUrl] = useState(null);
  const navigate = useNavigate();

  // Redundant handles in component, App.jsx now handles protection via ProtectedRoute

  // Load data from localStorage or use default mock data
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('beeceptor_projects');
    return saved ? JSON.parse(saved) : [
      {
        id: "proj_1",
        name: "project-alpha",
        url: "https://project-alpha.arjava.com",
        createdDate: "2024-01-15",
        endpointCount: 5,
        userId: user?.id,
      },
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('beeceptor_projects', JSON.stringify(projects));
  }, [projects]);

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setProjects(projects.filter((p) => p.id !== projectId));
    // Also remove endpoints for this project
    const allEndpoints = JSON.parse(localStorage.getItem('beeceptor_endpoints') || '[]');
    const filteredEndpoints = allEndpoints.filter(e => e.projectId !== projectId);
    localStorage.setItem('beeceptor_endpoints', JSON.stringify(filteredEndpoints));
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setShowCreateProjectModal(true);
  };



  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    if (editingProject) {
      // Update existing project
      const updatedProject = {
        ...editingProject,
        name: newProjectName,
        url: generateProjectUrl(newProjectName)
      };
      setProjects(projects.map(p => 
        p.id === editingProject.id ? updatedProject : p
      ));
      setEditingProject(null);
    } else {
      // Create new project with clean state
      const newProject = {
        id: `proj_${Date.now()}`,
        name: newProjectName,
        url: generateProjectUrl(newProjectName),
        createdDate: new Date().toISOString().split("T")[0],
        endpointCount: 0,
        userId: user?.id,
      };
      setProjects([...projects, newProject]);
      
      // Register project mapping for browser access
      fetch('http://localhost:3001/api/projects/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newProject.id,
          projectName: newProject.name
        })
      }).catch(error => console.error('Failed to register project mapping:', error));
      
      // Navigate to new project immediately for clean state
      setTimeout(() => {
        navigate(`/project/${newProject.id}`);
      }, 100);
    }
    
    setNewProjectName("");
    setShowCreateProjectModal(false);
  };





  const generateProjectUrl = (projectName) => {
    const cleanName = projectName.replace(/\s+/g, '-').toLowerCase();
    return `https://${cleanName}.arjava.com`;
  };

  const handleCopyProjectUrl = async (url, projectId) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedProjectUrl(projectId);
      setTimeout(() => setCopiedProjectUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy project URL:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onSignUpClick={() => {}}
        isAuthenticated={!!user}
        user={user}
        onLogout={() => {
          console.log("UserDashboard onLogout called");
          onLogout();
        }}
      />

      {/* Main Dashboard Section */}
      <section className="flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden pt-8 pb-16">
        {/* Background Glow Effect */}
        <div className="absolute top-[14em] left-[20em] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Projects List View */}
          <div>
              {/* Page Header */}
              <div className="flex justify-between items-center mb-14">
                <span>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
                    My Projects
                  </h1>
                  <p className="text-gray-600 text-md">
                    Manage your mock API projects and endpoints
                  </p>
                </span>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create New Project
                </button>
              </div>

              {/* View Toggle Tabs - Only show when projects exist */}
              {projects.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setProjectViewMode("card")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      projectViewMode === "card"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                    }`}
                  >
                    Card View
                  </button>
                  <button
                    onClick={() => setProjectViewMode("table")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      projectViewMode === "table"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                    }`}
                  >
                    Table View
                  </button>
                </div>
              )}

              {/* Card View */}
              {projectViewMode === "card" &&
                (projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md p-6 rounded-lg transition-all duration-300 group shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-gray-900 text-xl font-bold mb-2">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-gray-700 text-sm font-mono">
                                {project.url ||
                                  generateProjectUrl(project.name)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyProjectUrl(
                                    project.url ||
                                      generateProjectUrl(project.name),
                                    project.id
                                  );
                                }}
                                className="text-gray-800  transition-colors"
                                title="Copy Project URL"
                              >
                                {copiedProjectUrl === project.id ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <span className="text-gray-700 text-sm">
                              {project.endpointCount} endpoints
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="Edit project"
                            >
                              <Edit2 className="w-5 h-5 " />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>Created {project.createdDate}</span>
                        </div>
                        <button
                          onClick={() => handleProjectClick(project)}
                          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-600 text-blue-700 py-2 rounded-lg transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="bg-gray-500 rounded-lg p-8 text-center">
                      <p className="text-white text-lg">
                        You haven't created any project folders yet. Use the
                        'Create New Project' button to start a project.
                      </p>
                    </div>
                  </div>
                ))}

              {/* Table View */}
              {projectViewMode === "table" &&
                (projects.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Project Name
                            </th>
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Endpoints
                            </th>
                            <th className="text-left px-6 py-4 text-gray-800 font-semibold">
                              Created Date
                            </th>
                            <th className="text-right px-6 py-4 text-gray-800 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((project) => (
                            <tr
                              key={project.id}
                              className="border-b border-gray-300 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-800 font-medium">
                                    {project.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-700 text-sm font-mono">
                                      {project.url ||
                                        generateProjectUrl(project.name)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopyProjectUrl(
                                          project.url ||
                                            generateProjectUrl(project.name),
                                          project.id
                                        )
                                      }
                                      className="text-gray-500  transition-colors"
                                      title="Copy Project URL"
                                    >
                                      {copiedProjectUrl === project.id ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {project.endpointCount}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {project.createdDate}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-4">
                                  <button
                                    onClick={() => handleProjectClick(project)}
                                    className="text-gray-700 hover:text-gray-500 transition-colors text-md font-medium"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-gray-600 hover:text-gray-500 transition-colors"
                                    title="Edit project"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                    title="Delete project"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="bg-[#151b2b] rounded-lg p-8 text-center">
                      <p className="text-white text-lg">
                        You haven't created any project folders yet. Use the
                        'Create New Project' button to start a project.
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProject ? "Edit Project" : "Create New Project"}
            </h2>
            <div className="mb-6">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="my-awesome-project"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateProjectModal(false);
                  setNewProjectName("");
                  setEditingProject(null);
                }}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {editingProject ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}



      <Footer />
    </div>
  );
};

export default UserDashboard;