import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

import { CATALOG, SEED_EVENTS, SEED_ITEMS, TODAY, type Event, type Item } from './data';

export type Toast = { message: string; undo?: () => void } | null;
export type Body = {
  mode: 'plain' | 'scan' | 'measure';
  shape: 'Slim' | 'Standard' | 'Broad';
  m: Record<'Height' | 'Chest' | 'Waist' | 'Hips' | 'Shoulders' | 'Inside leg', number>;
};
export type Filters = { q?: string; category?: Item['category']; wash: boolean; iron: boolean; occasion?: string };

// ponytail: in-memory state only — swap for AsyncStorage / a backend once real accounts exist.
function useAppState() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [setup, setSetup] = useState(true); // first run: body measurements, then scan clothes
  const [items, setItems] = useState(SEED_ITEMS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [preview, setPreview] = useState<string[]>(['navy-polo', 'black-pants', 'black-leather-shoes']);
  const [filters, setFilters] = useState<Filters>({ wash: false, iron: false });
  const [liked, setLiked] = useState<Record<string, boolean>>({ wedding: true, dinner: true });
  const [body, setBody] = useState<Body>({
    mode: 'plain',
    shape: 'Standard',
    m: { Height: 175, Chest: 96, Waist: 80, Hips: 94, Shoulders: 45, 'Inside leg': 79 },
  });
  const [toast, setToast] = useState<Toast>(null);
  const [reminder, setReminder] = useState<{ e: Event; night?: boolean }>(); // pretend notifications (night before, morning of), for testing
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (message: string, undo?: () => void) => {
    clearTimeout(timer.current);
    setToast({ message, undo });
    timer.current = setTimeout(() => setToast(null), 4000);
  };

  // Looks can name pieces Caleb doesn't own (yet), so fall back to the catalogue.
  const item = (id: string) => items.find((i) => i.id === id) ?? CATALOG.find((i) => i.id === id)!;
  const owns = (id: string) => items.some((i) => i.id === id);
  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  // Snapshot + restore keeps every undo a one-liner.
  const withUndo = (message: string, change: () => void) => {
    const before = { items, events };
    change();
    showToast(message, () => {
      setItems(before.items);
      setEvents(before.events);
      setToast(null);
    });
  };

  const plannedFor = (id: string) =>
    events.find((e) => e.date >= TODAY && e.outfit?.includes(id));

  // The soonest event with a dress code: what the stylist, Preview and saves default to.
  const upNext = events.filter((e) => e.date >= TODAY && !e.optional).sort((a, b) => a.date.localeCompare(b.date))[0] ?? events[0];

  return {
    loggedIn, setLoggedIn, setup, setSetup,
    items, item, owns, updateItem, setItems,
    events, setEvents,
    preview, setPreview,
    filters, setFilters,
    liked, setLiked,
    body, setBody,
    toast, setToast, showToast, withUndo,
    reminder, setReminder,
    plannedFor, upNext,
  };
}

type App = ReturnType<typeof useAppState>;
const Ctx = createContext<App | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useAppState()}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx)!;

export const isReady = (i: Item) => !i.wash && !i.iron && !i.issue;
export const matches = (i: Item, f: Filters) =>
  (!f.q || i.name.toLowerCase().includes(f.q.toLowerCase())) &&
  (!f.category || i.category === f.category) && (!f.wash || i.wash) && (!f.iron || i.iron) &&
  (!f.occasion || i.tags.includes(f.occasion));

export function statusLabel(i: Item) {
  if (i.issue) return i.issue;
  if (i.wash) return 'Needs washing';
  if (i.iron) return 'Needs ironing';
  return 'Ready';
}

// Dates are local YYYY-MM-DD strings; build them without time zones.
export const parse = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fmt = (d: string, o: Intl.DateTimeFormatOptions) => parse(d).toLocaleDateString('en-GB', o);
export const eve = (d: string) => {
  const x = parse(d);
  x.setDate(x.getDate() - 1);
  return ymd(x);
};
export const shortDay = (d: string) => fmt(d, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
