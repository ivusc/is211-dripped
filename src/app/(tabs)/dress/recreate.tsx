import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { DECK, avatarFor } from '@/data';
import { isReady, useApp } from '@/store';
import { C } from '@/theme';
import { Button, Caption, Card, Figure, GarmentThumb, Group, Icon, Row, Txt, s } from '@/ui';

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
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center', gap: 10 }]}>
        <Stack.Screen options={{ title: 'Recreate', headerLargeTitleEnabled: false }} />
        <ActivityIndicator size="large" color={C.blue} />
        <Txt v="headline">Matching your wardrobe…</Txt>
        <Txt v="footnote" c={C.secondary}>Looking for the closest pieces you own</Txt>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen options={{ title: 'Your version', headerLargeTitleEnabled: false }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['Inspiration', look.avatar], ['Your version', yours]].map(([label, src]) => (
          <Card key={label as string} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <Txt v="caption" c={label === 'Your version' ? C.blue : C.secondary}>{(label as string).toUpperCase()}</Txt>
            <Figure src={src as number | string} height={210} />
          </Card>
        ))}
      </View>
      <Caption>How we matched it</Caption>
      <Group>
        {look.pieces.map((p, i) => {
          const swapped = mine[i] !== p;
          return (
            <Row key={p} title={item(mine[i]).name} left={<GarmentThumb id={mine[i]} />}
              subtitle={!swapped ? 'Same as the inspiration'
                : owns(p) ? `Your ${item(p).name.toLowerCase()} is ${item(p).issue?.toLowerCase() ?? 'not ready'}, so we used this`
                : `You don’t own ${item(p).name.toLowerCase()}, so we picked the closest you own`}
              right={<Icon name={swapped ? 'arrow.triangle.swap' : 'checkmark.circle.fill'} color={swapped ? C.warn : C.ok} />} />
          );
        })}
      </Group>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Button title="Try in Preview" kind="gray" style={{ flex: 1 }} onPress={() => { setPreview(mine); router.navigate('/preview'); }} />
        <Button title="Save to an event" icon="calendar" style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/save-look', params: { pieces: mine.join(','), name: `${look.name} (your version)`, date: upNext.date } })} />
      </View>
    </ScrollView>
  );
}
