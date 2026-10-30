import { Button, ContentUnavailableView, ContextMenu, Form, Grid, HStack, ScrollView, Section, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel, background, buttonBorderShape, buttonStyle, controlSize, frame, headerProminence, lineLimit,
  listRowBackground, listRowInsets, onTapGesture, padding, shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

import type { Item } from '@/data';
import { isReady, matches, shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { Garment, Pill, RN, Screen, f, secondary } from '@/ui';

const PREVIEW_COUNT = 6;
const COLS = 3;

export default function Wardrobe() {
  const { items, filters, setFilters, plannedFor, withUndo, updateItem, setItems } = useApp();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const shown = items.filter((i) => matches(i, filters));
  const sections = [
    { title: 'Ready to wear', data: shown.filter(isReady) },
    { title: 'Needs attention', data: shown.filter((i) => !isReady(i)) },
  ];
  const active = [
    filters.q && { label: `“${filters.q}”`, clear: { q: undefined } },
    filters.category && { label: filters.category, clear: { category: undefined } },
    filters.wash && { label: 'Needs washing', clear: { wash: false } },
    filters.iron && { label: 'Needs ironing', clear: { iron: false } },
    filters.occasion && { label: filters.occasion, clear: { occasion: undefined } },
  ].filter((x) => !!x);

  const tile = (i: Item) => {
    const plan = plannedFor(i.id);
    const badges = [i.issue, i.wash && 'Wash', i.iron && 'Iron'].filter((b): b is string => !!b);
    const status = badges.join(', ');
    return (
      <ContextMenu key={i.id}>
        <ContextMenu.Items>
          {i.wash && <Button label="Mark as washed" systemImage="drop" onPress={() => withUndo(`${i.name} marked as washed`, () => updateItem(i.id, { wash: false }))} />}
          {i.iron && <Button label="Mark as ironed" systemImage="flame" onPress={() => withUndo(`${i.name} marked as ironed`, () => updateItem(i.id, { iron: false }))} />}
          <Button label="Style a look with this" systemImage="sparkles"
            onPress={() => router.navigate({ pathname: '/stylist/looks', params: { prompt: `Style a look with my ${i.name.toLowerCase()}` } })} />
          <Button label="Remove" systemImage="trash" role="destructive"
            onPress={() => withUndo(`${i.name} removed`, () => setItems((xs) => xs.filter((x) => x.id !== i.id)))} />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <VStack alignment="leading" spacing={6}
            modifiers={[
              frame({ maxWidth: Infinity }),
              onTapGesture(() => router.push(`/item/${i.id}`)),
              accessibilityLabel([i.name, status, plan && `planned ${shortDay(plan.date)}`].filter(Boolean).join(', ')),
            ]}>
            <ZStack alignment="topLeading"
              modifiers={[frame({ maxWidth: Infinity }), frame({ height: 112 }), background(C.card, shapes.roundedRectangle({ cornerRadius: 14, roundedCornerStyle: 'continuous' }))]}>
              <HStack modifiers={[frame({ maxWidth: Infinity }), frame({ height: 112 })]}><RN><Garment id={i.id} size={58} /></RN></HStack>
              {/* Padding goes inside the tile's frame so the badges sit 8pt in from its bottom-left corner. */}
              <VStack alignment="leading" modifiers={[padding({ all: 8 }), frame({ maxWidth: Infinity, alignment: 'leading' }), frame({ height: 112 })]}>
                {plan && <Pill label={shortDay(plan.date).replace(/ \w+$/, '')} tone="blue" icon="calendar" />}
                <Spacer />
                {badges.length > 0 && <HStack spacing={4}>{badges.map((b) => <Pill key={b} label={b} tone="warn" />)}</HStack>}
              </VStack>
            </ZStack>
            <VStack alignment="leading" spacing={0} modifiers={[padding({ horizontal: 4 })]}>
              <Text modifiers={[f('footnote', 'semibold'), lineLimit(1)]}>{i.name}</Text>
              <Text modifiers={[f('caption'), secondary, lineLimit(1)]}>{i.kind}</Text>
            </VStack>
          </VStack>
        </ContextMenu.Trigger>
      </ContextMenu>
    );
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Wardrobe',
          unstable_headerRightItems: () => [
            { type: 'button', label: 'Filter', icon: { type: 'sfSymbol', name: active.length ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease' }, onPress: () => router.push('/filters') },
            { type: 'button', label: 'Add item', icon: { type: 'sfSymbol', name: 'plus' }, onPress: () => router.push('/add-item') },
          ],
        }}
      />
      <Form>
        <Section title={`${items.length} items · ${items.filter(isReady).length} ready to wear`}
          modifiers={[listRowBackground('clear'), listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}>
          {active.length > 0 && (
            <ScrollView axes="horizontal" showsIndicators={false}>
              <HStack spacing={8}>
                {active.map((a) => (
                  <Button key={a.label} label={a.label} systemImage="xmark.circle.fill" onPress={() => setFilters({ ...filters, ...a.clear })}
                    modifiers={[buttonStyle('bordered'), buttonBorderShape('capsule'), controlSize('small'), accessibilityLabel(`Remove filter ${a.label}`)]} />
                ))}
              </HStack>
            </ScrollView>
          )}
          {!shown.length && (
            <ContentUnavailableView title="No clothes match" systemImage="line.3.horizontal.decrease.circle" description="Try removing a filter."
              actions={<Button label="Clear filters" onPress={() => setFilters({ wash: false, iron: false })} />} />
          )}
        </Section>

        {sections.filter((sec) => sec.data.length).map((sec) => {
          const all = open[sec.title];
          const data = all ? sec.data : sec.data.slice(0, PREVIEW_COUNT);
          const rows = Array.from({ length: Math.ceil(data.length / COLS) }, (_, r) => data.slice(r * COLS, r * COLS + COLS));
          return (
            <Section key={sec.title}
              modifiers={[headerProminence('increased'), listRowBackground('clear'), listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}
              header={
                <HStack>
                  <Text modifiers={[f('title3', 'bold')]}>{sec.title}</Text>
                  <Spacer />
                  {sec.data.length > PREVIEW_COUNT && (
                    <Button label={all ? 'Show less' : `See all ${sec.data.length}`} onPress={() => setOpen({ ...open, [sec.title]: !all })}
                      modifiers={[f('subheadline')]} />
                  )}
                </HStack>
              }>
              <Grid horizontalSpacing={10} verticalSpacing={10}>
                {rows.map((r) => (
                  <Grid.Row key={r[0].id}>
                    {r.map(tile)}
                    {/* Fillers keep a short last row's tiles the same width as the rest. */}
                    {Array.from({ length: COLS - r.length }, (_, n) => <Spacer key={n} modifiers={[frame({ maxWidth: Infinity })]} />)}
                  </Grid.Row>
                ))}
              </Grid>
            </Section>
          );
        })}
      </Form>
    </Screen>
  );
}
