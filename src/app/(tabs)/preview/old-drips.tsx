import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { DRIPS } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { Chip, Figure, Icon, Segmented, Txt, s } from '@/ui';

const TAGS = ['All', 'Formal', 'Smart casual', 'Casual'];

export default function OldDrips() {
  const { liked } = useApp();
  const [tab, setTab] = useState<'Worn' | 'Liked'>('Worn');
  const [tag, setTag] = useState('All');
  const shown = DRIPS.filter((d) => (tab === 'Worn' || liked[d.id]) && (tag === 'All' || d.tag === tag));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen options={{ title: 'Old drips' }} />
      <Segmented options={['Worn', 'Liked'] as const} value={tab} onChange={setTab} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TAGS.map((t) => <Chip key={t} label={t} on={t === tag} onPress={() => setTag(t)} />)}
      </ScrollView>
      {shown.length === 0 && <Txt c={C.secondary} style={{ textAlign: 'center', marginTop: 40 }}>Nothing here yet.</Txt>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {shown.map((d) => (
          <Link key={d.id} href={`/preview/drip/${d.id}`} asChild>
            <Pressable style={({ pressed }) => [s.card, { width: '47%', flexGrow: 1, gap: 6, opacity: pressed ? 0.7 : 1 }]}>
              <View style={{ alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 8 }}>
                <Figure src={d.avatar} height={170} />
                {liked[d.id] && <View style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="heart.fill" color={C.red} size={15} /></View>}
              </View>
              <Txt v="subheadBold" numberOfLines={1}>{d.name}</Txt>
              <Txt v="footnote" c={C.secondary}>{d.short} · {d.tag}</Txt>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
