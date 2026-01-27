import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Copy } from 'lucide-react';

const EnvironmentSelector = ({ 
  selectedEnvironment, 
  onEnvironmentChange, 
  environments,
  onAddEnvironment,
  onRemoveEnvironment,
  onCopyEnvironment
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAddEnvironment = () => {
    if (newEnvName.trim() && !environments.includes(newEnvName.trim())) {
      onAddEnvironment(newEnvName.trim());
      setNewEnvName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors font-medium"
      >
        <span className="text-sm">{selectedEnvironment}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-48">
          {/* Environment List */}
          <div className="max-h-48 overflow-y-auto">
            {environments.map((env) => (
              <div
                key={env}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  selectedEnvironment === env
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => {
                    onEnvironmentChange(env);
                    setIsOpen(false);
                  }}
                  className="flex-1 text-left"
                >
                  {env}
                </button>
                <div className="flex items-center gap-1 ml-2">
                  {env !== 'Default' && onCopyEnvironment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const cloneName = prompt(`Clone "${env}" as:`, `${env}-copy`);
                        if (cloneName && cloneName.trim() && !environments.includes(cloneName.trim())) {
                          onCopyEnvironment(env, cloneName.trim());
                        } else if (cloneName && environments.includes(cloneName.trim())) {
                          alert('Environment name already exists!');
                        }
                      }}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="Clone environment"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {env !== "Default" && onRemoveEnvironment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the "${env}" environment? This will remove all endpoints in this environment.`)) {
                          onRemoveEnvironment(env);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete environment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Add Environment Form */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Environment
            </button>
          ) : (
            <div className="px-4 py-3 border-t border-gray-200">
              <input
                type="text"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddEnvironment();
                  if (e.key === "Escape") {
                    setShowAddForm(false);
                    setNewEnvName("");
                  }
                }}
                placeholder="Environment name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEnvName("");
                  }}
                  className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddEnvironment}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnvironmentSelector;
