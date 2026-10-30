import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { DRIPS } from '@/data';
import { useApp } from '@/store';
import { Button, Caption, Card, Figure, GarmentThumb, Group, Row, s } from '@/ui';

export default function DripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { item, liked, setLiked, setPreview } = useApp();
  const d = DRIPS.find((x) => x.id === id)!;
  const on = !!liked[d.id];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen
        options={{
          title: d.name,
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [
            { type: 'button', label: on ? 'Unlike' : 'Like', icon: { type: 'sfSymbol', name: on ? 'heart.fill' : 'heart' }, onPress: () => setLiked((l) => ({ ...l, [d.id]: !on })) },
          ],
        }}
      />
      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Figure src={d.avatar} height={280} />
      </Card>
      <Caption>Pieces</Caption>
      <Group>
        {d.pieces.map((p) => (
          <Row key={p} title={item(p).name} subtitle={item(p).category.slice(0, -1)} left={<GarmentThumb id={p} />} chevron onPress={() => router.push(`/item/${p}`)} />
        ))}
      </Group>
      <Caption>Details</Caption>
      <Group>
        <Row title="Last worn" value={d.date} />
        <Row title="Event" value={d.event} />
        <Row title="Dress code" value={d.tag} />
      </Group>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Button title="Open in Preview" kind="gray" style={{ flex: 1 }} onPress={() => { setPreview(d.pieces); router.navigate('/preview'); }} />
        <Button title="Wear again" icon="calendar" style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/save-look', params: { pieces: d.pieces.join(','), name: d.name } })} />
      </View>
    </ScrollView>
  );
}
