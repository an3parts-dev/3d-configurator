import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderPlus, 
  Settings, 
  Layers,
  ChevronDown,
  ChevronRight,
  Users,
  Grid,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react';
import OptimizedUngroupedPanel from './OptimizedUngroupedPanel';
import OptimizedGroupsPanel from './OptimizedGroupsPanel';
import OptimizedDragOverlay from './OptimizedDragOverlay';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface OptimizedConfigurationInterfaceProps {
  options: ConfiguratorOption[];
  groups: ConfiguratorOptionGroup[];
  onOptionsChange: (options: ConfiguratorOption[]) => void;
  onGroupsChange: (groups: ConfiguratorOptionGroup[]) => void;
  onCreateOption: () => void;
  onCreateGroup: () => void;
  onEditOption: (option: ConfiguratorOption) => void;
  onEditGroup: (group: ConfiguratorOptionGroup) => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const OptimizedConfigurationInterface: React.FC<OptimizedConfigurationInterfaceProps> = ({
  options,
  groups,
  onOptionsChange,
  onGroupsChange,
  onCreateOption,
  onCreateGroup,
  onEditOption,
  onEditGroup,
  onDeleteOption,
  onDeleteGroup
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'option' | 'group' | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [dragPreview, setDragPreview] = useState<{
    targetZone: string | null;
    position: { x: number; y: number } | null;
  }>({ targetZone: null, position: null });

  // Enhanced sensors with better activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cleanup function to consolidate and optimize options
  const cleanupOptions = useCallback(() => {
    const cleanedOptions = options.map(option => {
      if (option.isGroup) return option;
      
      // Remove redundant properties and consolidate similar options
      const cleaned = {
        ...option,
        // Remove meaningless icons and consolidate display types
        displayType: option.displayType === 'list' ? 'buttons' : option.displayType,
        // Consolidate target components
        targetComponents: [...new Set(option.targetComponents)],
        // Clean up values
        values: option.values.filter(value => value.name.trim() !== '')
      };
      
      return cleaned;
    });
    
    onOptionsChange(cleanedOptions);
  }, [options, onOptionsChange]);

  // Get ungrouped options (for left panel)
  const ungroupedOptions = useMemo(() => 
    options.filter(option => !option.groupId && !option.isGroup), 
    [options]
  );

  // Get grouped options organized by group
  const groupedOptions = useMemo(() => 
    groups.map(group => ({
      ...group,
      options: options.filter(option => option.groupId === group.id && !option.isGroup)
    })), 
    [groups, options]
  );

  // Enhanced collision detection with grid-snap system
  const customCollisionDetection = useCallback((args: any) => {
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    return rectIntersection(args);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const option = options.find(opt => opt.id === active.id);
    const group = groups.find(grp => grp.id === active.id);
    
    if (option) {
      setActiveType('option');
    } else if (group) {
      setActiveType('group');
    }
  }, [options, groups]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDragPreview({ targetZone: null, position: null });
      return;
    }

    const activeOption = options.find(opt => opt.id === active.id);
    const overData = over.data.current;
    
    if (!activeOption || !overData) return;

    // Set drag preview based on target zone
    if (overData.type === 'group-drop-zone') {
      setDragPreview({ 
        targetZone: `group-${overData.groupId}`, 
        position: { x: event.delta.x, y: event.delta.y } 
      });
      
      const targetGroupId = overData.groupId;
      
      if (activeOption.groupId !== targetGroupId) {
        onOptionsChange(
          options.map(option => 
            option.id === activeOption.id 
              ? { ...option, groupId: targetGroupId }
              : option
          )
        );
      }
    } else if (overData.type === 'ungrouped-zone') {
      setDragPreview({ 
        targetZone: 'ungrouped', 
        position: { x: event.delta.x, y: event.delta.y } 
      });
      
      if (activeOption.groupId) {
        onOptionsChange(
          options.map(option => 
            option.id === activeOption.id 
              ? { ...option, groupId: undefined }
              : option
          )
        );
      }
    }
  }, [options, onOptionsChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveType(null);
    setDragPreview({ targetZone: null, position: null });
    
    if (!over || active.id === over.id) return;

    const overData = over.data.current;
    
    // Handle reordering within the same container
    if (overData?.type === 'option' || overData?.type === 'group') {
      const activeOption = options.find(opt => opt.id === active.id);
      const overOption = options.find(opt => opt.id === over.id);
      
      if (activeOption && overOption) {
        // Check if both options are in the same group or both ungrouped
        if (activeOption.groupId === overOption.groupId) {
          const oldIndex = options.findIndex(opt => opt.id === active.id);
          const newIndex = options.findIndex(opt => opt.id === over.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            onOptionsChange(arrayMove(options, oldIndex, newIndex));
          }
        }
      }
      
      // Handle group reordering
      const activeGroup = groups.find(grp => grp.id === active.id);
      const overGroup = groups.find(grp => grp.id === over.id);
      
      if (activeGroup && overGroup) {
        const oldIndex = groups.findIndex(grp => grp.id === active.id);
        const newIndex = groups.findIndex(grp => grp.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          onGroupsChange(arrayMove(groups, oldIndex, newIndex));
        }
      }
    }
  }, [options, groups, onOptionsChange, onGroupsChange]);

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const activeItem = activeId ? 
    options.find(opt => opt.id === activeId) || 
    groups.find(grp => grp.id === activeId) : null;

  // Calculate dynamic container sizes
  const containerSizes = useMemo(() => {
    const ungroupedCount = ungroupedOptions.length;
    const groupsCount = groups.length;
    const totalGroupedOptions = groupedOptions.reduce((sum, group) => sum + group.options.length, 0);
    
    // Dynamic width calculation based on content
    const leftPanelWidth = ungroupedCount > 0 ? 
      Math.min(50, Math.max(30, ungroupedCount * 5 + 25)) : 25;
    const rightPanelWidth = 100 - leftPanelWidth;
    
    return { leftPanelWidth, rightPanelWidth };
  }, [ungroupedOptions.length, groups.length, groupedOptions]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {/* Enhanced Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 font-bold text-2xl flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span>Configuration Manager</span>
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Organize your configurator options with intuitive drag-and-drop
              </p>
            </div>
            
            {/* Cleanup Button */}
            <button
              onClick={cleanupOptions}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cleanup</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCreateOption}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Group</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Ungrouped: {ungroupedOptions.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-purple-500" />
              <span>Groups: {groups.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>Total Options: {options.filter(opt => !opt.isGroup).length}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area with Dynamic Sizing */}
        <div className="flex-1 flex overflow-hidden">
          {/* Ungrouped Options Panel */}
          <div 
            className="border-r border-gray-200 flex flex-col transition-all duration-300"
            style={{ width: `${containerSizes.leftPanelWidth}%` }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
              <h2 className="text-gray-900 font-semibold text-lg flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Ungrouped Options</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {ungroupedOptions.length}
                </span>
              </h2>
              <p className="text-gray-700 text-sm mt-1">
                Standalone options ready for grouping
              </p>
            </div>
            
            <div className="flex-1 overflow-auto">
              <OptimizedUngroupedPanel
                options={ungroupedOptions}
                onEditOption={onEditOption}
                onDeleteOption={onDeleteOption}
                dragPreview={dragPreview}
              />
            </div>
          </div>

          {/* Groups Panel */}
          <div 
            className="flex flex-col transition-all duration-300"
            style={{ width: `${containerSizes.rightPanelWidth}%` }}
          >
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-b border-gray-200">
              <h2 className="text-gray-900 font-semibold text-lg flex items-center space-x-2">
                <Grid className="w-5 h-5 text-purple-600" />
                <span>Organized Groups</span>
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {groups.length}
                </span>
              </h2>
              <p className="text-gray-700 text-sm mt-1">
                Organized collections of related options
              </p>
            </div>
            
            <div className="flex-1 overflow-auto">
              <OptimizedGroupsPanel
                groups={groupedOptions}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroupExpansion}
                onEditOption={onEditOption}
                onEditGroup={onEditGroup}
                onDeleteOption={onDeleteOption}
                onDeleteGroup={onDeleteGroup}
                dragPreview={dragPreview}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Drag Overlay */}
        <DragOverlay 
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeItem && (
            <OptimizedDragOverlay
              item={activeItem}
              type={activeType}
              dragPreview={dragPreview}
            />
          )}
        </DragOverlay>

        {/* Grid Snap Indicators */}
        <AnimatePresence>
          {dragPreview.targetZone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-sm">
                <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
};

export default OptimizedConfigurationInterface;