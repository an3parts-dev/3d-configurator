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
  visibleComponents?: string[];
  hiddenComponents?: string[];
  conditionalLogic?: OptionValueConditionalLogic;
}

export interface ImageSettings {
  size: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  aspectRatio: 'square' | 'round' | '3:2' | '2:3' | 'auto';
  cornerStyle: 'squared' | 'soft' | 'softer';
  hideTitle: boolean;
  titlePosition: 'below' | 'above' | 'left' | 'right' | 'center';
}

export interface ConfiguratorOptionGroup {
  id: string;
  name: string;
  description?: string;
  isExpanded?: boolean;
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  description?: string;
  displayType: 'list' | 'buttons' | 'images' | 'grid';
  displayDirection?: 'column' | 'row';
  manipulationType: 'visibility' | 'material';
  targetComponents: string[];
  defaultBehavior?: 'show' | 'hide';
  conditionalLogic?: ConditionalLogic;
  imageSettings?: ImageSettings;
  values: ConfiguratorOptionValue[];
  groupId?: string;
  isGroup?: boolean;
  groupData?: ConfiguratorOptionGroup;
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