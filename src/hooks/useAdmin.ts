import { useState, useCallback } from 'react';
import { Product, CustomizationOption, AdminState } from '../types/AdminTypes';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Brake Line Configurator',
    modelUrl: '/models/brakeline.glb',
    description: 'Custom brake line configurator with multiple fitting options',
    basePrice: 45.00,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockCustomizationOptions: CustomizationOption[] = [
  {
    id: '1',
    productId: '1',
    title: 'Fitting Material',
    description: 'Choose the material for your brake line fittings',
    type: 'color',
    inputType: 'buttons',
    isRequired: true,
    order: 1,
    modelComponents: ['fitting_a', 'fitting_b'],
    isBindable: true,
    variantBinding: 'material',
    options: [
      {
        id: '1-1',
        title: 'Zinc Plated Steel (Standard)',
        value: 'zinc',
        color: '#A1A1AA',
        priceModifier: 0,
        isDefault: true,
        modelChanges: {
          colorChanges: { 'fitting_a': '#A1A1AA', 'fitting_b': '#A1A1AA' }
        }
      },
      {
        id: '1-2',
        title: 'Stainless Steel (Premium)',
        value: 'stainless',
        color: '#E5E7EB',
        priceModifier: 15.00,
        isDefault: false,
        modelChanges: {
          colorChanges: { 'fitting_a': '#E5E7EB', 'fitting_b': '#E5E7EB' }
        }
      }
    ]
  }
];

export const useAdmin = () => {
  const [adminState, setAdminState] = useState<AdminState>({
    products: mockProducts,
    selectedProduct: mockProducts[0],
    customizationOptions: mockCustomizationOptions,
    isLoading: false,
    error: null
  });

  const createProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAdminState(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    return newProduct;
  }, []);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setAdminState(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId
          ? { ...product, ...updates, updatedAt: new Date().toISOString() }
          : product
      ),
      selectedProduct: prev.selectedProduct?.id === productId
        ? { ...prev.selectedProduct, ...updates, updatedAt: new Date().toISOString() }
        : prev.selectedProduct
    }));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setAdminState(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== productId),
      selectedProduct: prev.selectedProduct?.id === productId ? null : prev.selectedProduct,
      customizationOptions: prev.customizationOptions.filter(option => option.productId !== productId)
    }));
  }, []);

  const selectProduct = useCallback((product: Product) => {
    setAdminState(prev => ({
      ...prev,
      selectedProduct: product,
      customizationOptions: mockCustomizationOptions.filter(option => option.productId === product.id)
    }));
  }, []);

  const createCustomizationOption = useCallback((optionData: Omit<CustomizationOption, 'id'>) => {
    const newOption: CustomizationOption = {
      ...optionData,
      id: Date.now().toString()
    };

    setAdminState(prev => ({
      ...prev,
      customizationOptions: [...prev.customizationOptions, newOption]
    }));

    return newOption;
  }, []);

  const updateCustomizationOption = useCallback((optionId: string, updates: Partial<CustomizationOption>) => {
    setAdminState(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.map(option =>
        option.id === optionId ? { ...option, ...updates } : option
      )
    }));
  }, []);

  const deleteCustomizationOption = useCallback((optionId: string) => {
    setAdminState(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.filter(option => option.id !== optionId)
    }));
  }, []);

  const reorderCustomizationOptions = useCallback((productId: string, newOrder: string[]) => {
    setAdminState(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.map(option => {
        if (option.productId === productId) {
          const newOrderIndex = newOrder.indexOf(option.id);
          return { ...option, order: newOrderIndex >= 0 ? newOrderIndex : option.order };
        }
        return option;
      })
    }));
  }, []);

  return {
    adminState,
    createProduct,
    updateProduct,
    deleteProduct,
    selectProduct,
    createCustomizationOption,
    updateCustomizationOption,
    deleteCustomizationOption,
    reorderCustomizationOptions
  };
};