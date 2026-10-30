import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { TODAY } from '@/data';
import { MonthGrid, addMonths, monthOf, monthTitle } from '@/month';
import { parse, shortDay, useApp, ymd } from '@/store';
import { C } from '@/theme';
import { Button, Caption, Card, Group, IconButton, Pill, Row, Txt, s } from '@/ui';

export default function Calendar() {
  const { events, items } = useApp();
  const [month, setMonth] = useState(monthOf(TODAY));
  const laundry = items.filter((i) => i.wash || i.iron).length;
  const weekEnd = parse(TODAY);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const week = events.filter((e) => e.date >= TODAY && e.date <= ymd(weekEnd)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen
        options={{
          title: monthTitle(month),
          unstable_headerRightItems: () => [
            { type: 'button', label: `Laundry ${laundry}`, icon: { type: 'sfSymbol', name: 'washer' }, onPress: () => router.push('/calendar/laundry') },
            { type: 'button', label: 'New event', icon: { type: 'sfSymbol', name: 'plus' }, onPress: () => router.push({ pathname: '/new-event', params: { date: TODAY } }) },
          ],
        }}
      />
      <Card style={{ gap: 8 }}>
        <View style={s.rowBetween}>
          <Button title="Today" kind="plain" small onPress={() => setMonth(monthOf(TODAY))} style={{ paddingHorizontal: 0 }} />
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <IconButton name="chevron.left" label="Previous month" size={30} bg="transparent" color={C.blue} onPress={() => setMonth(addMonths(month, -1))} />
            <IconButton name="chevron.right" label="Next month" size={30} bg="transparent" color={C.blue} onPress={() => setMonth(addMonths(month, 1))} />
          </View>
        </View>
        <MonthGrid month={month} selected={TODAY} onSelect={(d) => router.push(`/calendar/day/${d}`)} />
        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', paddingTop: 4 }}>
          <Legend color={C.blue} label="Outfit planned" />
          <Legend color="#F08A00" label="Needs an outfit" />
        </View>
      </Card>

      <Txt v="footnote" c={C.secondary} style={{ textAlign: 'center' }}>Synced with your iPhone calendar</Txt>

      <Caption>This week</Caption>
      <Group>
        {week.map((e) => (
          <Row key={e.id} title={e.title} subtitle={`${shortDay(e.date)} · ${e.time}`} chevron onPress={() => router.push(`/calendar/day/${e.date}`)}
            right={e.optional ? <Pill label="Optional" /> : <Pill label={e.outfit ? 'Outfit planned' : 'No outfit'} tone={e.outfit ? 'blue' : 'warn'} />} />
        ))}
      </Group>
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <Txt v="caption" c={C.secondary}>{label}</Txt>
    </View>
  );
}
