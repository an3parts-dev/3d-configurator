/**
 * Memory management utility for optimizing resource usage
 * Handles cleanup of Three.js resources and prevents memory leaks
 */
import * as THREE from 'three';

export class MemoryManager {
  private static instance: MemoryManager;
  private disposableResources: Set<THREE.Object3D | THREE.Material | THREE.Texture | THREE.Geometry> = new Set();
  private cleanupCallbacks: Set<() => void> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a resource for automatic cleanup
   */
  registerResource(resource: THREE.Object3D | THREE.Material | THREE.Texture | THREE.Geometry): void {
    this.disposableResources.add(resource);
  }

  /**
   * Register a cleanup callback
   */
  registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.add(callback);
  }

  /**
   * Dispose of a specific Three.js object and its resources
   */
  disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Dispose geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => this.disposeMaterial(material));
          } else {
            this.disposeMaterial(child.material);
          }
        }
      }
    });

    // Remove from parent
    if (object.parent) {
      object.parent.remove(object);
    }

    this.disposableResources.delete(object);
  }

  /**
   * Dispose of a material and its textures
   */
  private disposeMaterial(material: THREE.Material): void {
    // Dispose textures
    Object.values(material).forEach(value => {
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });

    material.dispose();
    this.disposableResources.delete(material);
  }

  /**
   * Clean up all registered resources
   */
  cleanup(): void {
    // Execute cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in cleanup callback:', error);
      }
    });

    // Dispose all registered resources
    this.disposableResources.forEach(resource => {
      try {
        if (resource instanceof THREE.Object3D) {
          this.disposeObject(resource);
        } else if ('dispose' in resource && typeof resource.dispose === 'function') {
          resource.dispose();
        }
      } catch (error) {
        console.error('Error disposing resource:', error);
      }
    });

    // Clear collections
    this.disposableResources.clear();
    this.cleanupCallbacks.clear();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { geometries: number; textures: number; programs: number } {
    const renderer = THREE.WebGLRenderer as any;
    if (renderer.info) {
      return {
        geometries: renderer.info.memory?.geometries || 0,
        textures: renderer.info.memory?.textures || 0,
        programs: renderer.info.programs?.length || 0
      };
    }
    return { geometries: 0, textures: 0, programs: 0 };
  }
}

export const memoryManager = MemoryManager.getInstance();