import { create } from 'zustand';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
}

interface UIState {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),
  accessibility: {
    highContrast: false,
    largeText: false,
  },
  setAccessibility: (settings: Partial<AccessibilitySettings>) => 
    set((state) => ({
      accessibility: { ...state.accessibility, ...settings }
    })),
}));
