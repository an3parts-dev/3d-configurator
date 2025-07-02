import * as THREE from 'three';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from './ConditionalLogicEngine';

/**
 * Manages 3D model scene manipulation and component visibility
 */
export class ModelSceneManager {
  /**
   * Applies configuration changes to the 3D model scene
   */
  static applyConfiguration(
    components: ModelComponent[],
    configuratorData: ConfiguratorData,
    selectedValues: Record<string, string>,
    onSelectionChange: (optionId: string, valueId: string) => void
  ): void {
    // Reset all components to their original state first
    components.forEach((component) => {
      component.mesh.visible = component.originalVisible;
      component.visible = component.originalVisible;
      
      // Reset materials to original
      if (component.originalMaterial) {
        component.mesh.material = component.originalMaterial.clone();
        component.material = component.mesh.material as THREE.Material;
      }
    });

    // Get visible options based on conditional logic
    const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
      configuratorData.options,
      selectedValues
    );

    console.log('👁️ Visible options after conditional logic:', visibleOptions.map(opt => opt.name));

    // Apply each visible option's configuration with precise targeting
    visibleOptions.forEach((option) => {
      const selectedValueId = selectedValues[option.id];
      if (!selectedValueId) return;

      const selectedValue = option.values.find(v => v && v.id === selectedValueId);
      
      // Check if the selected value still exists and is visible
      const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
        option,
        selectedValues,
        configuratorData.options
      );

      // If the selected value is no longer visible, fallback to first available value
      if (!selectedValue || !visibleValues.some(v => v.id === selectedValueId)) {
        if (visibleValues.length > 0) {
          const fallbackValue = visibleValues[0];
          console.log(`🔄 Fallback: "${option.name}" → "${fallbackValue.name}" (was "${selectedValue?.name || 'unknown'}")`);
          onSelectionChange(option.id, fallbackValue.id);
          return; // Skip processing this option in this cycle, it will be processed in the next render
        } else {
          console.log(`⚠️ No visible values for option "${option.name}"`);
          return;
        }
      }

      console.log(`🔧 Applying "${option.name}" → "${selectedValue.name}"`);
      console.log(`🎯 Target components:`, option.targetComponents);

      if (option.manipulationType === 'visibility') {
        this.applyVisibilityChanges(components, option, selectedValue);
      } else if (option.manipulationType === 'material' && selectedValue.color) {
        this.applyMaterialChanges(components, option, selectedValue);
      }
    });
  }

  /**
   * Applies visibility changes to components
   */
  private static applyVisibilityChanges(
    components: ModelComponent[],
    option: any,
    selectedValue: any
  ): void {
    // Apply default behavior ONLY to target components
    components.forEach((component) => {
      if (this.isComponentTargeted(component.name, option.targetComponents)) {
        if (option.defaultBehavior === 'hide') {
          component.mesh.visible = false;
          component.visible = false;
          console.log(`🙈 Hiding target component by default: ${component.name}`);
        } else {
          component.mesh.visible = true;
          component.visible = true;
          console.log(`👁️ Showing target component by default: ${component.name}`);
        }
      }
    });

    // Apply specific visibility rules
    if (option.defaultBehavior === 'hide') {
      // Show specified components (only if they are target components)
      selectedValue.visibleComponents?.forEach((visibleName: string) => {
        components.forEach((component) => {
          if (this.shouldComponentBeAffected(component.name, [visibleName]) && 
              this.isComponentTargeted(component.name, option.targetComponents)) {
            component.mesh.visible = true;
            component.visible = true;
            console.log(`👁️ Showing specific component: ${component.name}`);
          }
        });
      });
    } else {
      // Hide specified components (only if they are target components)
      selectedValue.hiddenComponents?.forEach((hiddenName: string) => {
        components.forEach((component) => {
          if (this.shouldComponentBeAffected(component.name, [hiddenName]) && 
              this.isComponentTargeted(component.name, option.targetComponents)) {
            component.mesh.visible = false;
            component.visible = false;
            console.log(`🙈 Hiding specific component: ${component.name}`);
          }
        });
      });
    }
  }

  /**
   * Applies material changes to components
   */
  private static applyMaterialChanges(
    components: ModelComponent[],
    option: any,
    selectedValue: any
  ): void {
    components.forEach((component) => {
      if (this.isComponentTargeted(component.name, option.targetComponents) &&
          component.material instanceof THREE.MeshStandardMaterial) {
        
        const colorHex = selectedValue.color!.replace('#', '0x');
        const newColor = new THREE.Color(parseInt(colorHex, 16));
        component.material.color.copy(newColor);
        console.log(`🎨 Changed material color for ${component.name} to ${selectedValue.color}`);
      }
    });
  }

  /**
   * Precise component matching function
   */
  private static isComponentTargeted(componentName: string, targetComponents: string[]): boolean {
    const componentLower = componentName.toLowerCase();
    
    return targetComponents.some(target => {
      const targetLower = target.toLowerCase();
      // Only exact matches - no partial matching to prevent unintended changes
      return componentLower === targetLower;
    });
  }

  /**
   * Precise component matching for visibility rules
   */
  private static shouldComponentBeAffected(componentName: string, ruleComponents: string[]): boolean {
    const componentLower = componentName.toLowerCase();
    
    return ruleComponents.some(rule => {
      const ruleLower = rule.toLowerCase();
      // Only exact matches for precise control
      return componentLower === ruleLower;
    });
  }
}