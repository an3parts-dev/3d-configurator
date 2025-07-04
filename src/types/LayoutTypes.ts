// Layout Designer Types
export interface LayoutComponent {
  id: string;
  type: 'viewport' | 'options' | 'info' | 'price' | 'cart' | 'container';
  name: string;
  props: Record<string, any>;
  style: LayoutStyle;
  children?: LayoutComponent[];
  position: Position;
  constraints?: Constraints;
}

export interface LayoutStyle {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  padding?: Spacing;
  margin?: Spacing;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  display?: 'flex' | 'grid' | 'block' | 'inline-block';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string | number;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  zIndex?: number;
}

export interface Spacing {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Constraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  maintainAspectRatio?: boolean;
}

export interface ViewportSettings {
  aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  customWidth?: number;
  customHeight?: number;
  controls: {
    zoom: boolean;
    rotate: boolean;
    pan: boolean;
  };
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  lighting: {
    ambient: number;
    directional: number;
    environment: string;
  };
}

export interface OptionsDisplaySettings {
  layout: 'grid' | 'list' | 'tabs' | 'accordion';
  columns?: number;
  spacing: 'compact' | 'normal' | 'relaxed';
  showImages: boolean;
  showPrices: boolean;
  grouping: 'none' | 'category' | 'custom';
}

export interface PriceSettings {
  currency: string;
  format: 'symbol' | 'code' | 'name';
  position: 'before' | 'after';
  showBreakdown: boolean;
  showTax: boolean;
  showDiscount: boolean;
}

export interface CartSettings {
  style: 'button' | 'floating' | 'sidebar';
  showQuantity: boolean;
  showPrice: boolean;
  showImage: boolean;
  position: 'top-right' | 'bottom-right' | 'bottom-left' | 'center';
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'ecommerce' | 'showcase' | 'minimal' | 'advanced';
  components: LayoutComponent[];
  responsive: ResponsiveSettings;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponsiveSettings {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  layouts: {
    mobile: LayoutComponent[];
    tablet: LayoutComponent[];
    desktop: LayoutComponent[];
  };
}

export interface LayoutConfiguration {
  id: string;
  name: string;
  description: string;
  template?: string;
  components: LayoutComponent[];
  responsive: ResponsiveSettings;
  theme: LayoutTheme;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComponentRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    defaultProps: Record<string, any>;
    defaultStyle: LayoutStyle;
    constraints?: Constraints;
    category: 'layout' | 'content' | 'interactive' | 'media';
    icon: string;
    description: string;
  };
}

export interface DragItem {
  id: string;
  type: string;
  component?: LayoutComponent;
  isNew?: boolean;
}

export interface DropResult {
  targetId: string;
  position: Position;
  index?: number;
}

export interface LayoutState {
  currentLayout: LayoutConfiguration | null;
  selectedComponent: string | null;
  hoveredComponent: string | null;
  draggedComponent: DragItem | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  zoom: number;
  isDragging: boolean;
  isResizing: boolean;
  history: LayoutConfiguration[];
  historyIndex: number;
  clipboard: LayoutComponent | null;
}

export interface LayoutAction {
  type: 'ADD_COMPONENT' | 'UPDATE_COMPONENT' | 'DELETE_COMPONENT' | 'MOVE_COMPONENT' | 
        'SELECT_COMPONENT' | 'HOVER_COMPONENT' | 'SET_VIEWPORT' | 'SET_ZOOM' |
        'UNDO' | 'REDO' | 'COPY_COMPONENT' | 'PASTE_COMPONENT' | 'LOAD_LAYOUT' |
        'SAVE_LAYOUT' | 'RESET_LAYOUT' | 'SET_THEME' | 'UPDATE_RESPONSIVE';
  payload?: any;
}