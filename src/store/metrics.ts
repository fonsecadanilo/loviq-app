import { create } from 'zustand';

export type CampaignMetric = {
  sales: number;
  orders: number;
  clicks: number;
  minutesSpent: number;
};

type MetricsState = {
  metricsById: Record<string, CampaignMetric>;
  initCampaignMetrics: (id: string, initial: CampaignMetric) => void;
  recordClick: (id: string) => void;
  recordOrder: (id: string, amount: number) => void;
  addMinutes: (id: string, minutes: number) => void;
};

const STORAGE_KEY = 'loviq_metrics';

const readStorage = (): Record<string, CampaignMetric> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as Record<string, CampaignMetric>;
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, CampaignMetric>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const useCampaignMetrics = create<MetricsState>((set, get) => ({
  metricsById: readStorage(),
  initCampaignMetrics: (id, initial) => {
    const current = get().metricsById;
    if (current[id]) return;
    const next = { ...current, [id]: initial };
    writeStorage(next);
    set({ metricsById: next });
  },
  recordClick: (id) => {
    const current = get().metricsById;
    const cm = current[id] ?? { sales: 0, orders: 0, clicks: 0, minutesSpent: 0 };
    const next = { ...current, [id]: { ...cm, clicks: cm.clicks + 1 } };
    writeStorage(next);
    set({ metricsById: next });
  },
  recordOrder: (id, amount) => {
    const current = get().metricsById;
    const cm = current[id] ?? { sales: 0, orders: 0, clicks: 0, minutesSpent: 0 };
    const next = { ...current, [id]: { ...cm, sales: cm.sales + amount, orders: cm.orders + 1 } };
    writeStorage(next);
    set({ metricsById: next });
  },
  addMinutes: (id, minutes) => {
    const current = get().metricsById;
    const cm = current[id] ?? { sales: 0, orders: 0, clicks: 0, minutesSpent: 0 };
    const next = { ...current, [id]: { ...cm, minutesSpent: cm.minutesSpent + minutes } };
    writeStorage(next);
    set({ metricsById: next });
  },
}));