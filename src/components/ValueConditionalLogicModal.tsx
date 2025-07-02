import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Settings,
  Zap,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { OptionValueConditionalLogic, ConditionalRule, ConfiguratorOption } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';

interface ValueConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conditionalLogic: OptionValueConditionalLogic) => void;
  valueName: string;
  allOptions: ConfiguratorOption[];
  conditionalLogic?: OptionValueConditionalLogic;
}

const ValueConditionalLogicModal: React.FC<ValueConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  valueName,
  allOptions,
  conditionalLogic
}) => {
  const [logic, setLogic] = useState<OptionValueConditionalLogic>(
    conditionalLogic || ConditionalLogicEngine.createDefaultValueConditionalLogic()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<ConfiguratorOption[]>([]);
  const [showValidationFlash, setShowValidationFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const available = allOptions.filter(opt => !opt.isGroup && opt.values.length > 0);
      setAvailableOptions(available);
      
      if (conditionalLogic) {
        setLogic({ ...conditionalLogic });
      } else {
        setLogic(ConditionalLogicEngine.createDefaultValueConditionalLogic());
      }
      setShowValidationFlash(false);
    }
  }, [isOpen, allOptions, conditionalLogic]);

  const validateLogic = () => {
    if (!logic.enabled) {
      setErrors([]);
      return true;
    }

    const validation = ConditionalLogicEngine.validateConditionalLogic(logic, allOptions);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Validation logic
  const getValidationErrors = () => {
    const validationErrors: string[] = [];
    
    if (logic.enabled && logic.rules.length === 0) {
      validationErrors.push('At least one rule is required when conditional logic is enabled');
    }
    
    return validationErrors;
  };

  const validationErrors = getValidationErrors();
  const canSave = logic.enabled ? (logic.rules.length > 0 && errors.length === 0) : true;

  const addRule = () => {
    const newRule = ConditionalLogicEngine.createDefaultRule(availableOptions);
    if (newRule) {
      setLogic(prev => ({
        ...prev,
        rules: [...prev.rules, newRule]
      }));
    }
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    setLogic(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const deleteRule = (ruleId: string) => {
    setLogic(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSave = () => {
    if (validateLogic() && canSave) {
      onSave(logic);
      onClose();
    } else {
      // Flash validation feedback
      setShowValidationFlash(true);
      setTimeout(() => setShowValidationFlash(false), 3000);
    }
  };

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'equals': return 'equals';
      case 'not_equals': return 'does not equal';
      case 'in': return 'is one of';
      case 'not_in': return 'is not one of';
      default: return operator;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">Value Conditional Logic</h3>
                <p className="text-gray-400 text-sm">Configure when "{valueName}" should be visible</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-orange-400" />
                    Value Conditional Logic
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Control when this value appears based on other option selections
                  </p>
                </div>
                <button
                  onClick={() => setLogic(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                    logic.enabled
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
                  }`}
                >
                  {logic.enabled ? (
                    <>
                      <span className="font-medium">Enabled</span>
                      <ToggleRight className="w-6 h-6" />
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Disabled</span>
                      <ToggleLeft className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {logic.enabled && (
              <>
                {/* Available Options Check */}
                {availableOptions.length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                      <div>
                        <h4 className="text-yellow-300 font-semibold">No Options Available</h4>
                        <p className="text-yellow-200/80 text-sm mt-1">
                          You need at least one other option with values to create conditional logic rules.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Logic Operator */}
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <h4 className="text-white font-semibold mb-4">Logic Operator</h4>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setLogic(prev => ({ ...prev, operator: 'AND' }))}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                            logic.operator === 'AND'
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-lg">AND</div>
                            <div className="text-sm opacity-80">All rules must be true</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setLogic(prev => ({ ...prev, operator: 'OR' }))}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                            logic.operator === 'OR'
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-lg">OR</div>
                            <div className="text-sm opacity-80">Any rule can be true</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-lg">Conditional Rules</h4>
                        <button
                          onClick={addRule}
                          disabled={availableOptions.length === 0}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                            availableOptions.length === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-700 text-white'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Rule</span>
                        </button>
                      </div>

                      {logic.rules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No rules defined</p>
                          <p className="text-sm">Add a rule to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {logic.rules.map((rule, index) => {
                            const referencedOption = availableOptions.find(opt => opt.id === rule.optionId);
                            
                            return (
                              <motion.div
                                key={rule.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-700 p-6 rounded-xl border border-gray-600"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="text-white font-medium">Rule {index + 1}</h5>
                                  <button
                                    onClick={() => deleteRule(rule.id)}
                                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Option Selection */}
                                  <div>
                                    <label className="block text-gray-400 text-sm mb-2">When Option</label>
                                    <select
                                      value={rule.optionId}
                                      onChange={(e) => {
                                        const newOptionId = e.target.value;
                                        const newOption = availableOptions.find(opt => opt.id === newOptionId);
                                        const firstValue = newOption?.values[0];
                                        updateRule(rule.id, { 
                                          optionId: newOptionId,
                                          value: firstValue ? firstValue.id : ''
                                        });
                                      }}
                                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                    >
                                      {availableOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                          {option.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Operator Selection */}
                                  <div>
                                    <label className="block text-gray-400 text-sm mb-2">Condition</label>
                                    <select
                                      value={rule.operator}
                                      onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                    >
                                      <option value="equals">equals</option>
                                      <option value="not_equals">does not equal</option>
                                      <option value="in">is one of</option>
                                      <option value="not_in">is not one of</option>
                                    </select>
                                  </div>

                                  {/* Value Selection */}
                                  <div>
                                    <label className="block text-gray-400 text-sm mb-2">Value</label>
                                    {rule.operator === 'in' || rule.operator === 'not_in' ? (
                                      <select
                                        multiple
                                        value={Array.isArray(rule.value) ? rule.value : []}
                                        onChange={(e) => {
                                          const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                                          updateRule(rule.id, { value: selectedValues });
                                        }}
                                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white h-24"
                                      >
                                        {referencedOption?.values.map(value => (
                                          <option key={value.id} value={value.id}>
                                            {value.name}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <select
                                        value={typeof rule.value === 'string' ? rule.value : ''}
                                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                      >
                                        {referencedOption?.values.map(value => (
                                          <option key={value.id} value={value.id}>
                                            {value.name}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </div>

                                {/* Rule Preview */}
                                <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                                  <p className="text-gray-300 text-sm">
                                    <span className="font-medium">Show "{valueName}" when:</span>
                                    <br />
                                    "{referencedOption?.name}" {getOperatorLabel(rule.operator)} "
                                    {Array.isArray(rule.value) 
                                      ? rule.value.map(v => referencedOption?.values.find(val => val.id === v)?.name).join(', ')
                                      : referencedOption?.values.find(val => val.id === rule.value)?.name
                                    }"
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Validation Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="text-red-300 font-semibold">Validation Errors</h4>
                        <ul className="text-red-200/80 text-sm mt-2 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl">
          {/* Validation Feedback - Show when validation fails or when flash is triggered */}
          {(validationErrors.length > 0 || showValidationFlash) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 rounded-lg border ${
                showValidationFlash 
                  ? 'bg-red-500/10 border-red-500/20' 
                  : 'bg-yellow-500/10 border-yellow-500/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  showValidationFlash ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <div>
                  <h4 className={`font-semibold text-sm ${
                    showValidationFlash ? 'text-red-300' : 'text-yellow-300'
                  }`}>
                    Required to save:
                  </h4>
                  <ul className={`text-sm mt-1 space-y-1 ${
                    showValidationFlash ? 'text-red-200/80' : 'text-yellow-200/80'
                  }`}>
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                canSave
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-orange-600/50 text-white/70 cursor-pointer hover:bg-orange-600/60'
              }`}
            >
              Save Value Logic
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ValueConditionalLogicModal;