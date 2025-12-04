// src/store/useFilterStore.ts
import { create } from "zustand";

type FilterStore = {
    daysRange: number;
    setDaysRange: (days: number) => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
    daysRange: 7,
    setDaysRange: (days) => set({ daysRange: days }),
}));
