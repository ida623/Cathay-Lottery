import { create } from 'zustand';

export type AppStep =
  | 'setup'
  | 'participants'
  | 'prizes'
  | 'shuffle'
  | 'select-card'
  | 'scratch'
  | 'result'
  | 'emails';

export interface Participant {
  id: string; // internal id
  rowId: string; // 行編
  empId: string; // 集團員編
  name: string;
  dept: string;
  unit: string;
  isWinner: boolean;
}

export interface Prize {
  id: string;
  name: string;
  item: string;
  count: number | '';
}

interface AppState {
  step: AppStep;
  activityName: string;
  participants: Participant[];
  filteredParticipants: Participant[]; // active pool
  prizes: Prize[];
  
  currentPrizeIndex: number;
  winners: Record<string, Participant[]>; // prizeId -> Participant[]
  pendingWinners: Participant[];
  
  // Actions
  setStep: (step: AppStep) => void;
  setActivityName: (name: string) => void;
  setParticipants: (participants: Participant[]) => void;
  setFilteredParticipants: (participants: Participant[]) => void;
  setPrizes: (prizes: Prize[]) => void;
  setCurrentPrizeIndex: (index: number) => void;
  setPendingWinners: (winners: Participant[]) => void;
  addWinner: (prizeId: string, participant: Participant) => void;
  resetLottery: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'setup',
  activityName: '',
  participants: [],
  filteredParticipants: [],
  prizes: [],
  
  currentPrizeIndex: 0,
  winners: {},
  pendingWinners: [],

  setStep: (step) => set({ step }),
  setActivityName: (activityName) => set({ activityName }),
  setParticipants: (participants) => set({ participants }),
  setFilteredParticipants: (filteredParticipants) => set({ filteredParticipants }),
  setPrizes: (prizes) => set({ prizes }),
  setCurrentPrizeIndex: (currentPrizeIndex) => set({ currentPrizeIndex }),
  setPendingWinners: (pendingWinners) => set({ pendingWinners }),
  addWinner: (prizeId, participant) =>
    set((state) => {
      const updatedWinners = { ...state.winners };
      if (!updatedWinners[prizeId]) {
        updatedWinners[prizeId] = [];
      }
      updatedWinners[prizeId].push(participant);
      
      // Mark as winner so they don't get drawn again
      const updatedParticipants = state.participants.map((p) =>
        p.id === participant.id ? { ...p, isWinner: true } : p
      );
      
      const updatedFiltered = state.filteredParticipants.map((p) =>
        p.id === participant.id ? { ...p, isWinner: true } : p
      );

      return { winners: updatedWinners, participants: updatedParticipants, filteredParticipants: updatedFiltered };
    }),
  resetLottery: () =>
    set({
      step: 'setup',
      activityName: '',
      participants: [],
      filteredParticipants: [],
      prizes: [],
      currentPrizeIndex: 0,
      winners: {},
      pendingWinners: [],
    }),
}));
