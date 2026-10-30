import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DECK } from '@/data';
import { isReady, shortDay, statusLabel, useApp } from '@/store';
import { C } from '@/theme';
import { Button, GarmentThumb, Group, Icon, IconButton, Pill, Row, Txt, s } from '@/ui';

// Bottom sheet listing the pieces of a look (Stylist 1.4 and Down to Dress 4.2).
export default function Pieces() {
  const { pieces, title, date, deck } = useLocalSearchParams<{ pieces: string; title: string; date?: string; deck?: string }>();
  const { item, owns, setPreview, liked, setLiked } = useApp();
  const insets = useSafeAreaInsets();
  const ids = pieces.split(',');
  const look = DECK.find((d) => d.id === deck);
  const ironing = ids.map(item).find((i) => i.iron);

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom + 8 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={s.rowBetween}>
          <Txt v="title2" style={{ flex: 1 }}>{title}</Txt>
          <IconButton name="xmark" label="Close" size={30} onPress={() => router.back()} />
        </View>
        <Txt v="footnote" c={C.secondary}>
          {look ? `You own ${ids.filter(owns).length} of ${ids.length} pieces.${ids.some((id) => !owns(id) || !isReady(item(id))) ? ' We’ll fill the gaps from your wardrobe.' : ''}` : `All ${ids.length} pieces are from your wardrobe`}
        </Txt>
        <Group>
          {ids.map((id) => {
            const i = item(id);
            const status = statusLabel(i);
            const mine = owns(id);
            return (
              <Row key={id} title={i.name} left={<GarmentThumb id={id} />}
                subtitle={!look ? `${i.category.slice(0, -1)} · ${i.material}`
                  : !mine ? 'You don’t own this. We’ll use your closest match'
                  : status !== 'Ready' ? `Yours is ${status.toLowerCase()}. We’ll swap in another` : 'You own this'}
                right={<Pill label={look && !mine ? 'Don’t own' : look && status === 'Ready' ? 'You own' : status} tone={mine && status === 'Ready' ? 'ok' : 'warn'}
                  icon={look && mine && status === 'Ready' ? 'checkmark' : undefined} />}
                onPress={look ? undefined : () => router.push(`/item/${id}`)} />
            );
          })}
        </Group>
        {ironing && !look && (
          <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 4 }}>
            <Icon name="bell" size={13} color={C.secondary} />
            <Txt v="footnote" c={C.secondary}>We’ll remind you the night before at 8 PM to iron the {ironing.name.toLowerCase()}.</Txt>
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}>
        {look ? (
          <>
            <Button title="Like" icon={liked[look.id] ? 'heart.fill' : 'heart'} kind="gray" onPress={() => setLiked((l) => ({ ...l, [look.id]: !l[look.id] }))} />
            <Button title="Recreate with my clothes" icon="sparkles" style={{ flex: 1 }} onPress={() => { router.back(); router.push({ pathname: '/dress/recreate', params: { deck: look.id } }); }} />
          </>
        ) : (
          <>
            <Button title="Try On" kind="gray" onPress={() => { setPreview(ids); router.back(); router.navigate('/preview'); }} />
            <Button title={date ? `Save to ${shortDay(date)}` : 'Save to a date'} icon="calendar" style={{ flex: 1 }}
              onPress={() => { router.back(); router.push({ pathname: '/save-look', params: { pieces, name: title, date } }); }} />
          </>
        )}
      </View>
    </View>
  );
}
