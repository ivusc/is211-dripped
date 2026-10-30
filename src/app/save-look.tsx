import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TODAY } from '@/data';
import { MonthGrid, addMonths, monthOf, monthTitle } from '@/month';
import { eve, fmt, shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { Button, Caption, Card, Garment, Group, IconButton, Row, Txt, s } from '@/ui';

export default function SaveLook() {
  const { pieces, name, date } = useLocalSearchParams<{ pieces: string; name: string; date?: string }>();
  const { events, setEvents, item } = useApp();
  const insets = useSafeAreaInsets();
  const ids = pieces.split(',');
  const [day, setDay] = useState(date ?? TODAY);
  const [month, setMonth] = useState(monthOf(day));
  const onDay = events.filter((e) => e.date === day);
  const [eventId, setEventId] = useState<string | undefined>(onDay.find((e) => !e.optional)?.id ?? onDay[0]?.id);
  const chosen = onDay.find((e) => e.id === eventId);

  const pick = (d: string) => {
    setDay(d);
    const evs = events.filter((e) => e.date === d);
    setEventId(evs.find((e) => !e.optional)?.id ?? evs[0]?.id);
  };

  const save = () => {
    const target = chosen?.title ?? 'Outfit for the day';
    const replacing = !!chosen?.outfit;
    setEvents((es) =>
      chosen
        ? es.map((e) => (e.id === chosen.id ? { ...e, outfit: ids } : e))
        : [...es, { id: `day-${day}`, title: 'Outfit for the day', date: day, time: 'All day', dressCode: 'Any', outfit: ids }],
    );
    router.back();
    const prep = ids.map(item).filter((p) => p.wash || p.iron);
    const night = prep.length ? `on ${fmt(eve(day), { weekday: 'long' })} night to ${prep.map((p) => `${p.wash ? 'wash' : 'iron'} your ${p.name.toLowerCase()}`).join(' and ')}, and ` : '';
    Alert.alert(replacing ? 'Outfit updated' : 'Saved', `${name} is saved to ${shortDay(day)} · ${target}. We’ll remind you ${night}on ${fmt(day, { weekday: 'long' })} morning that your outfit is ready.`, [
      { text: 'View in Calendar', onPress: () => router.navigate(`/calendar/day/${day}`) },
      { text: 'Done', style: 'cancel' },
    ]);
  };

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom + 8 }}>
      {/* Header lives inside the ScrollView: a formSheet lays its ScrollView over any sibling above it. */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={s.rowBetween}>
          <Pressable onPress={() => router.back()} hitSlop={8}><Txt c={C.blue}>Cancel</Txt></Pressable>
          <Txt v="headline">Save look</Txt>
          <View style={{ width: 52 }} />
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            {ids.map((id) => <Garment key={id} id={id} size={30} />)}
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="subheadBold">{name}</Txt>
            <Txt v="footnote" c={C.secondary} numberOfLines={1}>{ids.map((id) => item(id).name).join(', ')}</Txt>
          </View>
        </Card>
        <Card style={{ gap: 8 }}>
          <View style={s.rowBetween}>
            <Txt v="headline">{monthTitle(month)}</Txt>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <IconButton name="chevron.left" label="Previous month" size={30} bg="transparent" color={C.blue} onPress={() => setMonth(addMonths(month, -1))} />
              <IconButton name="chevron.right" label="Next month" size={30} bg="transparent" color={C.blue} onPress={() => setMonth(addMonths(month, 1))} />
            </View>
          </View>
          <MonthGrid month={month} selected={day} onSelect={pick} />
        </Card>
        <Caption>{`Events on ${fmt(day, { weekday: 'short', day: 'numeric', month: 'short' })}`}</Caption>
        {onDay.length ? (
          <Group>
            {onDay.map((e) => (
              <Row key={e.id} title={e.title} subtitle={`${e.time} · ${e.dressCode}${e.outfit ? ' · replaces its outfit' : ''}`} check={e.id === eventId} onPress={() => setEventId(e.id)} />
            ))}
          </Group>
        ) : (
          <Txt v="footnote" c={C.secondary} style={{ marginLeft: 16 }}>No events. We’ll save it as your outfit for the day.</Txt>
        )}
      </ScrollView>
      <Button title={`${chosen?.outfit ? 'Replace outfit on' : 'Save to'} ${shortDay(day)}`} onPress={save} style={{ marginHorizontal: 16 }} />
    </View>
  );
}
