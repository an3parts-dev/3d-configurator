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
  size: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  aspectRatio: 'square' | 'round' | '3:2' | '2:3' | 'auto';
  cornerStyle: 'squared' | 'soft' | 'softer';
  hideTitle: boolean;
  titlePosition: 'below' | 'above' | 'left' | 'right' | 'center';
}

export interface GridSettings {
  columns: number;
  columnsTablet: number;
  columnsMobile: number;
  gap: 'small' | 'medium' | 'large';
  autoFit: boolean;
  minItemWidth: number;
}

export interface ColumnSettings {
  alignment: 'left' | 'center' | 'right';
  spacing: 'compact' | 'normal' | 'relaxed';
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
  displayType: 'list' | 'buttons' | 'images';
  displayDirection?: 'column' | 'row' | 'grid';
  manipulationType: 'visibility' | 'material';
  targetComponents: string[];
  defaultBehavior?: 'show' | 'hide';
  conditionalLogic?: ConditionalLogic;
  imageSettings?: ImageSettings;
  gridSettings?: GridSettings;
  columnSettings?: ColumnSettings;
  values: ConfiguratorOptionValue[];
  groupId?: string; // Reference to group
  isGroup?: boolean; // Flag to identify if this is a group header
  groupData?: ConfiguratorOptionGroup; // Group data when isGroup is true
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