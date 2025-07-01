import * as THREE from 'three';
import { MeasurementPoint, MeasurementType, DimensionLine, MEASUREMENT_TYPES } from '../types/MeasurementTypes';

export class MeasurementEngine {
  private measurementPoints: Map<string, MeasurementPoint> = new Map();
  private activeMeasurementType: string | null = null;

  /**
   * Extract measurement points from 3D model components
   */
  extractMeasurementPoints(scene: THREE.Object3D): void {
    this.measurementPoints.clear();
    
    scene.traverse((child) => {
      if (child instanceof THREE.Object3D && child.name) {
        // Look for objects with measurement point naming convention
        if (this.isMeasurementPoint(child.name)) {
          const point: MeasurementPoint = {
            id: child.name,
            name: child.name,
            position: [child.position.x, child.position.y, child.position.z],
            componentName: this.getComponentName(child.name),
            type: this.getMeasurementPointType(child.name)
          };
          
          this.measurementPoints.set(child.name, point);
          
          // Hide measurement point objects from view
          child.visible = false;
        }
      }
    });

    console.log('📏 Extracted measurement points:', Array.from(this.measurementPoints.keys()));
  }

  /**
   * Check if an object name indicates it's a measurement point
   */
  private isMeasurementPoint(name: string): boolean {
    const measurementKeywords = [
      'measurePoints.totalLength',
      'measurePoints.centerToCenter', 
      'hoseLengthStart',
      'hoseLengthEnd',
      'measurePoint',
      'dimension'
    ];
    
    return measurementKeywords.some(keyword => 
      name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract component name from measurement point name
   */
  private getComponentName(pointName: string): string {
    // Extract component name from patterns like "Component_measurePoints.totalLength"
    const parts = pointName.split('_');
    return parts.length > 1 ? parts[0] : pointName;
  }

  /**
   * Determine measurement point type from name
   */
  private getMeasurementPointType(pointName: string): 'start' | 'end' | 'center' {
    const lowerName = pointName.toLowerCase();
    
    if (lowerName.includes('start') || lowerName.includes('begin')) {
      return 'start';
    } else if (lowerName.includes('end') || lowerName.includes('finish')) {
      return 'end';
    } else if (lowerName.includes('center') || lowerName.includes('middle')) {
      return 'center';
    }
    
    return 'start'; // Default
  }

  /**
   * Set the active measurement type
   */
  setMeasurementType(measurementTypeId: string | null): void {
    this.activeMeasurementType = measurementTypeId;
    console.log('📏 Active measurement type:', measurementTypeId);
  }

  /**
   * Get current measurement type
   */
  getCurrentMeasurementType(): MeasurementType | null {
    if (!this.activeMeasurementType) return null;
    return MEASUREMENT_TYPES.find(type => type.id === this.activeMeasurementType) || null;
  }

  /**
   * Get available measurement types based on detected points
   */
  getAvailableMeasurementTypes(): string[] {
    const availableTypes: string[] = [];
    const pointNames = Array.from(this.measurementPoints.keys());
    
    // Check for total length points
    if (pointNames.some(name => name.includes('totalLength'))) {
      availableTypes.push('totalLength');
    }
    
    // Check for center to center points
    if (pointNames.some(name => name.includes('centerToCenter'))) {
      availableTypes.push('centerToCenter');
    }
    
    // Check for hose length points
    if (pointNames.some(name => name.includes('hoseLengthStart')) && 
        pointNames.some(name => name.includes('hoseLengthEnd'))) {
      availableTypes.push('hoseLength');
    }
    
    return availableTypes;
  }

  /**
   * Calculate dimension lines for the current measurement type
   */
  calculateDimensionLines(): DimensionLine[] {
    if (!this.activeMeasurementType) return [];

    const measurementType = this.getCurrentMeasurementType();
    if (!measurementType) return [];

    const dimensionLines: DimensionLine[] = [];

    switch (this.activeMeasurementType) {
      case 'totalLength':
        dimensionLines.push(...this.calculateTotalLengthDimensions(measurementType));
        break;
      case 'centerToCenter':
        dimensionLines.push(...this.calculateCenterToCenterDimensions(measurementType));
        break;
      case 'hoseLength':
        dimensionLines.push(...this.calculateHoseLengthDimensions(measurementType));
        break;
    }

    return dimensionLines;
  }

  /**
   * Calculate total length dimensions
   */
  private calculateTotalLengthDimensions(measurementType: MeasurementType): DimensionLine[] {
    const dimensions: DimensionLine[] = [];
    
    // Find all components with totalLength measurement points
    const totalLengthPoints = Array.from(this.measurementPoints.values())
      .filter(point => point.name.includes('totalLength'));

    // Group by component
    const componentGroups = new Map<string, MeasurementPoint[]>();
    totalLengthPoints.forEach(point => {
      const component = point.componentName;
      if (!componentGroups.has(component)) {
        componentGroups.set(component, []);
      }
      componentGroups.get(component)!.push(point);
    });

    // Create dimension lines for each component
    componentGroups.forEach((points, componentName) => {
      if (points.length >= 2) {
        // Sort points to find start and end (by X position)
        points.sort((a, b) => a.position[0] - b.position[0]);
        
        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const distance = this.calculateDistance(startPoint.position, endPoint.position);

        dimensions.push({
          id: `totalLength_${componentName}`,
          startPoint: startPoint.position,
          endPoint: endPoint.position,
          distance,
          label: `${distance.toFixed(1)} mm`,
          color: measurementType.color,
          measurementType: measurementType.id
        });
      }
    });

    return dimensions;
  }

  /**
   * Calculate center to center dimensions
   */
  private calculateCenterToCenterDimensions(measurementType: MeasurementType): DimensionLine[] {
    const dimensions: DimensionLine[] = [];
    
    // Find all center points
    const centerPoints = Array.from(this.measurementPoints.values())
      .filter(point => point.name.includes('centerToCenter'))
      .sort((a, b) => a.position[0] - b.position[0]); // Sort by X position

    // Create dimension lines between consecutive center points
    for (let i = 0; i < centerPoints.length - 1; i++) {
      const startPoint = centerPoints[i];
      const endPoint = centerPoints[i + 1];
      const distance = this.calculateDistance(startPoint.position, endPoint.position);

      dimensions.push({
        id: `centerToCenter_${i}`,
        startPoint: startPoint.position,
        endPoint: endPoint.position,
        distance,
        label: `C/C ${distance.toFixed(1)} mm`,
        color: measurementType.color,
        measurementType: measurementType.id
      });
    }

    return dimensions;
  }

  /**
   * Calculate hose length dimensions
   */
  private calculateHoseLengthDimensions(measurementType: MeasurementType): DimensionLine[] {
    const dimensions: DimensionLine[] = [];
    
    // Find hose start and end points
    const hoseStartPoints = Array.from(this.measurementPoints.values())
      .filter(point => point.name.includes('hoseLengthStart'));
    const hoseEndPoints = Array.from(this.measurementPoints.values())
      .filter(point => point.name.includes('hoseLengthEnd'));

    // Match start and end points by component
    hoseStartPoints.forEach(startPoint => {
      const matchingEndPoint = hoseEndPoints.find(endPoint => 
        endPoint.componentName === startPoint.componentName
      );

      if (matchingEndPoint) {
        const distance = this.calculateDistance(startPoint.position, matchingEndPoint.position);

        dimensions.push({
          id: `hoseLength_${startPoint.componentName}`,
          startPoint: startPoint.position,
          endPoint: matchingEndPoint.position,
          distance,
          label: `Hose ${distance.toFixed(1)} mm`,
          color: measurementType.color,
          measurementType: measurementType.id
        });
      }
    });

    return dimensions;
  }

  /**
   * Calculate distance between two 3D points
   */
  private calculateDistance(point1: [number, number, number], point2: [number, number, number]): number {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    const dz = point2[2] - point1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * 1000; // Convert to mm assuming model is in meters
  }

  /**
   * Get all available measurement points
   */
  getMeasurementPoints(): MeasurementPoint[] {
    return Array.from(this.measurementPoints.values());
  }

  /**
   * Get measurement points for a specific component
   */
  getComponentMeasurementPoints(componentName: string): MeasurementPoint[] {
    return Array.from(this.measurementPoints.values())
      .filter(point => point.componentName === componentName);
  }
}