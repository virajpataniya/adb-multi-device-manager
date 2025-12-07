import { create } from 'zustand';
import { Notification } from '../types';

interface UIStore {
  activeView: 'devices' | 'console';
  notifications: Notification[];
  loading: boolean;
  
  setActiveView: (view: 'devices' | 'console') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'devices',
  notifications: [],
  loading: false,

  setActiveView: (view) => set({ activeView: view }),

  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      { ...notification, id: Date.now().toString() }
    ]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  setLoading: (loading) => set({ loading })
}));
