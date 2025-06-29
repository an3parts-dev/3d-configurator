import React from 'react';
import { Configuration } from '../types/Configuration';
import { OptionSection } from './OptionSection';
import { ChevronDown } from 'lucide-react';

interface ConfigPanelProps {
  configuration: Configuration;
  onUpdate: (updates: Partial<Configuration>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ configuration, onUpdate }) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['material', 'fittingType', 'hoseColor'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Helper function to get available fitting sizes based on fitting type
  const getAvailableFittingSizes = (fittingType: string) => {
    if (fittingType === 'banjo') {
      // For banjo fittings, only show these 4 options
      return [
        { value: '10mm', label: '10mm (same as 3/8")' },
        { value: '8mm', label: '8mm' },
        { value: '11mm', label: '11mm (same as 7/16")' },
        { value: '12mm', label: '12mm' }
      ];
    } else {
      // For all other fitting types, show the full list
      return [
        { value: '10mm', label: '10mm (same as 3/8")' },
        { value: '8mm', label: '8mm' },
        { value: '11mm', label: '11mm (same as 7/16")' },
        { value: '12mm', label: '12mm' },
        { value: 'm10x1-convex', label: 'M10x1 (Convex)' },
        { value: 'm10x1-concave', label: 'M10x1 (Concave)' },
        { value: 'm10x1.25-convex', label: 'M10x1.25 (Convex)' },
        { value: 'm10x1.25-concave', label: 'M10x1.25 (Concave)' },
        { value: 'm12x1-convex', label: 'M12x1.0 (Convex)' },
        { value: 'm12x1-concave', label: 'M12x1.0 (Concave)' },
        { value: '3/8-24-convex', label: '3/8"-24 UNF (Convex)' },
        { value: '3/8-24-concave', label: '3/8"-24 UNF (Concave)' },
        { value: '7/16-20-convex', label: '7/16"-20 UNF (Convex)' },
        { value: '7/16-20-concave', label: '7/16"-20 UNF (Concave)' },
        { value: '7/16-24-convex', label: '7/16"-24 UNF (Convex)' },
        { value: '7/16-24-concave', label: '7/16"-24 UNF (Concave)' },
        { value: '1/2-20-convex', label: '1/2"-20 UNF (Convex)' },
        { value: '1/2-20-concave', label: '1/2"-20 UNF (Concave)' },
        { value: '9/16-18-convex', label: '9/16"-18 UNF (Convex)' },
        { value: '9/16-18-concave', label: '9/16"-18 UNF (Concave)' },
        { value: '1/8-27-npt', label: '1/8"-27 NPT (Tapered)' }
      ];
    }
  };

  const sections = [
    {
      id: 'material',
      title: 'Fitting Material',
      options: [
        { value: 'zinc', label: 'Zinc Plated Steel (Standard)', color: '#A1A1AA' },
        { value: 'stainless', label: 'Stainless Steel (Premium)', color: '#E5E7EB' }
      ]
    },
    {
      id: 'fittingType',
      title: 'Fitting Types',
      subsections: [
        {
          id: 'a',
          title: 'A - Fitting Type',
          options: [
            { value: 'banjo', label: 'Banjo' },
            { value: 'swivel-male', label: 'Swivel Male' },
            { value: 'fixed-male', label: 'Fixed Male' },
            { value: 'fixed-male-extended', label: 'Fixed Male Extended' },
            { value: 'fixed-bulkhead', label: 'Fixed Bulkhead' },
            { value: 'swivel-female', label: 'Swivel Female' },
            { value: 'swivel-female-circlip', label: 'Swivel Female Circlip' },
            { value: 'fixed-female', label: 'Fixed Female' },
            { value: 'swivel-bulkhead-female', label: 'Swivel Bulkhead Female' },
            { value: 'tee', label: 'Tee' }
          ]
        },
        {
          id: 'b',
          title: 'B - Fitting Type',
          options: [
            { value: 'banjo', label: 'Banjo' },
            { value: 'swivel-male', label: 'Swivel Male' },
            { value: 'fixed-male', label: 'Fixed Male' },
            { value: 'fixed-male-extended', label: 'Fixed Male Extended' },
            { value: 'fixed-bulkhead', label: 'Fixed Bulkhead' },
            { value: 'swivel-female', label: 'Swivel Female' },
            { value: 'swivel-female-circlip', label: 'Swivel Female Circlip' },
            { value: 'fixed-female', label: 'Fixed Female' },
            { value: 'swivel-bulkhead-female', label: 'Swivel Bulkhead Female' },
            { value: 'tee', label: 'Tee' }
          ]
        }
      ]
    },
    {
      id: 'fittingSize',
      title: 'Fitting Sizes',
      subsections: [
        {
          id: 'a',
          title: 'A - Fitting Size',
          options: getAvailableFittingSizes(configuration.fittingType.a)
        },
        {
          id: 'b',
          title: 'B - Fitting Size',
          options: getAvailableFittingSizes(configuration.fittingType.b)
        }
      ]
    },
    {
      id: 'fittingAngle',
      title: 'Fitting Angles',
      subsections: [
        {
          id: 'a',
          title: 'A - Fitting Angle',
          options: [
            { value: 'straight-short', label: 'Straight (Short)' },
            { value: 'straight', label: 'Straight' },
            { value: '20', label: '20°' },
            { value: '30', label: '30°' },
            { value: '45', label: '45°' },
            { value: '60', label: '60°' },
            { value: '70', label: '70°' },
            { value: '90', label: '90°' },
            { value: '20-sidebend', label: '20° Sidebend' },
            { value: '30-sidebend', label: '30° Sidebend' },
            { value: '45-sidebend', label: '45° Sidebend' },
            { value: '60-sidebend', label: '60° Sidebend' },
            { value: '70-sidebend', label: '70° Sidebend' },
            { value: '90-sidebend', label: '90° Sidebend' }
          ]
        },
        {
          id: 'b',
          title: 'B - Fitting Angle',
          options: [
            { value: 'straight-short', label: 'Straight (Short)' },
            { value: 'straight', label: 'Straight' },
            { value: '20', label: '20°' },
            { value: '30', label: '30°' },
            { value: '45', label: '45°' },
            { value: '60', label: '60°' },
            { value: '70', label: '70°' },
            { value: '90', label: '90°' },
            { value: '20-sidebend', label: '20° Sidebend' },
            { value: '30-sidebend', label: '30° Sidebend' },
            { value: '45-sidebend', label: '45° Sidebend' },
            { value: '60-sidebend', label: '60° Sidebend' },
            { value: '70-sidebend', label: '70° Sidebend' },
            { value: '90-sidebend', label: '90° Sidebend' }
          ]
        }
      ]
    },
    {
      id: 'hoseColor',
      title: 'Hose Color',
      options: [
        { value: 'clear', label: 'Clear (Transparent)', color: 'transparent', border: '#6B7280' },
        { value: 'black', label: 'Black (Solid)', color: '#000000' },
        { value: 'red', label: 'Red (Solid)', color: '#EF4444' },
        { value: 'white', label: 'White (Solid)', color: '#FFFFFF' },
        { value: 'blue', label: 'Baby Blue (Solid)', color: '#60A5FA' },
        { value: 'green', label: 'Green (Solid)', color: '#10B981' },
        { value: 'yellow', label: 'Yellow (Solid)', color: '#F59E0B' },
        { value: 'carbon-transparent', label: 'Carbon (Transparent)', color: '#374151' },
        { value: 'dark-blue-transparent', label: 'Dark Blue (Transparent)', color: '#1E40AF' },
        { value: 'light-green-transparent', label: 'Light Green (Transparent)', color: '#84CC16' },
        { value: 'dark-green-transparent', label: 'Dark Green (Transparent)', color: '#166534' },
        { value: 'dark-purple-transparent', label: 'Dark Purple (Transparent)', color: '#7C3AED' }
      ]
    },
    {
      id: 'stealth',
      title: 'Stealth Heatshrink',
      options: [
        { value: false, label: 'No' },
        { value: true, label: 'Yes' }
      ]
    },
    {
      id: 'length',
      title: 'Hose Length',
      type: 'range',
      min: 10,
      max: 500,
      step: 1,
      unit: 'cm'
    },
    {
      id: 'purpose',
      title: 'Line Purpose',
      options: [
        { value: 'other', label: 'Other' },
        { value: 'car-caliper', label: 'Car Caliper' }
      ]
    },
    {
      id: 'accessories',
      title: 'Accessories',
      options: [
        { value: 'none', label: 'None' },
        { value: 'pvc-tube', label: 'PVC Tube' },
        { value: 'hose-supports', label: 'Hose Supports' }
      ]
    }
  ];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-white">Configuration Options</h2>
      
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 bg-gray-750 hover:bg-gray-700 flex items-center justify-between transition-colors"
            >
              <span className="font-medium text-white">{section.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSections.has(section.id) ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {expandedSections.has(section.id) && (
              <div className="p-4 bg-gray-800">
                <OptionSection
                  section={section}
                  configuration={configuration}
                  onUpdate={onUpdate}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};