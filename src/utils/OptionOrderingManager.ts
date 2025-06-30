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
   * Gets options in their visual display order (maintains original order, not groups first)
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
   * Now supports moving any option to any position
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

    // Create new visual order by moving the dragged item
    const newVisualOrder = [...visualOptions];
    newVisualOrder.splice(dragIndex, 1);
    newVisualOrder.splice(hoverIndex, 0, draggedItem);

    // Update the dragged item's group status based on where it's dropped
    if (hoverItem.isInGroup && hoverItem.groupId) {
      // Dropping into a group
      draggedItem.option = {
        ...draggedItem.option,
        parentId: hoverItem.groupId
      };
      draggedItem.isInGroup = true;
      draggedItem.groupId = hoverItem.groupId;
    } else if (!hoverItem.isInGroup) {
      // Dropping at root level
      draggedItem.option = {
        ...draggedItem.option,
        parentId: undefined
      };
      draggedItem.isInGroup = false;
      draggedItem.groupId = undefined;
    }

    // Convert back to flat option array
    return this.convertVisualOrderToOptionArray(newVisualOrder, options);
  }

  /**
   * Reorders options within a group
   */
  static reorderOptionsWithinGroup(
    options: ConfiguratorOption[],
    groupId: string,
    dragIndex: number,
    hoverIndex: number
  ): ConfiguratorOption[] {
    const groupChildren = options.filter(opt => opt.parentId === groupId);
    
    if (dragIndex >= groupChildren.length || hoverIndex >= groupChildren.length) {
      return options;
    }

    // Create new order for children
    const newChildren = [...groupChildren];
    const draggedChild = newChildren[dragIndex];
    newChildren.splice(dragIndex, 1);
    newChildren.splice(hoverIndex, 0, draggedChild);

    // Rebuild the options array with new child order
    const otherOptions = options.filter(opt => opt.parentId !== groupId);
    const result: ConfiguratorOption[] = [];

    // Find the position where the first child was and replace all children with reordered ones
    let childrenInserted = false;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.parentId === groupId) {
        if (!childrenInserted) {
          // Insert all reordered children at the first child position
          result.push(...newChildren);
          childrenInserted = true;
        }
        // Skip original children as they're already added
      } else {
        result.push(option);
      }
    }

    // If no children were found in original positions, append them
    if (!childrenInserted) {
      result.push(...newChildren);
    }

    return result;
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

        // If it's a group, add all its children that appear after it in visual order
        if (item.option.isGroup) {
          const children = visualOrder
            .filter(child => child.isInGroup && child.groupId === item.option.id)
            .map(child => child.option);
          
          children.forEach(child => {
            if (!processedIds.has(child.id)) {
              result.push(child);
              processedIds.add(child.id);
            }
          });
        }
      } else {
        // This is a child option, add it if not already processed
        if (!processedIds.has(item.option.id)) {
          result.push(item.option);
          processedIds.add(item.option.id);
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
        // Can reorder any items now
        return true;
      
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