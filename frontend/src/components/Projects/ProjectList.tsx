import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../services/projectService';
import ProjectCard from './ProjectCard';
import ProjectListSkeleton from './ProjectListSkeleton';
import EmptyProjectState from './EmptyProjectState';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  view: 'grid' | 'list';
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showCreateButton?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading,
  view,
  onEdit,
  onDelete,
  emptyStateTitle = "No projects yet",
  emptyStateDescription = "Create your first project to get started with project management.",
  showCreateButton = true
}) => {
  // Loading state
  if (loading) {
    return <ProjectListSkeleton view={view} />;
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <EmptyProjectState
        title={emptyStateTitle}
        description={emptyStateDescription}
        showCreateButton={showCreateButton}
      />
    );
  }

  // Container classes based on view
  const containerClasses = view === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={containerClasses}
    >
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: Math.min(index * 0.1, 0.3) // Cap the delay to avoid too much staggering
          }}
        >
          <ProjectCard
            project={project}
            view={view}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectList;
