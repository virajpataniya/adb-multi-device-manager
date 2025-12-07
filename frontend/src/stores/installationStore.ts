import { create } from 'zustand';
import { InstallProgress } from '../types';

interface InstallationStore {
  installations: Map<string, InstallProgress>;
  
  setInstallProgress: (deviceId: string, progress: InstallProgress) => void;
  clearInstallation: (deviceId: string) => void;
  getInstallProgress: (deviceId: string) => InstallProgress | undefined;
}

export const useInstallationStore = create<InstallationStore>((set, get) => ({
  installations: new Map(),

  setInstallProgress: (deviceId, progress) => set((state) => {
    const newInstallations = new Map(state.installations);
    newInstallations.set(deviceId, progress);
    return { installations: newInstallations };
  }),

  clearInstallation: (deviceId) => set((state) => {
    const newInstallations = new Map(state.installations);
    newInstallations.delete(deviceId);
    return { installations: newInstallations };
  }),

  getInstallProgress: (deviceId) => {
    return get().installations.get(deviceId);
  }
}));
