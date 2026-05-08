import { create } from 'zustand';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  activeCampaign: Campaign | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalPending: number;
  };
  updateStats: (stats: AppState['stats']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeCampaign: null,
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),
  stats: {
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalPending: 0,
  },
  updateStats: (stats) => set({ stats }),
}));
