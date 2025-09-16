import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import type { EffectSession, EffectProject, EffectListState, EffectExportData } from "@/types/effect-session";
import type { Layer } from "@/types";

interface EffectSessionStore extends EffectListState {
  // Actions
  createNewProject: (name: string, description?: string) => string;
  createNewSession: (projectId: string, name: string, description?: string) => string;
  deleteProject: (projectId: string) => void;
  deleteSession: (projectId: string, sessionId: string) => void;
  updateProject: (projectId: string, updates: Partial<EffectProject>) => void;
  updateSession: (projectId: string, sessionId: string, updates: Partial<EffectSession>) => void;
  
  // Session Management
  setActiveSession: (projectId: string, sessionId: string) => void;
  getCurrentSession: () => EffectSession | null;
  getCurrentProject: () => EffectProject | null;
  
  // Data Management
  updateSessionData: (projectId: string, sessionId: string, data: {
    layers?: Layer[];
    settings?: any;
    modes?: Record<string, boolean>;
    modeSettings?: Record<string, any>;
    actionRecords?: any[];
    canvasImage?: string;
  }) => void;
  
  // Import/Export
  exportProject: (projectId: string) => EffectExportData;
  exportAllProjects: () => EffectExportData;
  importProject: (data: EffectExportData) => string;
  exportToFile: (projectId: string) => string;
  importFromFile: (fileContent: string) => string;
  
  // Local Storage
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  
  // Utility
  duplicateSession: (projectId: string, sessionId: string, newName: string) => string;
  duplicateProject: (projectId: string, newName: string) => string;
}

