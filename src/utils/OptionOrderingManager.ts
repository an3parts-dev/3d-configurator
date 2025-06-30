/**
 * Option Ordering Manager
 * Handles the complex logic for maintaining proper option ordering and group management
 */
import { ConfiguratorOption } from '../types/ConfiguratorTypes';

export interface OptionWithPosition {
  option: ConfiguratorOption;
  visualIndex: number;
  isInGroup: boolean;
  groupId?: string;
  indexInGroup?: number;
}

export class OptionOrderingManager {
  /**
   * Gets options in their visual display order (not grouped first)
   */
  static getOptionsInVisualOrder(options: ConfiguratorOption[]): OptionWithPosition[] {
    const result: OptionWithPosition[] = [];
    let visualIndex = 0;

    // First, get all root options (no parentId) in their original order
    const rootOptions = options.filter(opt => !opt.parentId);
    
    for (const rootOption of rootOptions) {
      result.push({
        option: rootOption,
        visualIndex: visualIndex++,
        isInGroup: false
      });

      // If this is a group, add its children in order
      if (rootOption.isGroup) {
        const childOptions = options
          .filter(opt => opt.parentId === rootOption.id)
          .sort((a, b) => {
            // Maintain the order they appear in the original array
            const aIndex = options.findIndex(opt => opt.id === a.id);
            const bIndex = options.findIndex(opt => opt.id === b.id);
            return aIndex - bIndex;
          });

        childOptions.forEach((child, indexInGroup) => {
          result.push({
            option: child,
            visualIndex: visualIndex++,
            isInGroup: true,
            groupId: rootOption.id,
            indexInGroup
          });
        });
      }
    }

    return result;
  }

  /**
   * Reorders options while maintaining group structure
   */
  static reorderOptions(
    options: ConfiguratorOption[],
    dragIndex: number,
    hoverIndex: number
  ): ConfiguratorOption[] {
    const visualOptions = this.getOptionsInVisualOrder(options);
    
    if (dragIndex >= visualOptions.length || hoverIndex >= visualOptions.length) {
      return options;
    }

    const draggedItem = visualOptions[dragIndex];
    const hoverItem = visualOptions[hoverIndex];

    // Don't allow reordering if dragged item is in a group
    if (draggedItem.isInGroup) {
      return options;
    }

    // Don't allow dropping on items that are in groups
    if (hoverItem.isInGroup) {
      return options;
    }

    // Create new visual order
    const newVisualOrder = [...visualOptions];
    newVisualOrder.splice(dragIndex, 1);
    newVisualOrder.splice(hoverIndex, 0, draggedItem);

    // Convert back to flat option array
    return this.convertVisualOrderToOptionArray(newVisualOrder, options);
  }

  /**
   * Moves an option to/from a group
   */
  static moveOptionToGroup(
    options: ConfiguratorOption[],
    optionId: string,
    targetGroupId: string | null
  ): ConfiguratorOption[] {
    return options.map(option => {
      if (option.id === optionId) {
        return {
          ...option,
          parentId: targetGroupId || undefined
        };
      }
      return option;
    });
  }

  /**
   * Converts visual order back to option array format
   */
  private static convertVisualOrderToOptionArray(
    visualOrder: OptionWithPosition[],
    originalOptions: ConfiguratorOption[]
  ): ConfiguratorOption[] {
    const result: ConfiguratorOption[] = [];
    const processedIds = new Set<string>();

    for (const item of visualOrder) {
      if (processedIds.has(item.option.id)) continue;

      if (!item.isInGroup) {
        // Add root option
        result.push(item.option);
        processedIds.add(item.option.id);

        // If it's a group, add all its children
        if (item.option.isGroup) {
          const children = originalOptions.filter(opt => opt.parentId === item.option.id);
          children.forEach(child => {
            if (!processedIds.has(child.id)) {
              result.push(child);
              processedIds.add(child.id);
            }
          });
        }
      }
    }

    // Add any remaining options that weren't processed
    originalOptions.forEach(option => {
      if (!processedIds.has(option.id)) {
        result.push(option);
      }
    });

    return result;
  }

  /**
   * Determines if a drop operation is valid
   */
  static isValidDropOperation(
    draggedItem: OptionWithPosition,
    targetItem: OptionWithPosition,
    operation: 'reorder' | 'group' | 'ungroup'
  ): boolean {
    switch (operation) {
      case 'reorder':
        // Can only reorder root-level items
        return !draggedItem.isInGroup && !targetItem.isInGroup;
      
      case 'group':
        // Can only add non-group items to groups
        return !draggedItem.option.isGroup && targetItem.option.isGroup;
      
      case 'ungroup':
        // Can only remove items that are currently in groups
        return draggedItem.isInGroup;
      
      default:
        return false;
    }
  }
}