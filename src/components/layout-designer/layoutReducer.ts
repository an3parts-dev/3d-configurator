import { LayoutState, LayoutAction, LayoutConfiguration } from '../../types/LayoutTypes';

export const initialLayoutState: LayoutState = {
  currentLayout: null,
  selectedComponent: null,
  hoveredComponent: null,
  draggedComponent: null,
  viewport: 'desktop',
  zoom: 1,
  isDragging: false,
  isResizing: false,
  history: [],
  historyIndex: -1,
  clipboard: null
};

export const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'LOAD_LAYOUT':
      return {
        ...state,
        currentLayout: action.payload,
        selectedComponent: null,
        history: [action.payload],
        historyIndex: 0
      };

    case 'ADD_COMPONENT':
      if (!state.currentLayout) return state;
      
      const newLayout = {
        ...state.currentLayout,
        components: [...state.currentLayout.components, action.payload],
        updatedAt: new Date()
      };
      
      return {
        ...state,
        currentLayout: newLayout,
        selectedComponent: action.payload.id,
        history: [...state.history.slice(0, state.historyIndex + 1), newLayout],
        historyIndex: state.historyIndex + 1
      };

    case 'UPDATE_COMPONENT':
      if (!state.currentLayout) return state;
      
      const updatedLayout = {
        ...state.currentLayout,
        components: state.currentLayout.components.map(component =>
          component.id === action.payload.id
            ? { ...component, ...action.payload.updates }
            : component
        ),
        updatedAt: new Date()
      };
      
      return {
        ...state,
        currentLayout: updatedLayout,
        history: [...state.history.slice(0, state.historyIndex + 1), updatedLayout],
        historyIndex: state.historyIndex + 1
      };

    case 'DELETE_COMPONENT':
      if (!state.currentLayout) return state;
      
      const filteredLayout = {
        ...state.currentLayout,
        components: state.currentLayout.components.filter(
          component => component.id !== action.payload
        ),
        updatedAt: new Date()
      };
      
      return {
        ...state,
        currentLayout: filteredLayout,
        selectedComponent: state.selectedComponent === action.payload ? null : state.selectedComponent,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredLayout],
        historyIndex: state.historyIndex + 1
      };

    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponent: action.payload
      };

    case 'HOVER_COMPONENT':
      return {
        ...state,
        hoveredComponent: action.payload
      };

    case 'SET_VIEWPORT':
      return {
        ...state,
        viewport: action.payload
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: action.payload
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          currentLayout: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          selectedComponent: null
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          currentLayout: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          selectedComponent: null
        };
      }
      return state;

    case 'COPY_COMPONENT':
      if (!state.currentLayout || !state.selectedComponent) return state;
      
      const componentToCopy = state.currentLayout.components.find(
        c => c.id === state.selectedComponent
      );
      
      return {
        ...state,
        clipboard: componentToCopy || null
      };

    case 'PASTE_COMPONENT':
      if (!state.currentLayout || !state.clipboard) return state;
      
      const pastedComponent = {
        ...state.clipboard,
        id: `${state.clipboard.type}_${Date.now()}`,
        position: {
          x: state.clipboard.position.x + 20,
          y: state.clipboard.position.y + 20
        }
      };
      
      const pasteLayout = {
        ...state.currentLayout,
        components: [...state.currentLayout.components, pastedComponent],
        updatedAt: new Date()
      };
      
      return {
        ...state,
        currentLayout: pasteLayout,
        selectedComponent: pastedComponent.id,
        history: [...state.history.slice(0, state.historyIndex + 1), pasteLayout],
        historyIndex: state.historyIndex + 1
      };

    case 'RESET_LAYOUT':
      const emptyLayout: LayoutConfiguration = {
        id: `layout_${Date.now()}`,
        name: 'New Layout',
        description: 'A new layout configuration',
        components: [],
        responsive: {
          breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
          },
          layouts: {
            mobile: [],
            tablet: [],
            desktop: []
          }
        },
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            accent: '#8b5cf6',
            background: '#ffffff',
            surface: '#f9fafb',
            text: '#111827',
            textSecondary: '#6b7280',
            border: '#e5e7eb',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem'
            },
            fontWeight: {
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            },
            lineHeight: {
              tight: 1.25,
              normal: 1.5,
              relaxed: 1.75
            }
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '3rem'
          },
          borderRadius: {
            none: '0',
            sm: '0.125rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            full: '9999px'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }
        },
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return {
        ...state,
        currentLayout: emptyLayout,
        selectedComponent: null,
        history: [emptyLayout],
        historyIndex: 0
      };

    default:
      return state;
  }
};