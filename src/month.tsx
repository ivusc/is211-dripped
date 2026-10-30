import { Pressable, View } from 'react-native';

import { TODAY } from './data';
import { parse, useApp, ymd } from './store';
import { C } from './theme';
import { Txt } from './ui';

// Mon-first month grid with event dots: blue = outfit planned, orange = needs an outfit.
export function MonthGrid({ month, selected, onSelect }: { month: Date; selected?: string; onSelect: (d: string) => void }) {
  const { events } = useApp();
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, n) => {
    const d = new Date(start);
    d.setDate(start.getDate() + n);
    return d;
  });
  const weeks = Array.from({ length: days[35].getMonth() === month.getMonth() ? 6 : 5 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  const dot = (d: string) => {
    const evs = events.filter((e) => e.date === d && !e.optional);
    if (!evs.length) return undefined;
    return evs.every((e) => e.outfit) ? C.blue : '#F08A00';
  };

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => (
          <Txt key={i} v="caption" c={C.tertiary} style={{ flex: 1, textAlign: 'center' }}>{l}</Txt>
        ))}
      </View>
      {weeks.map((w, wi) => (
        <View key={wi} style={{ flexDirection: 'row' }}>
          {w.map((d) => {
            const key = ymd(d);
            const inMonth = d.getMonth() === month.getMonth();
            const isSel = key === selected;
            const isToday = key === TODAY;
            const color = dot(key);
            return (
              <Pressable key={key} onPress={() => onSelect(key)} style={{ flex: 1, alignItems: 'center', height: 44 }}
                accessibilityLabel={parse(key).toDateString()} accessibilityState={{ selected: isSel }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSel ? C.blue : isToday ? C.blueSoft : 'transparent' }}>
                  <Txt v={isSel || isToday ? 'headline' : 'body'} c={isSel ? '#fff' : isToday ? C.blue : inMonth ? C.label : C.tertiary}>{d.getDate()}</Txt>
                </View>
                <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: color ?? 'transparent' }} />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const monthTitle = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
export const monthOf = (d: string) => {
  const p = parse(d);
  return new Date(p.getFullYear(), p.getMonth(), 1);
};
