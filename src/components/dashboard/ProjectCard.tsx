import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar, Layers } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  model: string;
  optionsCount: number;
  lastModified: Date;
  thumbnail?: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onConfigure: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onConfigure
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden group"
    >
      {/* Thumbnail/Preview */}
      <div 
        className="h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center cursor-pointer"
        onClick={() => onConfigure(project)}
      >
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Layers className="w-12 h-12 text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 
              className="text-white font-medium text-sm truncate cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => onConfigure(project)}
            >
              {project.name}
            </h3>
            {project.description && (
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
              title="Edit Project"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span>{project.optionsCount} options</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{project.lastModified.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;