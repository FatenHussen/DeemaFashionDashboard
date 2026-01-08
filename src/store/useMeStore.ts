import { create } from 'zustand';

// ----------------------------------------------------------------------

interface MeState {
  organizationId: number | null;
  setOrganizationId: (organizationId: number | null) => void;
}

// ----------------------------------------------------------------------

export const useMeStore = create<MeState>((set) => ({
  organizationId: null,
  setOrganizationId: (organizationId) => set({ organizationId }),
}));

