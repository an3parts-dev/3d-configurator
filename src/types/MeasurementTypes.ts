export interface MeasurementPoint {
  id: string;
  name: string;
  position: [number, number, number];
  componentName: string;
  type: 'start' | 'end' | 'center';
}

export interface MeasurementType {
  id: string;
  name: string;
  description: string;
  startPointName: string;
  endPointName: string;
  color: string;
}

export interface DimensionLine {
  id: string;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  distance: number;
  label: string;
  color: string;
  measurementType: string;
}

export const MEASUREMENT_TYPES: MeasurementType[] = [
  {
    id: 'totalLength',
    name: 'Total Length',
    description: 'Overall length of the component',
    startPointName: 'measurePoints.totalLength',
    endPointName: 'measurePoints.totalLength',
    color: '#3B82F6'
  },
  {
    id: 'centerToCenter',
    name: 'C/C (Center to Center)',
    description: 'Distance between component centers',
    startPointName: 'measurePoints.centerToCenter',
    endPointName: 'measurePoints.centerToCenter',
    color: '#10B981'
  },
  {
    id: 'hoseLength',
    name: 'Hose Length',
    description: 'Length of the hose section',
    startPointName: 'hoseLengthStart',
    endPointName: 'hoseLengthEnd',
    color: '#F59E0B'
  }
];