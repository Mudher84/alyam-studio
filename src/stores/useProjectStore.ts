import { create } from 'zustand';
import { Project } from '../types';
import { projectService } from '../lib/services/projects';
import { activityLogService } from '../lib/services/activity';
import { auth } from '../lib/firebase';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchPublishedProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getAll();
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPublishedProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getPublished();
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const id = await projectService.create(projectData);
      const newProject: Project = {
        ...projectData,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      set({ projects: [newProject, ...get().projects], loading: false });
      
      activityLogService.logAction(
        auth.currentUser?.uid || 'unknown',
        'project_created',
        `Created project: ${projectData.title}`,
        'project',
        id,
        projectData.title
      );
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ loading: true, error: null });
    try {
      await projectService.update(id, projectData);
      
      const existingProject = get().projects.find(p => p.id === id);
      const wasPublished = existingProject?.status !== 'published' && projectData.status === 'published';
      const title = projectData.title || existingProject?.title;
      
      set({
        projects: get().projects.map(p => 
          p.id === id ? { ...p, ...projectData, updatedAt: Date.now() } : p
        ),
        loading: false
      });
      
      activityLogService.logAction(
        auth.currentUser?.uid || 'unknown',
        wasPublished ? 'project_published' : 'project_updated',
        wasPublished ? `Published project: ${title}` : `Updated project: ${title}`,
        'project',
        id,
        title
      );
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const existingProject = get().projects.find(p => p.id === id);
      await projectService.delete(id);
      set({
        projects: get().projects.filter(p => p.id !== id),
        loading: false
      });
      
      activityLogService.logAction(
        auth.currentUser?.uid || 'unknown',
        'project_deleted',
        `Deleted project: ${existingProject?.title || id}`,
        'project',
        id,
        existingProject?.title
      );
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
