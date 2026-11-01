import { Button, Form, HStack, Section, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, labelStyle, lineLimit } from '@expo/ui/swift-ui/modifiers';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { TODAY } from '@/data';
import { MonthGrid, addMonths, monthOf, monthTitle } from '@/month';
import { eve, fmt, shortDay, useApp } from '@/store';
import { Garment, RN, Row, Sheet, f, sub } from '@/ui';

export default function SaveLook() {
  const { pieces, name, date } = useLocalSearchParams<{ pieces: string; name: string; date?: string }>();
  const { events, setEvents, item } = useApp();
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
    const night = prep.length ? ` ${fmt(eve(day), { weekday: 'long' })} night to ${prep.map((p) => `${p.wash ? 'wash' : 'iron'} your ${p.name.toLowerCase()}`).join(' and ')}, and` : '';
    Alert.alert(replacing ? 'Outfit updated' : 'Outfit saved', `${shortDay(day)} · ${target}\n\nWe’ll remind you${night} ${fmt(day, { weekday: 'long' })} morning.`, [
      { text: 'View in Calendar', onPress: () => router.navigate(`/calendar/day/${day}`) },
      { text: 'Done', style: 'cancel' },
    ]);
  };

  return (
    <Sheet title="Save Look" cancel={{ label: 'Cancel', onPress: () => router.back() }}
      confirm={{ label: chosen?.outfit ? 'Replace' : 'Save', onPress: save }}>
      <Form>
        <Section>
          <HStack spacing={10}>
            <RN><View style={{ flexDirection: 'row' }}>{ids.map((id) => <Garment key={id} id={id} size={30} />)}</View></RN>
            <VStack alignment="leading" spacing={2}>
              <Text modifiers={[f('subheadline', 'semibold')]}>{name}</Text>
              <Text modifiers={[...sub, lineLimit(2)]}>{ids.map((id, n) => (n ? item(id).name.toLowerCase() : item(id).name)).join(', ')}</Text>
            </VStack>
          </HStack>
        </Section>

        <Section header={
          <HStack spacing={20}>
            <Text>{monthTitle(month)}</Text>
            <Button label="Previous month" systemImage="chevron.left" onPress={() => setMonth(addMonths(month, -1))} modifiers={[labelStyle('iconOnly'), buttonStyle('borderless')]} />
            <Button label="Next month" systemImage="chevron.right" onPress={() => setMonth(addMonths(month, 1))} modifiers={[labelStyle('iconOnly'), buttonStyle('borderless')]} />
          </HStack>
        }>
          <RN fill><MonthGrid month={month} selected={day} onSelect={pick} /></RN>
        </Section>

        <Section title={`Events on ${fmt(day, { weekday: 'short', day: 'numeric', month: 'short' })}`}
          footer={onDay.length ? undefined : <Text modifiers={sub}>No events. We’ll save it as your outfit for the day.</Text>}>
          {onDay.map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${e.time} · ${e.dressCode}${e.outfit ? ' · replaces its outfit' : ''}`} check={e.id === eventId} onPress={() => setEventId(e.id)} />
          ))}
        </Section>
      </Form>
    </Sheet>
  );
}
