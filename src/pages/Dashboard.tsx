import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Grid3X3, List } from 'lucide-react';
import ProjectCard from '../components/dashboard/ProjectCard';
import ProjectEditModal from '../components/dashboard/ProjectEditModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { EmptyState, ThemeToggle } from '../components/ui';

interface Project {
  id: string;
  name: string;
  description?: string;
  model: string;
  optionsCount: number;
  lastModified: Date;
  thumbnail?: string;
}

interface DashboardProps {
  onConfigureProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onConfigureProject }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'sample-1',
      name: 'Sample Configurator',
      description: 'A sample 3D product configurator',
      model: 'https://cdn.shopify.com/3d/models/o/a7af059c00ea3c69/angle-3d-generated.glb',
      optionsCount: 3,
      lastModified: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = useCallback(() => {
    setEditingProject(null);
    setShowProjectModal(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  }, []);

  const handleSaveProject = useCallback((projectData: Omit<Project, 'id' | 'optionsCount' | 'lastModified'>) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...projectData, lastModified: new Date() }
          : p
      ));
    } else {
      // Create new project
      const newProject: Project = {
        ...projectData,
        id: `project_${Date.now()}`,
        optionsCount: 0,
        lastModified: new Date()
      };
      setProjects(prev => [...prev, newProject]);
    }
    setEditingProject(null);
    setShowProjectModal(false);
  }, [editingProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setDeletingProjectId(projectId);
    setShowDeleteConfirmation(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingProjectId) {
      setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
      setDeletingProjectId(null);
    }
    setShowDeleteConfirmation(false);
  }, [deletingProjectId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white font-bold text-2xl">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage your 3D configurator projects</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={handleCreateProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search and View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          searchTerm ? (
            <EmptyState
              icon={Search}
              title="No projects found"
              description={`No projects match "${searchTerm}"`}
            />
          ) : (
            <EmptyState
              icon={Plus}
              title="No projects yet"
              description="Create your first 3D configurator project"
              action={{
                label: 'Create Project',
                onClick: handleCreateProject
              }}
            />
          )
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onConfigure={onConfigureProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectEditModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        isEditing={!!editingProject}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;