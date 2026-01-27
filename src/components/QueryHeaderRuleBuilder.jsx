import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ChevronDown } from 'lucide-react';
import {
  CONDITION_TYPES,
  QUERY_HEADER_OPERATORS,
  OPERATOR_LABELS,
  createQueryHeaderRule,
  saveQueryHeaderRules,
  getQueryHeaderRules,
  getEndpointQueryHeaderRules,
  updateQueryHeaderRule,
  deleteQueryHeaderRule,
} from '../lib/queryHeaderRuleEngine';

const QueryHeaderRuleBuilder = ({ endpointId, onRulesChange, triggerAddRule }) => {
  const [rules, setRules] = useState([]);
  const [expandedRuleId, setExpandedRuleId] = useState(null);
  const [newCondition, setNewCondition] = useState({
    type: CONDITION_TYPES.QUERY,
    name: '',
    operator: QUERY_HEADER_OPERATORS.EQUALS,
    value: '',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setRules(getEndpointQueryHeaderRules(endpointId));
    setIsInitialized(true);
  }, [endpointId]);

  const handleAddRule = () => {
    const rule = createQueryHeaderRule(endpointId, []);
    const allRules = getQueryHeaderRules();
    allRules.push(rule);
    saveQueryHeaderRules(allRules);
    setRules([...rules, rule]);
    setExpandedRuleId(rule.id);
    onRulesChange?.();
  };

  const lastTriggerRef = React.useRef(triggerAddRule);

  useEffect(() => {
    if (triggerAddRule > lastTriggerRef.current && isInitialized) {
      handleAddRule();
    }
    lastTriggerRef.current = triggerAddRule;
  }, [triggerAddRule, isInitialized]);

  const handleDeleteRule = (ruleId) => {
    deleteQueryHeaderRule(ruleId);
    setRules(rules.filter(r => r.id !== ruleId));
    setExpandedRuleId(null);
    onRulesChange?.();
  };

  const validateCondition = (condition) => {
    if (!condition.name.trim()) {
      return 'Parameter/Header name is required';
    }
    if (!condition.value.trim()) {
      return 'Value is required';
    }
    if (condition.operator === QUERY_HEADER_OPERATORS.REGEX) {
      try {
        new RegExp(condition.value);
      } catch (e) {
        return `Invalid regex pattern: ${e.message}`;
      }
    }
    return null;
  };

  const handleAddCondition = (ruleId) => {
    const error = validateCondition(newCondition);
    if (error) {
      setValidationError(error);
      return;
    }

    const updatedRules = rules.map(r => {
      if (r.id === ruleId) {
        const updated = {
          ...r,
          conditions: [...r.conditions, { ...newCondition }],
        };
        updateQueryHeaderRule(ruleId, updated.conditions);
        return updated;
      }
      return r;
    });

    setRules(updatedRules);
    setNewCondition({
      type: CONDITION_TYPES.QUERY,
      name: '',
      operator: QUERY_HEADER_OPERATORS.EQUALS,
      value: '',
    });
    setValidationError(null);
    onRulesChange?.();
  };

  const handleRemoveCondition = (ruleId, conditionIndex) => {
    const updatedRules = rules.map(r => {
      if (r.id === ruleId) {
        const updated = {
          ...r,
          conditions: r.conditions.filter((_, i) => i !== conditionIndex),
        };
        updateQueryHeaderRule(ruleId, updated.conditions);
        return updated;
      }
      return r;
    });

    setRules(updatedRules);
    onRulesChange?.();
  };

  const handleUpdateCondition = (ruleId, conditionIndex, field, value) => {
    const updatedRules = rules.map(r => {
      if (r.id === ruleId) {
        const updated = {
          ...r,
          conditions: r.conditions.map((c, i) =>
            i === conditionIndex ? { ...c, [field]: value } : c
          ),
        };
        updateQueryHeaderRule(ruleId, updated.conditions);
        return updated;
      }
      return r;
    });

    setRules(updatedRules);
    onRulesChange?.();
  };

  if (!isInitialized || rules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6 border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-700">Query & Header Rules</h4>
        <button
          onClick={handleAddRule}
          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden shadow-sm">
            <div
              className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
                expandedRuleId === rule.id ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
              onClick={() =>
                setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)
              }
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {rule.conditions.length === 0 ? 'Empty Rule' : `${rule.conditions.length} condition${rule.conditions.length !== 1 ? 's' : ''}`}
                </p>
                {rule.conditions.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1 font-medium bg-white/50 px-2 py-1 rounded inline-block">
                    {rule.conditions
                      .map(c => `${c.type}: ${c.name} ${OPERATOR_LABELS[c.operator] || c.operator} ${c.value}`)
                      .join(' AND ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedRuleId === rule.id ? 'rotate-180' : ''}`} />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteRule(rule.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedRuleId === rule.id && (
              <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                {rule.conditions.length > 0 && (
                  <div className="space-y-3">
                    {rule.conditions.map((condition, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          <select
                            value={condition.type}
                            onChange={e =>
                              handleUpdateCondition(rule.id, idx, 'type', e.target.value)
                            }
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value={CONDITION_TYPES.QUERY}>Query</option>
                            <option value={CONDITION_TYPES.HEADER}>Header</option>
                          </select>

                          <input
                            type="text"
                            value={condition.name}
                            onChange={e =>
                              handleUpdateCondition(rule.id, idx, 'name', e.target.value)
                            }
                            placeholder="Name"
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />

                          <select
                            value={condition.operator}
                            onChange={e =>
                              handleUpdateCondition(rule.id, idx, 'operator', e.target.value)
                            }
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value={QUERY_HEADER_OPERATORS.EQUALS}>equals</option>
                            <option value={QUERY_HEADER_OPERATORS.NOT_EQUALS}>not equals</option>
                            <option value={QUERY_HEADER_OPERATORS.CONTAINS}>contains</option>
                            <option value={QUERY_HEADER_OPERATORS.REGEX}>regex</option>
                          </select>

                          <input
                            type="text"
                            value={condition.value}
                            onChange={e =>
                              handleUpdateCondition(rule.id, idx, 'value', e.target.value)
                            }
                            placeholder={condition.operator === QUERY_HEADER_OPERATORS.REGEX ? '^[a-z]+$' : 'Value'}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveCondition(rule.id, idx)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove Condition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add New Condition</p>
                  {validationError && (
                    <p className="text-xs text-red-600 mb-2 bg-red-50 px-2 py-1 rounded">{validationError}</p>
                  )}
                  <div className="flex gap-2 items-center">
                    <select
                      value={newCondition.type}
                      onChange={e =>
                        setNewCondition({ ...newCondition, type: e.target.value })
                      }
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value={CONDITION_TYPES.QUERY}>Query</option>
                      <option value={CONDITION_TYPES.HEADER}>Header</option>
                    </select>

                    <input
                      type="text"
                      value={newCondition.name}
                      onChange={e =>
                        setNewCondition({ ...newCondition, name: e.target.value })
                      }
                      placeholder="Name"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />

                    <select
                      value={newCondition.operator}
                      onChange={e =>
                        setNewCondition({ ...newCondition, operator: e.target.value })
                      }
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value={QUERY_HEADER_OPERATORS.EQUALS}>equals</option>
                      <option value={QUERY_HEADER_OPERATORS.NOT_EQUALS}>not equals</option>
                      <option value={QUERY_HEADER_OPERATORS.CONTAINS}>contains</option>
                      <option value={QUERY_HEADER_OPERATORS.REGEX}>regex</option>
                    </select>

                    <input
                      type="text"
                      value={newCondition.value}
                      onChange={e =>
                        setNewCondition({ ...newCondition, value: e.target.value })
                      }
                      placeholder={newCondition.operator === QUERY_HEADER_OPERATORS.REGEX ? '^[a-z]+$' : 'Value'}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />

                    <button
                      onClick={() => handleAddCondition(rule.id)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryHeaderRuleBuilder;
