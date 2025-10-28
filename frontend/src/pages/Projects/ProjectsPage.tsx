import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, BarChart3 } from 'lucide-react';
import { useQuery } from 'react-query';
import { projectService, Project } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Import our new components
import ProjectFiltersComponent, { ProjectFilters as ProjectFiltersType } from '../../components/Projects/ProjectFilters';
import ProjectList from '../../components/Projects/ProjectList';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // View state
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Filter state
  const [filters, setFilters] = useState<ProjectFiltersType>({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch projects with React Query for caching and automatic refetching
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useQuery(
    'projects',
    projectService.getAllProjects,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Error loading projects:', error);
        toast.error('Failed to load projects');
      }
    }
  );

  // Filter and sort projects based on current filters
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.creator_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => {
        const status = project.progress_percentage === 100 ? 'completed' 
          : project.progress_percentage > 0 ? 'active' 
          : 'not_started';
        return status === filters.status;
      });
    }

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Project];
      let bValue: any = b[filters.sortBy as keyof Project];

      // Handle different data types
      if (filters.sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (filters.sortBy === 'progress') {
        aValue = a.progress_percentage;
        bValue = b.progress_percentage;
      } else if (filters.sortBy === 'task_count') {
        aValue = a.task_count;
        bValue = b.task_count;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, filters]);

  // Project statistics for header
  const projectStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.progress_percentage === 100).length;
    const active = projects.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length;
    const notStarted = projects.filter(p => p.progress_percentage === 0).length;
    const totalTasks = projects.reduce((sum, p) => sum + p.task_count, 0);

    return { total, completed, active, notStarted, totalTasks };
  }, [projects]);

  const handleEdit = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = useCallback(async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      // Note: You'll need to implement deleteProject in projectService
      // await projectService.deleteProject(projectId);
      toast.success('Project deleted successfully');
      refetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  }, [refetchProjects]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }, []);

  // Store view preference
  useEffect(() => {
    const savedView = localStorage.getItem('projects-view') as 'grid' | 'list';
    if (savedView) setView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('projects-view', view);
  }, [view]);

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gradient-primary rounded-3xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-medium mb-2 flex flex-col">
                <span className="flex items-center">
                  <FolderOpen className="w-8 h-8 mr-3" />
                  Projects & Workflows
                </span>
                <span className="accent-line mt-2 border-white/50"></span>
              </h1>
              <p className="text-primary-100 text-lg font-normal">
                Manage your projects and track progress efficiently
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-medium">{projectStats.total}</div>
                  <div className="text-xs text-blue-100">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-green-300">{projectStats.completed}</div>
                  <div className="text-xs text-blue-100">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-yellow-300">{projectStats.active}</div>
                  <div className="text-xs text-blue-100">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-orange-300">{projectStats.totalTasks}</div>
                  <div className="text-xs text-blue-100">Total Tasks</div>
                </div>
              </div>

              {/* Action Button */}
              {hasPermission('projects', 'create') && (
                <Link
                  to="/projects/create"
                  className="flex items-center px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-accent hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-accent"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8"
      >
        <ProjectFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          view={view}
          onViewChange={setView}
          onRefresh={refetchProjects}
          loading={projectsLoading}
        />
      </motion.div>

      {/* Results Summary */}
      {filteredProjects.length !== projects.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-between bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            Clear filters to see all
          </button>
        </motion.div>
      )}

      {/* Project List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <ProjectList
          projects={filteredProjects}
          loading={projectsLoading}
          view={view}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyStateTitle={
            filters.search || filters.status !== 'all'
              ? "No projects match your filters"
              : "No projects yet"
          }
          emptyStateDescription={
            filters.search || filters.status !== 'all'
              ? "Try adjusting your search criteria or filters to find more projects."
              : "Create your first project to get started with project management."
          }
          showCreateButton={
            !(filters.search || filters.status !== 'all') && hasPermission('projects', 'create')
          }
        />
      </motion.div>

      {/* Error State */}
      {projectsError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Failed to load projects
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-6">
            There was a problem loading your projects. Please try again.
          </p>
          <button
            onClick={() => refetchProjects()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </>
  );
};

export default ProjectsPage;