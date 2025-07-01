import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { 
  GripVertical,
  Edit,
  Trash2,
  Layers,
  List,
  Grid3X3,
  Zap
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';

interface DragDropOptionProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
}

const DragDropOption: React.FC<DragDropOptionProps> = ({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'option',
    item: () => ({ 
      id: option.id, 
      index, 
      type: 'option'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'option',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dragDropRef = drag(drop(ref));

  const hasConditionalLogic = option.conditionalLogic?.enabled;

  return (
    <div ref={dragDropRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.5 : 1, 
          y: 0,
          scale: isDragging ? 1.02 : 1,
          rotate: isDragging ? 2 : 0,
          zIndex: isDragging ? 50 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
          rotate: { duration: 0.2 }
        }}
        className={`bg-gray-800 p-5 rounded-xl border transition-all duration-200 relative ${
          isDragging 
            ? 'border-blue-500 shadow-2xl shadow-blue-500/20 cursor-grabbing' 
            : isOver
            ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600 shadow-sm'
        }`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: isDragging ? 'rotate(2deg) scale(1.02)' : undefined,
          boxShadow: isDragging ? '0 25px 50px -12px rgba(59, 130, 246, 0.25)' : undefined
        }}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700 transition-colors">
              <GripVertical className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-semibold text-lg">{option.name}</h4>
                {hasConditionalLogic && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                    Conditional Logic
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-gray-400 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span className="capitalize font-medium">{option.manipulationType}</span>
                </p>
                <span className="text-gray-600">•</span>
                <p className="text-gray-400 text-sm flex items-center space-x-2">
                  {option.displayType === 'list' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  <span className="capitalize font-medium">{option.displayType}</span>
                </p>
                {option.defaultBehavior && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      option.defaultBehavior === 'hide' 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-gray-400 text-sm font-medium">{option.values.length} values</span>
              <p className="text-gray-500 text-xs">{option.targetComponents.length} targets</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditConditionalLogic(option)}
                className={`p-2 rounded-lg transition-colors ${
                  hasConditionalLogic
                    ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
                }`}
                title="Edit Conditional Logic"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(option)}
                className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                title="Edit Option"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(option.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Option"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DragDropOption;