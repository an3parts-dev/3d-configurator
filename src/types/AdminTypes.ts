export interface Product {
  id: string;
  name: string;
  modelUrl: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationOption {
  id: string;
  productId: string;
  title: string;
  description?: string;
  type: 'color' | 'visibility' | 'text' | 'image' | 'dropdown' | 'range';
  inputType: 'buttons' | 'dropdown' | 'color-palette-round' | 'color-palette-square' | 'range' | 'text' | 'image-upload';
  isRequired: boolean;
  order: number;
  cameraAngle?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  modelComponents: string[];
  options: CustomizationOptionValue[];
  conditionalLogic?: ConditionalLogic;
  isBindable: boolean;
  variantBinding?: string;
  hideTitle?: boolean;
}

export interface CustomizationOptionValue {
  id: string;
  title: string;
  value: string;
  color?: string;
  image?: string;
  texture?: string;
  priceModifier: number;
  isDefault: boolean;
  conditionalLogic?: ConditionalLogic;
  modelChanges?: {
    showComponents?: string[];
    hideComponents?: string[];
    colorChanges?: { [componentName: string]: string };
  };
}

export interface ConditionalLogic {
  isConditional: boolean;
  showWhen: 'shown' | 'hidden';
  conditions: Condition[];
}

export interface Condition {
  optionId: string;
  optionValueId: string;
  operator: 'equals' | 'not-equals';
}

export interface AdminState {
  products: Product[];
  selectedProduct: Product | null;
  customizationOptions: CustomizationOption[];
  isLoading: boolean;
  error: string | null;
}