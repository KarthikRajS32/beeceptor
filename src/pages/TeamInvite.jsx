import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, AlertCircle, ChevronDown, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamInvite = ({ user, onLogout, projects = [] }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [invitedMembers, setInvitedMembers] = useState(() => {
    const saved = localStorage.getItem('team_invites');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('team_invites', JSON.stringify(invitedMembers));
  }, [invitedMembers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const validateForm = () => {
    if (!email.trim()) {
      setMessage('Please enter an email address');
      setMessageType('error');
      setTimeout(() => setMessage(null), 2000);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      setTimeout(() => setMessage(null), 2000);
      return false;
    }
    if (selectedProjects.length === 0) {
      setMessage('Please select at least one project');
      setMessageType('error');
      setTimeout(() => setMessage(null), 2000);
      return false;
    }
    return true;
  };

  const handleSendInvite = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingId) {
        setInvitedMembers(invitedMembers.map(m => 
          m.id === editingId 
            ? { ...m, email, role, projects: selectedProjects.map(id => projects.find(p => p.id === id)?.name).filter(Boolean) }
            : m
        ));
        setEditingId(null);
      } else {
        const newMember = {
          id: Date.now(),
          email,
          role,
          status: 'Pending',
          projects: selectedProjects.map(id => projects.find(p => p.id === id)?.name).filter(Boolean),
          invitedAt: new Date().toLocaleDateString()
        };
        setInvitedMembers([...invitedMembers, newMember]);
      }
      
      setMessage(`Invitation sent to ${email}`);
      setMessageType('success');
      
      setEmail('');
      setRole('Viewer');
      setSelectedProjects([]);
      setShowProjectDropdown(false);
      setShowInviteModal(false);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('Failed to send invitation. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEmail(member.email);
    setRole(member.role);
    setSelectedProjects(projects.filter(p => member.projects.includes(p.name)).map(p => p.id));
    setEditingId(member.id);
    setShowInviteModal(true);
  };

  const handleDelete = (memberId) => {
    if (confirm('Are you sure you want to delete this invitation?')) {
      setInvitedMembers(invitedMembers.filter(m => m.id !== memberId));
    }
  };

  return (
    <div className="flex flex-col">

      <section className="flex-1 px-4 sm:px-6 lg:px-8 bg-gray-50 pt-36 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button and Invite Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center px-3 py-2 rounded-md gap-2 text-white bg-blue-600 transition-colors text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setEmail('');
                setRole('Viewer');
                setSelectedProjects([]);
                setShowInviteModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Invite Member
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {messageType === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Invited Members Table */}
          {invitedMembers.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-4 text-gray-900 font-semibold">Member</th>
                    <th className="text-left px-6 py-4 text-gray-900 font-semibold">Role</th>
                    <th className="text-left px-6 py-4 text-gray-900 font-semibold">Status</th>
                    <th className="text-left px-6 py-4 text-gray-900 font-semibold">Invited Date</th>
                    <th className="text-right px-6 py-4 text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitedMembers.map(member => (
                    <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 font-medium">{member.email}</p>
                          <p className="text-gray-600 text-sm">{member.projects.join(', ')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{member.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">{member.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{member.invitedAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
              <div className="text-center py-12">
                <p className="text-gray-600">No team members invited yet</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Invite</h2>
            <p className="text-gray-600 mb-6">Invite team members to collaborate on your projects</p>

            <div className="space-y-4">
              {/* Project Selection */}
              <div ref={dropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Projects</label>
                <div className="relative">
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 flex items-center justify-between bg-white hover:bg-gray-50"
                  >
                    <span>{selectedProjects.length === 0 ? 'Choose projects...' : `${selectedProjects.length} selected`}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {projects.map(project => (
                        <label key={project.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => handleProjectToggle(project.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700 text-sm">{project.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invite Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => !editingId && setEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                {loading ? 'Sending...' : editingId ? 'Update' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamInvite;
