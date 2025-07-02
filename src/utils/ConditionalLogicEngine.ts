import { ConditionalLogic, ConditionalRule, ConfiguratorOption, OptionValueConditionalLogic } from '../types/ConfiguratorTypes';

/**
 * Advanced Conditional Logic Engine
 * Evaluates complex conditional rules to determine option and value visibility
 */
export class ConditionalLogicEngine {
  /**
   * Evaluates if an option should be visible based on its conditional logic
   */
  static shouldShowOption(
    option: ConfiguratorOption,
    selectedValues: Record<string, string>,
    allOptions: ConfiguratorOption[]
  ): boolean {
    // If no conditional logic is defined, always show the option
    if (!option.conditionalLogic || !option.conditionalLogic.enabled) {
      return true;
    }

    const { operator, rules } = option.conditionalLogic;
    
    // Evaluate each rule
    const ruleResults = rules.map(rule => 
      this.evaluateRule(rule, selectedValues, allOptions)
    );

    // Apply logical operator
    if (operator === 'AND') {
      return ruleResults.every(result => result);
    } else {
      return ruleResults.some(result => result);
    }
  }

  /**
   * Evaluates if an option value should be visible based on its conditional logic
   */
  static shouldShowOptionValue(
    value: { conditionalLogic?: OptionValueConditionalLogic },
    selectedValues: Record<string, string>,
    allOptions: ConfiguratorOption[]
  ): boolean {
    // If no conditional logic is defined, always show the value
    if (!value.conditionalLogic || !value.conditionalLogic.enabled) {
      return true;
    }

    const { operator, rules } = value.conditionalLogic;
    
    // Evaluate each rule
    const ruleResults = rules.map(rule => 
      this.evaluateRule(rule, selectedValues, allOptions)
    );

    // Apply logical operator
    if (operator === 'AND') {
      return ruleResults.every(result => result);
    } else {
      return ruleResults.some(result => result);
    }
  }

  /**
   * Evaluates a single conditional rule
   */
  private static evaluateRule(
    rule: ConditionalRule,
    selectedValues: Record<string, string>,
    allOptions: ConfiguratorOption[]
  ): boolean {
    const selectedValue = selectedValues[rule.optionId];
    
    // If the referenced option has no selected value, rule fails
    if (!selectedValue) {
      return false;
    }

    switch (rule.operator) {
      case 'equals':
        return selectedValue === rule.value;
      
      case 'not_equals':
        return selectedValue !== rule.value;
      
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(selectedValue);
      
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(selectedValue);
      
      default:
        console.warn(`Unknown conditional operator: ${rule.operator}`);
        return false;
    }
  }

  /**
   * Gets all options that can be referenced in conditional logic
   */
  static getAvailableOptionsForConditions(
    currentOptionId: string,
    allOptions: ConfiguratorOption[]
  ): ConfiguratorOption[] {
    return allOptions.filter(option => option.id !== currentOptionId && !option.isGroup);
  }

