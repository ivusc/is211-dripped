import { Button, Form, HStack, Image, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { background, buttonStyle, foregroundStyle, frame, labelStyle, lineLimit, shapes } from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { TODAY } from '@/data';
import { MonthGrid, addMonths, monthOf, monthTitle } from '@/month';
import { fmt, parse, useApp, ymd } from '@/store';
import { C } from '@/theme';
import { Pill, RN, Screen, f, sub, tertiary } from '@/ui';

export default function Calendar() {
  const { events, items } = useApp();
  const [month, setMonth] = useState(monthOf(TODAY));
  const laundry = items.filter((i) => i.wash || i.iron).length;
  const weekEnd = parse(TODAY);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const week = events.filter((e) => e.date >= TODAY && e.date <= ymd(weekEnd)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: monthTitle(month),
          unstable_headerRightItems: () => [
            { type: 'button', label: `Laundry ${laundry}`, icon: { type: 'sfSymbol', name: 'washer' }, onPress: () => router.push('/calendar/laundry') },
            { type: 'button', label: 'New event', icon: { type: 'sfSymbol', name: 'plus' }, onPress: () => router.push({ pathname: '/new-event', params: { date: TODAY } }) },
          ],
        }}
      />
      <Form>
        <Section
          header={
            <HStack>
              <Button label="Today" onPress={() => setMonth(monthOf(TODAY))} />
              <Spacer />
              <HStack spacing={20}>
                <Button label="Previous month" systemImage="chevron.left" onPress={() => setMonth(addMonths(month, -1))} modifiers={[labelStyle('iconOnly'), buttonStyle('borderless')]} />
                <Button label="Next month" systemImage="chevron.right" onPress={() => setMonth(addMonths(month, 1))} modifiers={[labelStyle('iconOnly'), buttonStyle('borderless')]} />
              </HStack>
            </HStack>
          }
          footer={
            <VStack alignment="leading" spacing={4}>
              <HStack spacing={16}>
                <Legend color={C.blue} label="Outfit planned" />
                <Legend color="#F08A00" label="Needs an outfit" />
              </HStack>
              <Text modifiers={sub}>Synced with your iPhone calendar</Text>
            </VStack>
          }>
          <RN fill><MonthGrid month={month} selected={TODAY} onSelect={(d) => router.push(`/calendar/day/${d}`)} /></RN>
        </Section>

        <Section title="This week">
          {week.map((e) => (
            <Button key={e.id} onPress={() => router.push(`/calendar/day/${e.date}`)} modifiers={[buttonStyle('plain')]}>
              <HStack spacing={12}>
                <VStack spacing={0} modifiers={[frame({ width: 46, height: 50 }), background(C.bg, shapes.roundedRectangle({ cornerRadius: 10, roundedCornerStyle: 'continuous' }))]}>
                  <Text modifiers={[f('caption2', 'semibold'), foregroundStyle(e.date === TODAY ? C.blue : C.red)]}>{fmt(e.date, { weekday: 'short' }).toUpperCase()}</Text>
                  <Text modifiers={[f('title3', 'semibold')]}>{`${parse(e.date).getDate()}`}</Text>
                </VStack>
                <VStack alignment="leading" spacing={3}>
                  <Text>{e.title}</Text>
                  <Text modifiers={[...sub, lineLimit(1)]}>{`${e.time} · ${e.dressCode}`}</Text>
                  {e.optional ? <Pill label="Optional" /> : <Pill label={e.outfit ? 'Outfit planned' : 'Needs an outfit'} tone={e.outfit ? 'blue' : 'warn'} />}
                </VStack>
                <Spacer />
                <Image systemName="chevron.right" modifiers={[f('footnote', 'semibold'), tertiary]} />
              </HStack>
            </Button>
          ))}
        </Section>
      </Form>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <HStack spacing={5}>
      <Image systemName="circle.fill" size={7} color={color} />
      <Text modifiers={sub}>{label}</Text>
    </HStack>
  );
}
