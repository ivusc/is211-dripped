import { Form, HStack, Image, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { foregroundStyle, frame } from '@expo/ui/swift-ui/modifiers';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { DECK, avatarFor } from '@/data';
import { isReady, useApp } from '@/store';
import { C } from '@/theme';
import { Actions, CTA, Figure, RN, Row, Screen, f, sub } from '@/ui';

// Closest piece you own, for pieces you don't own or can't wear. ponytail: fixed table for Caleb's scenario; real matching needs colour/kind scoring.
const SWAP: Record<string, string> = { 'white-shirt': 'light-blue-shirt', 'dark-derbies': 'brown-boots' };

export default function Recreate() {
  const { deck } = useLocalSearchParams<{ deck: string }>();
  const { item, owns, setPreview, upNext } = useApp();
  const look = DECK.find((d) => d.id === deck) ?? DECK[0];
  const [loading, setLoading] = useState(true);
  const swap = (p: string) => (!owns(p) || !isReady(item(p))) && SWAP[p];
  const mine = look.pieces.map((p) => swap(p) || p);
  const yours = avatarFor(mine);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Recreate', headerLargeTitleEnabled: false }} />
        <VStack spacing={10}>
          <ProgressView />
          <Text modifiers={[f('headline')]}>Matching your wardrobe…</Text>
          <Text modifiers={sub}>Looking for the closest pieces you own</Text>
        </VStack>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Your version', headerLargeTitleEnabled: false }} />
      <Form>
        <Section>
          <HStack spacing={10}>
            {([['Inspiration', look.avatar], ['Your version', yours]] as const).map(([label, src]) => (
              <VStack key={label} spacing={6} modifiers={[frame({ maxWidth: Infinity })]}>
                <Text modifiers={[f('caption', 'semibold'), foregroundStyle(label === 'Your version' ? C.blue : C.secondary)]}>{label.toUpperCase()}</Text>
                <RN><Figure src={src} height={210} /></RN>
              </VStack>
            ))}
          </HStack>
        </Section>
        <Section title="How we matched it">
          {look.pieces.map((p, i) => {
            const swapped = mine[i] !== p;
            return (
              <Row key={p} title={item(mine[i]).name} thumb={mine[i]}
                subtitle={!swapped ? 'Exact match from your wardrobe'
                  : owns(p) ? `Instead of your ${item(p).name.toLowerCase()} (${item(p).issue?.toLowerCase() ?? 'not ready'})`
                  : `Closest match to the ${item(p).name.toLowerCase()}`}
                right={<Image systemName={swapped ? 'arrow.triangle.swap' : 'checkmark.circle.fill'} color={swapped ? C.warn : C.ok} />} />
            );
          })}
        </Section>
        <Actions>
          <CTA label="Save to an event" icon="calendar"
            onPress={() => router.push({ pathname: '/save-look', params: { pieces: mine.join(','), name: `${look.name} (your version)`, date: upNext.date } })} />
          <CTA label="Try in Preview" kind="gray" onPress={() => { setPreview(mine); router.navigate('/preview'); }} />
        </Actions>
      </Form>
    </Screen>
  );
}
