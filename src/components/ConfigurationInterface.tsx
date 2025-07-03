import React, { useState, useCallback } from 'react';
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
  getFirstCollision,
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
  Users
} from 'lucide-react';
import IndividualOptionsPanel from './configuration/IndividualOptionsPanel';
import GroupsPanel from './configuration/GroupsPanel';
import DragOverlayComponent from './configuration/DragOverlayComponent';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../types/ConfiguratorTypes';

interface ConfigurationInterfaceProps {
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

const ConfigurationInterface: React.FC<ConfigurationInterfaceProps> = ({
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

  // Get ungrouped options (for Individual Options Panel)
  const ungroupedOptions = options.filter(option => !option.groupId);

  // Get grouped options organized by group
  const groupedOptions = groups.map(group => ({
    ...group,
    options: options.filter(option => option.groupId === group.id)
  }));

  // Custom collision detection for better drop zone handling
  const customCollisionDetection = useCallback((args: any) => {
    // First, let's see if there are any collisions with the pointer
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // If there are no pointer collisions, use rectangle intersection
    return rectIntersection(args);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Determine if we're dragging an option or group
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
    
    if (!over || active.id === over.id) return;

    const activeOption = options.find(opt => opt.id === active.id);
    const overData = over.data.current;
    
    if (!activeOption || !overData) return;

    // Handle moving option to/from groups
    if (overData.type === 'group-drop-zone') {
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
    } else if (overData.type === 'individual-options-zone') {
      // Moving option back to individual options
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="h-full flex flex-col bg-gray-900">
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white font-bold text-2xl flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span>Configuration Manager</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                Organize your configurator options with intuitive drag-and-drop
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCreateOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Group</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Individual Options Panel */}
          <div className="w-1/2 border-r border-gray-700 flex flex-col">
            <div className="bg-gray-750 p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold text-lg flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Individual Options</span>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                  {ungroupedOptions.length}
                </span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Standalone options not assigned to any group
              </p>
            </div>
            
            <div className="flex-1 overflow-auto">
              <IndividualOptionsPanel
                options={ungroupedOptions}
                onEditOption={onEditOption}
                onDeleteOption={onDeleteOption}
              />
            </div>
          </div>

          {/* Groups Panel */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-750 p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold text-lg flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-purple-400" />
                <span>Groups</span>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                  {groups.length}
                </span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Organized collections of related options
              </p>
            </div>
            
            <div className="flex-1 overflow-auto">
              <GroupsPanel
                groups={groupedOptions}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroupExpansion}
                onEditOption={onEditOption}
                onEditGroup={onEditGroup}
                onDeleteOption={onDeleteOption}
                onDeleteGroup={onDeleteGroup}
              />
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeItem && (
            <DragOverlayComponent
              item={activeItem}
              type={activeType}
            />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default ConfigurationInterface;