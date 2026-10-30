import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { eve, parse, fmt, statusLabel, useApp, ymd } from '@/store';
import { C } from '@/theme';
import { Button, Card, GarmentThumb, Icon, Pill, Txt, s } from '@/ui';

export default function Day() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { events, setEvents, item, withUndo, setReminder } = useApp();
  const d = parse(date);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, n) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + n);
    return ymd(x);
  });
  const onDay = events.filter((e) => e.date === date);

  const remove = (id: string, title: string) =>
    Alert.alert('Remove this outfit?', `${title} will have no outfit planned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => withUndo('Outfit removed', () => setEvents((es) => es.map((e) => (e.id === id ? { ...e, outfit: undefined } : e)))) },
    ]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen options={{ title: fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }), headerLargeTitleEnabled: false }} />
      <View style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 6 }}>
        {week.map((w) => {
          const on = w === date;
          const has = events.some((e) => e.date === w && !e.optional);
          return (
            <Pressable key={w} onPress={() => router.setParams({ date: w })} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 10, backgroundColor: on ? C.blue : 'transparent' }}>
              <Txt v="caption" c={on ? '#fff' : C.secondary}>{fmt(w, { weekday: 'short' }).slice(0, 3)}</Txt>
              <Txt v="headline" c={on ? '#fff' : C.label}>{parse(w).getDate()}</Txt>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: has ? (on ? '#fff' : C.blue) : 'transparent' }} />
            </Pressable>
          );
        })}
      </View>

      {!onDay.length && (
        <View style={{ alignItems: 'center', gap: 10, marginTop: 40 }}>
          <Icon name="calendar.badge.plus" size={40} color={C.tertiary} />
          <Txt c={C.secondary}>Nothing planned</Txt>
          <Button title="New event" kind="tinted" small onPress={() => router.push({ pathname: '/new-event', params: { date } })} />
        </View>
      )}

      {onDay.map((e) => {
        const pieces = e.outfit?.map(item).filter(Boolean) ?? [];
        const dirty = pieces.filter((p) => p.wash || p.iron);
        return (
          <Card key={e.id} style={{ gap: 10 }}>
            <View style={s.rowBetween}>
              <View style={{ flex: 1 }}>
                <Txt v="headline">{e.title}</Txt>
                <Txt v="footnote" c={C.secondary}>{e.time}{e.location ? ` · ${e.location}` : ''}</Txt>
                {e.synced && <Txt v="caption" c={C.tertiary}>From your iPhone calendar</Txt>}
              </View>
              <Pill label={e.optional ? 'Optional' : e.dressCode} tone={e.optional ? 'grey' : 'blue'} />
            </View>
            {pieces.length ? (
              <>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {pieces.map((p) => (
                    <Pressable key={p.id} onPress={() => router.push(`/item/${p.id}`)} style={{ flex: 1, gap: 4, alignItems: 'center' }}>
                      <GarmentThumb id={p.id} size={64} />
                      <Txt v="caption" numberOfLines={1}>{p.name}</Txt>
                      {(p.wash || p.iron) && <Txt v="caption" c={C.warn}>{statusLabel(p)}</Txt>}
                    </Pressable>
                  ))}
                </View>
                {dirty.length > 0 && (
                  <Pressable onPress={() => router.push('/calendar/laundry')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.warnSoft, borderRadius: 12, padding: 10 }}>
                    <Icon name="exclamationmark.triangle.fill" color={C.warn} size={15} />
                    <Txt v="footnote" c={C.warn} style={{ flex: 1 }}>{dirty.map((p) => p.name).join(', ').replace(/, (?=[^,]*$)/, ' and ')} {dirty.length > 1 ? 'need' : 'needs'} attention before {fmt(e.date, { weekday: 'long' })}.</Txt>
                    <Icon name="chevron.right" color={C.warn} size={12} />
                  </Pressable>
                )}
                {[
                  dirty.length > 0 && { night: true, label: `9:00 PM on ${fmt(eve(e.date), { weekday: 'long' })}` },
                  { night: false, label: `7:30 AM on ${fmt(e.date, { weekday: 'long' })}` },
                ].filter((r) => !!r).map((r) => (
                  <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name={r.night ? 'moon' : 'bell'} size={13} color={C.secondary} />
                    <Txt v="footnote" c={C.secondary} style={{ flex: 1 }}>Reminder at {r.label}</Txt>
                    <Pressable onPress={() => setReminder({ e, night: r.night })} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Preview the ${r.label} reminder`}>
                      <Txt v="footnoteBold" c={C.blue}>Preview</Txt>
                    </Pressable>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Edit outfit" kind="gray" small style={{ flex: 1 }}
                    onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `New outfit for ${e.title}`, event: e.id } })} />
                  <Button title="Remove" kind="destructive" small style={{ flex: 1 }} onPress={() => remove(e.id, e.title)} />
                </View>
              </>
            ) : (
              <>
                <Txt v="footnote" c={C.secondary}>{e.optional ? 'No dress code. Wear whatever you like.' : 'No outfit yet.'}</Txt>
                <Button title="Choose outfit" icon="sparkles" small
                  onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `Outfit for ${e.title} · ${e.dressCode}`, event: e.id } })} />
                <Button title="Find a look in Down to Dress" kind="plain" small onPress={() => router.navigate('/dress')} />
              </>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}
