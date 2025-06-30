// Enhanced types for the configurator system with new features
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

export interface ConfiguratorOptionValue {
  id: string;
  name: string;
  color?: string;
  image?: string;
  hideTitle?: boolean;
  visibleComponents?: string[];
  hiddenComponents?: string[];
  conditionalLogic?: OptionValueConditionalLogic;
}

export interface ImageSettings {
  size: 'small' | 'medium' | 'large';
  aspectRatio: '1:1' | '4:3' | '16:9' | '3:2' | '2:3';
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  displayType: 'list' | 'buttons' | 'images';
  manipulationType: 'visibility' | 'material';
  targetComponents: string[];
  defaultBehavior?: 'show' | 'hide';
  conditionalLogic?: ConditionalLogic;
  imageSettings?: ImageSettings;
  values: ConfiguratorOptionValue[];
  parentId?: string; // For grouping
  isGroup?: boolean;
  children?: string[]; // Child option IDs
  showTitle?: boolean; // For groups - whether to show the group title
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