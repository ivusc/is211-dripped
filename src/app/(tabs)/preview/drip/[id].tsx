import { Form, HStack, Section, Spacer } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { DRIPS } from '@/data';
import { useApp } from '@/store';
import { Actions, CTA, Figure, RN, Row, Screen } from '@/ui';

export default function DripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { item, liked, setLiked, setPreview } = useApp();
  const d = DRIPS.find((x) => x.id === id)!;
  const on = !!liked[d.id];

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: d.name,
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [
            { type: 'button', label: on ? 'Unlike' : 'Like', icon: { type: 'sfSymbol', name: on ? 'heart.fill' : 'heart' }, onPress: () => setLiked((l) => ({ ...l, [d.id]: !on })) },
          ],
        }}
      />
      <Form>
        <Section>
          <HStack modifiers={[frame({ height: 310 })]}><Spacer /><RN><Figure src={d.avatar} height={280} /></RN><Spacer /></HStack>
        </Section>
        <Section title="Pieces">
          {d.pieces.map((p) => (
            <Row key={p} title={item(p).name} subtitle={item(p).category.slice(0, -1)} thumb={p} chevron onPress={() => router.push(`/item/${p}`)} />
          ))}
        </Section>
        <Section title="Details">
          <Row title="Last worn" value={d.date} />
          <Row title="Event" value={d.event} />
          <Row title="Dress code" value={d.tag} />
        </Section>
        <Actions>
          <CTA label="Wear again" icon="calendar" onPress={() => router.push({ pathname: '/save-look', params: { pieces: d.pieces.join(','), name: d.name } })} />
          <CTA label="Open in Preview" kind="gray" onPress={() => { setPreview(d.pieces); router.navigate('/preview'); }} />
        </Actions>
      </Form>
    </Screen>
  );
}