  /**
   * Validates conditional logic configuration
   */
  static validateConditionalLogic(
    conditionalLogic: ConditionalLogic | OptionValueConditionalLogic,
    allOptions: ConfiguratorOption[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!conditionalLogic.rules || conditionalLogic.rules.length === 0) {
      errors.push('At least one rule is required');
      return { isValid: false, errors };
    }

    conditionalLogic.rules.forEach((rule, index) => {
      // Check if referenced option exists
      const referencedOption = allOptions.find(opt => opt.id === rule.optionId);
      if (!referencedOption) {
        errors.push(`Rule ${index + 1}: Referenced option not found`);
        return;
      }

      // Check if referenced value exists
      if (rule.operator === 'equals' || rule.operator === 'not_equals') {
        const valueExists = referencedOption.values.some(val => val.id === rule.value);
        if (!valueExists) {
          errors.push(`Rule ${index + 1}: Referenced value not found in option "${referencedOption.name}"`);
        }
      }

      if (rule.operator === 'in' || rule.operator === 'not_in') {
        if (!Array.isArray(rule.value)) {
          errors.push(`Rule ${index + 1}: Value must be an array for 'in' and 'not_in' operators`);
        } else {
          const invalidValues = (rule.value as string[]).filter(val => 
            !referencedOption.values.some(optVal => optVal.id === val)
          );
          if (invalidValues.length > 0) {
            errors.push(`Rule ${index + 1}: Invalid values: ${invalidValues.join(', ')}`);
          }
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Creates a default conditional logic structure
   */
  static createDefaultConditionalLogic(): ConditionalLogic {
    return {
      id: `conditional_${Date.now()}`,
      enabled: false,
      operator: 'AND',
      rules: []
    };
  }

  /**
   * Creates a default option value conditional logic structure
   */
  static createDefaultValueConditionalLogic(): OptionValueConditionalLogic {
    return {
      id: `value_conditional_${Date.now()}`,
      enabled: false,
      operator: 'AND',
      rules: []
    };
  }

  /**
   * Creates a default conditional rule
   */
  static createDefaultRule(availableOptions: ConfiguratorOption[]): ConditionalRule | null {
    if (availableOptions.length === 0) {
      return null;
    }

    const firstOption = availableOptions[0];
    
    // Filter out null/undefined values and ensure we have valid values
    const validValues = firstOption.values?.filter(val => val && val.id) || [];
    
    // Always return a rule if there are available options, even if no values exist yet
    // This allows the rule to be displayed in the UI for configuration
    const firstValue = validValues.length > 0 ? validValues[0] : null;

    return {
      id: `rule_${Date.now()}`,
      optionId: firstOption.id,
      operator: 'equals',
      value: firstValue ? firstValue.id : ''
    };
  }

  /**
   * Gets visible options based on conditional logic (including groups)
   */
  static getVisibleOptions(
    allOptions: ConfiguratorOption[],
    selectedValues: Record<string, string>
  ): ConfiguratorOption[] {
    const visibleOptions = allOptions.filter(option => 
      this.shouldShowOption(option, selectedValues, allOptions)
    );

    // For groups, also check if any children are visible
    return visibleOptions.filter(option => {
      if (!option.isGroup) return true;
      
      // Show group if any child is visible
      const childOptions = allOptions.filter(opt => opt.parentId === option.id);
      return childOptions.some(child => this.shouldShowOption(child, selectedValues, allOptions));
    });
  }

  /**
   * Gets visible option values based on conditional logic
   */
  static getVisibleOptionValues(
    option: ConfiguratorOption,
    selectedValues: Record<string, string>,
    allOptions: ConfiguratorOption[]
  ): typeof option.values {
    return option.values.filter(value => 
      this.shouldShowOptionValue(value, selectedValues, allOptions)
    );
  }

  /**
   * Checks for circular dependencies in conditional logic
   */
  static hasCircularDependency(
    optionId: string,
    conditionalLogic: ConditionalLogic,
    allOptions: ConfiguratorOption[],
    visited: Set<string> = new Set()
  ): boolean {
    if (visited.has(optionId)) {
      return true;
    }

    visited.add(optionId);

    for (const rule of conditionalLogic.rules) {
      const referencedOption = allOptions.find(opt => opt.id === rule.optionId);
      if (referencedOption && referencedOption.conditionalLogic?.enabled) {
        if (this.hasCircularDependency(rule.optionId, referencedOption.conditionalLogic, allOptions, new Set(visited))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Gets grouped options structure
   */
  static getGroupedOptions(allOptions: ConfiguratorOption[]): ConfiguratorOption[] {
    // Get root options (no parent) and groups
    const rootOptions = allOptions.filter(opt => !opt.parentId);
    
    // Sort so groups come first, then regular options
    return rootOptions.sort((a, b) => {
      if (a.isGroup && !b.isGroup) return -1;
      if (!a.isGroup && b.isGroup) return 1;
      return 0;
    });
  }

  /**
   * Gets child options for a group
   */
  static getChildOptions(groupId: string, allOptions: ConfiguratorOption[]): ConfiguratorOption[] {
    return allOptions.filter(opt => opt.parentId === groupId);
  }
}