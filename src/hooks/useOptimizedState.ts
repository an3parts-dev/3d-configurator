import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/Logger';

/**
 * Optimized state hook with debouncing and performance monitoring
 * Reduces unnecessary re-renders and provides state change tracking
 */
export function useOptimizedState<T>(
  initialValue: T,
  debounceMs: number = 0,
  label?: string
): [T, (value: T | ((prev: T) => T)) => void, { isDebouncing: boolean }] {
  const [state, setState] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(Date.now());

  const debouncedSetState = useCallback((value: T | ((prev: T) => T)) => {
    if (debounceMs === 0) {
      setState(value);
      return;
    }

    setIsDebouncing(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(value);
      setIsDebouncing(false);
      
      if (label) {
        const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
        logger.debug(`State update: ${label}`, { timeSinceLastUpdate });
        lastUpdateRef.current = Date.now();
      }
    }, debounceMs);
  }, [debounceMs, label]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, debouncedSetState, { isDebouncing }];
}

/**
 * Optimized array state hook with efficient updates
 */
export function useOptimizedArrayState<T>(
  initialValue: T[] = [],
  keyExtractor?: (item: T) => string | number
): [
  T[],
  {
    add: (item: T) => void;
    remove: (index: number | string) => void;
    update: (index: number | string, updates: Partial<T>) => void;
    move: (fromIndex: number, toIndex: number) => void;
    replace: (items: T[]) => void;
    clear: () => void;
  }
] {
  const [items, setItems] = useState<T[]>(initialValue);

  const actions = useCallback(() => ({
    add: (item: T) => {
      setItems(prev => [...prev, item]);
    },

    remove: (indexOrKey: number | string) => {
      setItems(prev => {
        if (typeof indexOrKey === 'number') {
          return prev.filter((_, index) => index !== indexOrKey);
        } else if (keyExtractor) {
          return prev.filter(item => keyExtractor(item) !== indexOrKey);
        }
        return prev;
      });
    },

    update: (indexOrKey: number | string, updates: Partial<T>) => {
      setItems(prev => prev.map((item, index) => {
        const shouldUpdate = typeof indexOrKey === 'number' 
          ? index === indexOrKey
          : keyExtractor && keyExtractor(item) === indexOrKey;
        
        return shouldUpdate ? { ...item, ...updates } : item;
      }));
    },

    move: (fromIndex: number, toIndex: number) => {
      setItems(prev => {
        if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
          return prev;
        }
        
        const newItems = [...prev];
        const [movedItem] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, movedItem);
        return newItems;
      });
    },

    replace: (newItems: T[]) => {
      setItems(newItems);
    },

    clear: () => {
      setItems([]);
    }
  }), [keyExtractor]);

  return [items, actions()];
}