export const useEffectSessionStore = create<EffectSessionStore>()(
  subscribeWithSelector(
    immer<EffectSessionStore>((set, get) => ({
      // Initial State
      projects: [],
      currentProjectId: null,
      currentSessionId: null,
      isLoading: false,
      error: null,

      // Actions
      createNewProject: (name: string, description?: string) => {
        const projectId = uuidv4();
        const now = new Date();
        
        const newProject: EffectProject = {
          id: projectId,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          sessions: [],
          version: "1.0.0",
          exportFormat: 'mythicmobs'
        };

        set((state) => {
          state.projects.push(newProject);
          state.currentProjectId = projectId;
          state.currentSessionId = null;
        });

        get().saveToLocalStorage();
        return projectId;
      },

      createNewSession: (projectId: string, name: string, description?: string) => {
        const sessionId = uuidv4();
        const now = new Date();
        
        const newSession: EffectSession = {
          id: sessionId,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          layers: [],
          settings: {
            skillName: "NewEffect",
            frameMode: "auto",
            manualFrameCount: 40,
            optimize: false
          },
          modes: {},
          modeSettings: {},
          actionRecords: [],
          isActive: false,
          version: "1.0.0"
        };

        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            project.sessions.push(newSession);
            project.updatedAt = now;
            state.currentProjectId = projectId;
            state.currentSessionId = sessionId;
          }
        });

        get().saveToLocalStorage();
        return sessionId;
      },

      deleteProject: (projectId: string) => {
        set((state) => {
          state.projects = state.projects.filter(p => p.id !== projectId);
          if (state.currentProjectId === projectId) {
            state.currentProjectId = null;
            state.currentSessionId = null;
          }
        });

        get().saveToLocalStorage();
      },

      deleteSession: (projectId: string, sessionId: string) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            project.sessions = project.sessions.filter(s => s.id !== sessionId);
            project.updatedAt = new Date();
            
            if (state.currentSessionId === sessionId) {
              state.currentSessionId = null;
            }
          }
        });

        get().saveToLocalStorage();
      },

      updateProject: (projectId: string, updates: Partial<EffectProject>) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            Object.assign(project, updates);
            project.updatedAt = new Date();
          }
        });

        get().saveToLocalStorage();
      },

      updateSession: (projectId: string, sessionId: string, updates: Partial<EffectSession>) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            const session = project.sessions.find(s => s.id === sessionId);
            if (session) {
              Object.assign(session, updates);
              session.updatedAt = new Date();
              project.updatedAt = new Date();
            }
          }
        });

        get().saveToLocalStorage();
      },

      // Session Management
      setActiveSession: (projectId: string, sessionId: string) => {
        set((state) => {
          // Deactivate all sessions
          state.projects.forEach(project => {
            project.sessions.forEach(session => {
              session.isActive = false;
            });
          });

          // Activate the selected session
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            const session = project.sessions.find(s => s.id === sessionId);
            if (session) {
              session.isActive = true;
              state.currentProjectId = projectId;
              state.currentSessionId = sessionId;
            }
          }
        });

        get().saveToLocalStorage();
      },

      getCurrentSession: () => {
        const state = get();
        if (!state.currentProjectId || !state.currentSessionId) return null;
        
        const project = state.projects.find(p => p.id === state.currentProjectId);
        if (!project) return null;
        
        return project.sessions.find(s => s.id === state.currentSessionId) || null;
      },

      getCurrentProject: () => {
        const state = get();
        if (!state.currentProjectId) return null;
        
        return state.projects.find(p => p.id === state.currentProjectId) || null;
      },

      // Data Management
      updateSessionData: (projectId: string, sessionId: string, data) => {
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            const session = project.sessions.find(s => s.id === sessionId);
            if (session) {
              if (data.layers) session.layers = data.layers;
              if (data.settings) session.settings = { ...session.settings, ...data.settings };
              if (data.modes) session.modes = { ...session.modes, ...data.modes };
              if (data.modeSettings) session.modeSettings = { ...session.modeSettings, ...data.modeSettings };
              if (data.actionRecords) session.actionRecords = data.actionRecords;
              if (data.canvasImage !== undefined) session.canvasImage = data.canvasImage;
              
              session.updatedAt = new Date();
              project.updatedAt = new Date();
            }
          }
        });

        get().saveToLocalStorage();
      },

      // Import/Export
      exportProject: (projectId: string) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) throw new Error("Project not found");

        return {
          projectName: project.name,
          projectDescription: project.description,
          sessions: project.sessions,
          exportFormat: project.exportFormat,
          exportedAt: new Date(),
          version: project.version
        };
      },

      exportAllProjects: () => {
        const state = get();
        return {
          projectName: "All AuraFX Projects",
          projectDescription: "Complete export of all AuraFX projects",
          sessions: state.projects.flatMap(p => p.sessions),
          exportFormat: 'mythicmobs' as const,
          exportedAt: new Date(),
          version: "1.0.0"
        };
      },

      importProject: (data: EffectExportData) => {
        const projectId = uuidv4();
        const now = new Date();
        
        const newProject: EffectProject = {
          id: projectId,
          name: data.projectName,
          description: data.projectDescription,
          createdAt: now,
          updatedAt: now,
          sessions: data.sessions.map(session => ({
            ...session,
            id: uuidv4(), // Generate new ID to avoid conflicts
            isActive: false
          })),
          version: data.version,
          exportFormat: data.exportFormat
        };

        set((state) => {
          state.projects.push(newProject);
        });

        get().saveToLocalStorage();
        return projectId;
      },

      exportToFile: (projectId: string) => {
        const exportData = get().exportProject(projectId);
        return JSON.stringify(exportData, null, 2);
      },

      importFromFile: (fileContent: string) => {
        try {
          const data: EffectExportData = JSON.parse(fileContent);
          return get().importProject(data);
        } catch (error) {
          throw new Error("Invalid file format");
        }
      },

      // Local Storage
      saveToLocalStorage: () => {
        if (typeof window === 'undefined') return;
        
        const state = get();
        const dataToSave = {
          projects: state.projects,
          currentProjectId: state.currentProjectId,
          currentSessionId: state.currentSessionId,
          version: "1.0.0"
        };
        
        localStorage.setItem('aurafx-effect-sessions', JSON.stringify(dataToSave));
      },

      loadFromLocalStorage: () => {
        if (typeof window === 'undefined') return;
        
        try {
          const saved = localStorage.getItem('aurafx-effect-sessions');
          if (saved) {
            const data = JSON.parse(saved);
            set((state) => {
              state.projects = data.projects || [];
              state.currentProjectId = data.currentProjectId || null;
              state.currentSessionId = data.currentSessionId || null;
            });
          }
        } catch (error) {
          console.error("Failed to load from localStorage:", error);
        }
      },

      // Utility
      duplicateSession: (projectId: string, sessionId: string, newName: string) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) throw new Error("Project not found");
        
        const originalSession = project.sessions.find(s => s.id === sessionId);
        if (!originalSession) throw new Error("Session not found");
        
        const newSessionId = uuidv4();
        const now = new Date();
        
        const duplicatedSession: EffectSession = {
          ...originalSession,
          id: newSessionId,
          name: newName,
          createdAt: now,
          updatedAt: now,
          isActive: false
        };

        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            project.sessions.push(duplicatedSession);
            project.updatedAt = now;
          }
        });

        get().saveToLocalStorage();
        return newSessionId;
      },

      duplicateProject: (projectId: string, newName: string) => {
        const originalProject = get().projects.find(p => p.id === projectId);
        if (!originalProject) throw new Error("Project not found");
        
        const newProjectId = uuidv4();
        const now = new Date();
        
        const duplicatedProject: EffectProject = {
          ...originalProject,
          id: newProjectId,
          name: newName,
          createdAt: now,
          updatedAt: now,
          sessions: originalProject.sessions.map(session => ({
            ...session,
            id: uuidv4(),
            isActive: false
          }))
        };

        set((state) => {
          state.projects.push(duplicatedProject);
        });

        get().saveToLocalStorage();
        return newProjectId;
      }
    }))
  )
);

// Auto-load from localStorage on initialization
if (typeof window !== 'undefined') {
  useEffectSessionStore.getState().loadFromLocalStorage();
}
