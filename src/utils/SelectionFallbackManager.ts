import { ConfiguratorOption } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from './ConditionalLogicEngine';

/**
 * Manages fallback behavior when selected options become unavailable
 */
export class SelectionFallbackManager {
  /**
   * Validates and corrects selections based on current conditional logic state
   */
  static validateAndCorrectSelections(
    allOptions: ConfiguratorOption[],
    currentSelections: Record<string, string>
  ): { 
    correctedSelections: Record<string, string>; 
    changes: Array<{ optionId: string; oldValue: string; newValue: string; reason: string }> 
  } {
    const correctedSelections = { ...currentSelections };
    const changes: Array<{ optionId: string; oldValue: string; newValue: string; reason: string }> = [];

    // Get visible options based on current selections
    const visibleOptions = ConditionalLogicEngine.getVisibleOptions(allOptions, currentSelections);

    visibleOptions.forEach(option => {
      const currentSelection = correctedSelections[option.id];
      const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
        option,
        correctedSelections,
        allOptions
      );

      // Check if current selection is still valid
      const isCurrentSelectionValid = currentSelection && 
        visibleValues.some(value => value.id === currentSelection);

      if (!isCurrentSelectionValid && visibleValues.length > 0) {
        const fallbackValue = visibleValues[0];
        const oldValue = currentSelection || 'none';
        
        correctedSelections[option.id] = fallbackValue.id;
        changes.push({
          optionId: option.id,
          oldValue,
          newValue: fallbackValue.id,
          reason: currentSelection ? 'Selected value no longer visible' : 'No value selected'
        });

        console.log(`🔄 Fallback applied for "${option.name}": ${oldValue} → ${fallbackValue.name}`);
      }
    });

    return { correctedSelections, changes };
  }

  /**
   * Gets the first available value for an option
   */
  static getFirstAvailableValue(
    option: ConfiguratorOption,
    allOptions: ConfiguratorOption[],
    currentSelections: Record<string, string>
  ): string | null {
    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      currentSelections,
      allOptions
    );

    return visibleValues.length > 0 ? visibleValues[0].id : null;
  }

  /**
   * Checks if a specific value is currently available for selection
   */
  static isValueAvailable(
    optionId: string,
    valueId: string,
    allOptions: ConfiguratorOption[],
    currentSelections: Record<string, string>
  ): boolean {
    const option = allOptions.find(opt => opt.id === optionId);
    if (!option) return false;

    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      currentSelections,
      allOptions
    );

    return visibleValues.some(value => value.id === valueId);
  }

  /**
   * Gets all available values for an option given current selections
   */
  static getAvailableValues(
    optionId: string,
    allOptions: ConfiguratorOption[],
    currentSelections: Record<string, string>
  ): Array<{ id: string; name: string }> {
    const option = allOptions.find(opt => opt.id === optionId);
    if (!option) return [];

    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      currentSelections,
      allOptions
    );

    return visibleValues.map(value => ({
      id: value.id,
      name: value.name
    }));
  }
}