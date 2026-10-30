import { Button, ContentUnavailableView, Form, HStack, Image, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel, background, buttonStyle, foregroundStyle, frame, lineLimit, multilineTextAlignment, onTapGesture, padding, shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { eve, fmt, parse, statusLabel, useApp, ymd } from '@/store';
import { C } from '@/theme';
import { CTA, GarmentThumb, Pill, RN, Screen, Txt, f, secondary, sub } from '@/ui';

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
    <Screen>
      <Stack.Screen
        options={{
          title: fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }),
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [
            { type: 'button', label: 'New event', icon: { type: 'sfSymbol', name: 'plus' }, onPress: () => router.push({ pathname: '/new-event', params: { date } }) },
          ],
        }}
      />
      <Form>
        <Section>
          <RN fill>
            <View style={{ flexDirection: 'row' }}>
              {week.map((w) => {
                const on = w === date;
                const has = events.some((e) => e.date === w && !e.optional);
                return (
                  <Pressable key={w} onPress={() => router.setParams({ date: w })} accessibilityState={{ selected: on }} accessibilityLabel={fmt(w, { weekday: 'long', day: 'numeric', month: 'long' })}
                    style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 12, borderCurve: 'continuous', backgroundColor: on ? C.blue : 'transparent' }}>
                    <Txt v="caption" c={on ? '#fff' : C.secondary}>{fmt(w, { weekday: 'short' }).slice(0, 3)}</Txt>
                    <Txt v="headline" c={on ? '#fff' : C.label}>{parse(w).getDate()}</Txt>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: has ? (on ? '#fff' : C.blue) : 'transparent' }} />
                  </Pressable>
                );
              })}
            </View>
          </RN>
        </Section>

        {!onDay.length && (
          <ContentUnavailableView title="Nothing planned" systemImage="calendar.badge.plus" description="Add an event and the stylist will pick a look for it."
            actions={<Button label="New event" onPress={() => router.push({ pathname: '/new-event', params: { date } })} modifiers={[buttonStyle('bordered')]} />} />
        )}

        {onDay.map((e) => {
          const pieces = e.outfit?.map(item).filter(Boolean) ?? [];
          const dirty = pieces.filter((p) => p.wash || p.iron);
          const reminders = [
            dirty.length > 0 && { night: true, label: `9:00 PM on ${fmt(eve(e.date), { weekday: 'long' })}` },
            { night: false, label: `7:30 AM on ${fmt(e.date, { weekday: 'long' })}` },
          ].filter((r) => !!r);
          return (
            <Section key={e.id}>
              <HStack alignment="top">
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[f('headline')]}>{e.title}</Text>
                  <Text modifiers={sub}>{`${e.time}${e.location ? ` · ${e.location}` : ''}`}</Text>
                  {e.synced && <Text modifiers={[f('caption'), foregroundStyle({ type: 'hierarchical', style: 'tertiary' })]}>From your iPhone calendar</Text>}
                </VStack>
                <Spacer />
                <Pill label={e.optional ? 'Optional' : e.dressCode} tone={e.optional ? 'grey' : 'blue'} />
              </HStack>

              {pieces.length ? (
                <>
                  <HStack spacing={8} alignment="top">
                    {pieces.map((p) => (
                      <VStack key={p.id} spacing={6} modifiers={[frame({ maxWidth: Infinity }), onTapGesture(() => router.push(`/item/${p.id}`)),
                        accessibilityLabel(p.wash || p.iron ? `${p.name}, ${statusLabel(p)}` : p.name)]}>
                        <RN><GarmentThumb id={p.id} size={64} /></RN>
                        <Text modifiers={[f('caption'), secondary, lineLimit(2), multilineTextAlignment('center')]}>{p.name}</Text>
                      </VStack>
                    ))}
                  </HStack>
                  {dirty.length > 0 && (
                    <Button onPress={() => router.push('/calendar/laundry')} modifiers={[buttonStyle('plain')]}>
                      <HStack spacing={8} modifiers={[padding({ all: 10 }), background(C.warnSoft, shapes.roundedRectangle({ cornerRadius: 12, roundedCornerStyle: 'continuous' }))]}>
                        <Image systemName="exclamationmark.triangle.fill" color={C.warn} size={15} />
                        <Text modifiers={[f('footnote'), foregroundStyle(C.warn)]}>
                          {`${dirty.map((p) => p.name).join(', ').replace(/, (?=[^,]*$)/, ' and ')} ${dirty.length > 1 ? 'need' : 'needs'} attention before ${fmt(e.date, { weekday: 'long' })}.`}
                        </Text>
                        <Spacer />
                        <Image systemName="chevron.right" color={C.warn} size={12} />
                      </HStack>
                    </Button>
                  )}
                  {reminders.map((r) => (
                    <HStack key={r.label} spacing={6}>
                      <Image systemName={r.night ? 'moon' : 'bell'} modifiers={sub} />
                      <Text modifiers={sub}>{`Reminder at ${r.label}`}</Text>
                      <Spacer />
                      <Button label="Preview" onPress={() => setReminder({ e, night: r.night })} modifiers={[buttonStyle('borderless'), f('footnote', 'semibold')]} />
                    </HStack>
                  ))}
                  <HStack spacing={10}>
                    <CTA label="Edit outfit" kind="gray"
                      onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `New outfit for ${e.title}`, event: e.id } })} />
                    <CTA label="Remove" kind="destructive" onPress={() => remove(e.id, e.title)} />
                  </HStack>
                </>
              ) : (
                <>
                  <Text modifiers={sub}>{e.optional ? 'No dress code. Wear whatever you like.' : 'No outfit yet.'}</Text>
                  <CTA label="Choose outfit" icon="sparkles"
                    onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `Outfit for ${e.title} · ${e.dressCode}`, event: e.id } })} />
                  <Button label="Find a look in Down to Dress" onPress={() => router.navigate('/dress')} />
                </>
              )}
            </Section>
          );
        })}
      </Form>
    </Screen>
  );
}
