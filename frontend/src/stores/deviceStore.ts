import { create } from 'zustand';
import { Device } from '../types';

interface DeviceStore {
  devices: Device[];
  selectedDevices: string[];
  syncMode: boolean;
  
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  selectDevice: (deviceId: string) => void;
  deselectDevice: (deviceId: string) => void;
  toggleDeviceSelection: (deviceId: string) => void;
  clearSelection: () => void;
  toggleSyncMode: () => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  selectedDevices: [],
  syncMode: false,

  setDevices: (devices) => set({ devices }),

  addDevice: (device) => set((state) => {
    // Check if device already exists
    const exists = state.devices.some(d => d.id === device.id);
    if (exists) {
      // Update existing device instead of adding duplicate
      return {
        devices: state.devices.map(d => 
          d.id === device.id ? { ...d, ...device } : d
        )
      };
    }
    return {
      devices: [...state.devices, device]
    };
  }),

  removeDevice: (deviceId) => set((state) => ({
    devices: state.devices.filter(d => d.id !== deviceId),
    selectedDevices: state.selectedDevices.filter(id => id !== deviceId)
  })),

  updateDevice: (deviceId, updates) => set((state) => ({
    devices: state.devices.map(d => 
      d.id === deviceId ? { ...d, ...updates } : d
    )
  })),

  selectDevice: (deviceId) => set((state) => ({
    selectedDevices: state.selectedDevices.includes(deviceId)
      ? state.selectedDevices
      : [...state.selectedDevices, deviceId]
  })),

  deselectDevice: (deviceId) => set((state) => ({
    selectedDevices: state.selectedDevices.filter(id => id !== deviceId)
  })),

  toggleDeviceSelection: (deviceId) => set((state) => ({
    selectedDevices: state.selectedDevices.includes(deviceId)
      ? state.selectedDevices.filter(id => id !== deviceId)
      : [...state.selectedDevices, deviceId]
  })),

  clearSelection: () => set({ selectedDevices: [] }),

  toggleSyncMode: () => set((state) => ({ syncMode: !state.syncMode }))
}));
