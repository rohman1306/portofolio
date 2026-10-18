import { create } from "zustand";
import type { LayoutItem } from "react-grid-layout";

type Layout = readonly LayoutItem[];

const defaultLayouts: Record<string, Layout> = {
  lg: [
    { i: "stats", x: 0, y: 0, w: 12, h: 3 },
    { i: "allocation", x: 0, y: 3, w: 6, h: 8 },
    { i: "goals", x: 6, y: 3, w: 6, h: 8 },
    { i: "holdings", x: 0, y: 11, w: 12, h: 9 },
  ],
  md: [
    { i: "stats", x: 0, y: 0, w: 9, h: 3 },
    { i: "allocation", x: 0, y: 3, w: 9, h: 8 },
    { i: "goals", x: 0, y: 11, w: 9, h: 8 },
    { i: "holdings", x: 0, y: 19, w: 9, h: 9 },
  ],
  sm: [
    { i: "stats", x: 0, y: 0, w: 6, h: 3 },
    { i: "allocation", x: 0, y: 3, w: 6, h: 8 },
    { i: "goals", x: 0, y: 11, w: 6, h: 8 },
    { i: "holdings", x: 0, y: 19, w: 6, h: 9 },
  ],
  xs: [
    { i: "stats", x: 0, y: 0, w: 3, h: 3 },
    { i: "allocation", x: 0, y: 3, w: 3, h: 8 },
    { i: "goals", x: 0, y: 11, w: 3, h: 8 },
    { i: "holdings", x: 0, y: 19, w: 3, h: 9 },
  ],
};

interface DashboardStore {
  layouts: Record<string, Layout>;
  isEditing: boolean;
  setLayouts: (layouts: Record<string, Layout> | Partial<Record<string, Layout>>) => void;
  toggleEditing: () => void;
  resetLayouts: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  layouts: defaultLayouts,
  isEditing: false,
  setLayouts: (newLayouts) => set({ layouts: newLayouts as Record<string, Layout> }),
  toggleEditing: () => set((s) => ({ isEditing: !s.isEditing })),
  resetLayouts: () => set({ layouts: defaultLayouts, isEditing: false }),
}));
