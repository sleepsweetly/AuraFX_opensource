import { Layer, Element } from './index';

export interface EffectSession {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  layers: Layer[];
  settings: {
    skillName: string;
    frameMode: string;
    manualFrameCount: number;
    optimize: boolean;
  };
  modes: Record<string, boolean>;
  modeSettings: Record<string, any>;
  actionRecords: any[];
  canvasImage?: string;
  isActive: boolean;
  version: string;
}

export interface EffectProject {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  sessions: EffectSession[];
  version: string;
  exportFormat: 'mythicmobs' | 'custom';
}

export interface EffectListState {
  projects: EffectProject[];
  currentProjectId: string | null;
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface EffectExportData {
  projectName: string;
  projectDescription?: string;
  sessions: EffectSession[];
  exportFormat: 'mythicmobs' | 'custom';
  exportedAt: Date;
  version: string;
}
