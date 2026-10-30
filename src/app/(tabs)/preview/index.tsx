import { Button, Form, HStack, Image, Picker, ScrollView, Section, Spacer, Text, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel, background, buttonStyle, foregroundStyle, frame, listRowInsets, onTapGesture, padding,
  pickerStyle, shapes, strokeBorder, tag,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { avatarFor, type Category, type Item } from '@/data';
import { fmt, isReady, statusLabel, useApp } from '@/store';
import { C } from '@/theme';
import { Figure, Garment, RN, Row, Screen, f, sub } from '@/ui';

const CATS = ['Tops', 'Bottoms', 'Shoes'] as const;

export default function Preview() {
  const { items, item, preview, setPreview, upNext } = useApp();
  const [cat, setCat] = useState<Category>('Tops');
  const slot = CATS.indexOf(cat);
  // What you're wearing leads the strip; pinned on focus so tapping a tile doesn't reshuffle it under your finger.
  const live = useRef(preview);
  useEffect(() => { live.current = preview; }, [preview]);
  const [pin, setPin] = useState(preview);
  useFocusEffect(useCallback(() => setPin(live.current), []));
  const rank = (i: Item) => (i.id === pin[slot] ? -1 : Number(!isReady(i)));
  const options = items.filter((i) => i.category === cat).sort((a, b) => rank(a) - rank(b));
  const wearing = item(preview[slot]);
  const ready = options.filter(isReady).length;
  const day = fmt(upNext.date, { weekday: 'long' });

  const choose = (id: string) => setPreview(preview.map((p, n) => (n === slot ? id : p)));

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Preview',
          unstable_headerRightItems: () => [
            { type: 'button', label: 'Old drips', icon: { type: 'sfSymbol', name: 'clock' }, onPress: () => router.push('/preview/old-drips') },
          ],
        }}
      />
      <Form>
        {/* Save sits in the stage's top-left corner, 10pt in, as in the Figma. */}
        <Section modifiers={[listRowInsets({ top: 10, leading: 10, bottom: 10, trailing: 10 })]}>
          <ZStack alignment="topLeading">
            <HStack modifiers={[frame({ maxWidth: Infinity }), frame({ height: 300 })]}>
              <Spacer />
              <RN><Figure src={avatarFor(preview)} height={270} /></RN>
              <Spacer />
            </HStack>
            <Button onPress={() => router.push({ pathname: '/save-look', params: { pieces: preview.join(','), name: 'Your outfit', date: upNext.date } })}
              modifiers={[buttonStyle('plain'), accessibilityLabel('Save look')]}>
              <HStack spacing={6} modifiers={[padding({ horizontal: 12 }), frame({ height: 32 }), background(C.fill, shapes.capsule())]}>
                <Image systemName="bookmark" size={14} color={C.label} />
                <Text modifiers={[f('subheadline', 'semibold'), foregroundStyle(C.label)]}>Save</Text>
              </HStack>
            </Button>
          </ZStack>
        </Section>

        <Section footer={<Text modifiers={sub}>{`Wearing the ${wearing.name.toLowerCase()} · ${ready} of ${options.length} ready to wear`}</Text>}>
          <Picker selection={cat} onSelectionChange={setCat} modifiers={[pickerStyle('segmented')]}>
            {CATS.map((c) => <Text key={c} modifiers={[tag(c)]}>{c}</Text>)}
          </Picker>
          <ScrollView axes="horizontal" showsIndicators={false}>
            <HStack spacing={8} modifiers={[padding({ vertical: 4 })]}>
              {options.map((o) => {
                const on = o.id === preview[slot];
                return (
                  <ZStack key={o.id} alignment="topTrailing"
                    modifiers={[
                      frame({ width: 66, height: 64 }),
                      background(C.bg, shapes.roundedRectangle({ cornerRadius: 14, roundedCornerStyle: 'continuous' })),
                      strokeBorder({ color: on ? C.blue : 'clear', style: { lineWidth: 2.5 }, shape: 'roundedRectangle', cornerRadius: 14 }),
                      onTapGesture(() => choose(o.id)),
                      accessibilityLabel(isReady(o) ? o.name : `${o.name}, ${statusLabel(o)}`),
                    ]}>
                    <HStack modifiers={[frame({ width: 66, height: 64 })]}><RN><Garment id={o.id} size={40} /></RN></HStack>
                    {!isReady(o) && (
                      <Image systemName={o.issue ? 'exclamationmark.triangle.fill' : o.wash ? 'drop.fill' : 'flame.fill'} size={10} color={C.warn}
                        modifiers={[frame({ width: 20, height: 20 }), background(C.warnSoft, shapes.circle()), padding({ all: 3 })]} />
                    )}
                  </ZStack>
                );
              })}
            </HStack>
          </ScrollView>
        </Section>

        <Section>
          <Row title="Not sure? Ask the stylist" subtitle={`“Is this OK for ${day}?”`} icon="sparkles" chevron onPress={() => router.push('/ask-stylist')} />
        </Section>
      </Form>
    </Screen>
  );
}
