// Enhanced types for the configurator system with length measurement features
export interface ConditionalRule {
  id: string;
  optionId: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: string | string[];
}

export interface ConditionalLogic {
  id: string;
  enabled: boolean;
  operator: 'AND' | 'OR';
  rules: ConditionalRule[];
}

export interface OptionValueConditionalLogic {
  id: string;
  enabled: boolean;
  operator: 'AND' | 'OR';
  rules: ConditionalRule[];
}

export interface MeasurePoint {
  id: string;
  name: string;
  description: string;
  componentName: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  type: 'sealing_point' | 'hex_surface' | 'fitting_end' | 'hose_end';
}

export interface LengthSettings {
  measurementType: 'cc' | 'total' | 'hose';
  defaultValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  unit: 'mm' | 'cm' | 'in' | 'ft';
  measurePoints: MeasurePoint[];
}

export interface ConfiguratorOptionValue {
  id: string;
  name: string;
  color?: string;
  image?: string;
  hideTitle?: boolean;
  visibleComponents?: string[];
  hiddenComponents?: string[];
  lengthValue?: number;
  measurePoints?: MeasurePoint[];
  conditionalLogic?: OptionValueConditionalLogic;
}

export interface ImageSettings {
  size: 'small' | 'medium' | 'large';
  aspectRatio: '1:1' | '4:3' | '16:9' | '3:2' | '2:3';
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  displayType: 'list' | 'buttons' | 'images' | 'length_input';
  manipulationType: 'visibility' | 'material' | 'length';
  targetComponents: string[];
  defaultBehavior?: 'show' | 'hide';
  conditionalLogic?: ConditionalLogic;
  imageSettings?: ImageSettings;
  lengthSettings?: LengthSettings;
  values: ConfiguratorOptionValue[];
}

export interface ConfiguratorData {
  id: string;
  name: string;
  description: string;
  model: string;
  options: ConfiguratorOption[];
}

export interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
  originalVisible?: boolean;
  originalMaterial?: any;
}