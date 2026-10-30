import { Link, Stack, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isReady, matches, shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { Chip, Garment, IconButton, Pill, Txt, s } from '@/ui';

const PREVIEW_COUNT = 6;
const COLS = 3;

export default function Wardrobe() {
  const { items, filters, setFilters, plannedFor, withUndo, updateItem, setItems } = useApp();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const shown = items.filter((i) => matches(i, filters));
  const sections = [
    { title: 'Ready to wear', data: shown.filter(isReady) },
    { title: 'Needs attention', data: shown.filter((i) => !isReady(i)), count: true },
  ];
  const active = [
    filters.q && { label: `“${filters.q}”`, clear: { q: undefined } },
    filters.category && { label: filters.category, clear: { category: undefined } },
    filters.wash && { label: 'Needs washing', clear: { wash: false } },
    filters.iron && { label: 'Needs ironing', clear: { iron: false } },
    filters.occasion && { label: filters.occasion, clear: { occasion: undefined } },
  ].filter((x) => !!x);

  return (
    // Wrapped in a View: the native stack insets a root ScrollView for its (hidden) large title.
    <View style={s.screen}>
    <ScrollView contentContainerStyle={[s.pad, { paddingTop: insets.top + 6 }]}>
      <Stack.Screen options={{ title: 'Wardrobe', headerShown: false }} />
      <View style={[s.rowBetween, { alignItems: 'flex-end' }]}>
        <View style={{ gap: 2 }}>
          <Txt v="largeTitle" accessibilityRole="header">Wardrobe</Txt>
          <Txt v="subhead" c={C.secondary}>{items.length} items · {items.filter(isReady).length} ready to wear</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ borderRadius: 22, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
            <IconButton name="line.3.horizontal.decrease" label="Filter" size={44} bg={C.blue} color="#fff" onPress={() => router.push('/filters')} />
          </View>
          <View style={{ borderRadius: 22, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
            <IconButton name="plus" label="Add item" size={44} bg={C.blue} color="#fff" onPress={() => router.push('/add-item')} />
          </View>
        </View>
      </View>
      {active.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {active.map((a) => <Chip key={a.label} label={`${a.label}  ✕`} on onPress={() => setFilters({ ...filters, ...a.clear })} />)}
        </ScrollView>
      )}
      {!shown.length && <Txt c={C.secondary} style={{ textAlign: 'center', marginTop: 40 }}>No clothes match.</Txt>}

      {sections.filter((sec) => sec.data.length).map((sec) => {
        const all = open[sec.title];
        const data = all ? sec.data : sec.data.slice(0, PREVIEW_COUNT);
        return (
          <View key={sec.title} style={{ gap: 10 }}>
            <View style={s.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Txt v="title3" accessibilityRole="header">{sec.title}</Txt>
                {sec.count && (
                  <View style={{ backgroundColor: C.warnSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Txt v="footnoteBold" c={C.warn}>{data.length} of {sec.data.length}</Txt>
                  </View>
                )}
              </View>
              {sec.data.length > PREVIEW_COUNT && (
                <Pressable onPress={() => setOpen({ ...open, [sec.title]: !all })} hitSlop={8}>
                  <Txt v="subhead" c={C.blue}>{all ? 'Show less' : `See all ${sec.data.length}`}</Txt>
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
              {data.map((i) => {
                const plan = plannedFor(i.id);
                const status = i.issue ?? (i.wash ? 'Wash' : i.iron ? 'Iron' : undefined);
                return (
                  <View key={i.id} style={{ width: '31.6%' }}>
                  <Link href={`/item/${i.id}`} asChild>
                    <Link.Trigger>
                      {/* asChild keeps the card a block (a bare Link renders inline Text); its Slot rejects style arrays, so spread. */}
                      <Pressable accessibilityLabel={[i.name, status, plan && `planned ${shortDay(plan.date)}`].filter(Boolean).join(', ')}
                        style={{ ...s.card, padding: 0, height: 124, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                        <Garment id={i.id} size={58} />
                        {plan && <View style={{ position: 'absolute', top: 6, left: 6 }}><Pill label={shortDay(plan.date).replace(/ \w+$/, '')} tone="blue" icon="calendar" /></View>}
                        {status && <View style={{ position: 'absolute', bottom: 6, left: 6 }}><Pill label={status} tone="warn" /></View>}
                      </Pressable>
                    </Link.Trigger>
                    <Link.Menu>
                      {i.wash && <Link.MenuAction title="Mark as washed" icon="drop" onPress={() => withUndo(`${i.name} marked as washed`, () => updateItem(i.id, { wash: false }))} />}
                      {i.iron && <Link.MenuAction title="Mark as ironed" icon="flame" onPress={() => withUndo(`${i.name} marked as ironed`, () => updateItem(i.id, { iron: false }))} />}
                      <Link.MenuAction title="Style a look with this" icon="sparkles"
                        onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `Style a look with my ${i.name.toLowerCase()}` } })} />
                      <Link.MenuAction title="Remove" icon="trash" destructive
                        onPress={() => withUndo(`${i.name} removed`, () => setItems((xs) => xs.filter((x) => x.id !== i.id)))} />
                    </Link.Menu>
                  </Link>
                  </View>
                );
              })}
              {/* Fillers keep a short last row left-aligned under space-between. */}
              {Array.from({ length: (COLS - (data.length % COLS)) % COLS }, (_, n) => <View key={n} style={{ width: '31.6%' }} />)}
            </View>
          </View>
        );
      })}
    </ScrollView>
    </View>
  );
}
