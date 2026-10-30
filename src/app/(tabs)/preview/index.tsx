import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { avatarFor, type Category } from '@/data';
import { fmt, isReady, statusLabel, useApp } from '@/store';
import { C } from '@/theme';
import { Button, Card, Figure, Garment, Icon, Segmented, Txt, s } from '@/ui';

const CATS = ['Tops', 'Bottoms', 'Shoes'] as const;

export default function Preview() {
  const { items, item, preview, setPreview, upNext } = useApp();
  const [cat, setCat] = useState<Category>('Tops');
  const slot = CATS.indexOf(cat);
  const options = items.filter((i) => i.category === cat).sort((a, b) => Number(!isReady(a)) - Number(!isReady(b)));
  const wearing = item(preview[slot]);
  const ready = options.filter(isReady).length;
  const day = fmt(upNext.date, { weekday: 'long' });

  const choose = (id: string) => setPreview(preview.map((p, n) => (n === slot ? id : p)));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen
        options={{
          title: 'Preview',
          unstable_headerRightItems: () => [
            { type: 'button', label: 'Old drips', icon: { type: 'sfSymbol', name: 'clock' }, onPress: () => router.push('/preview/old-drips') },
          ],
        }}
      />
      <Card style={{ height: 320, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
        <Figure src={avatarFor(preview)} height={270} />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <Button title="Save" icon="bookmark" kind="gray" small
            onPress={() => router.push({ pathname: '/save-look', params: { pieces: preview.join(','), name: 'Preview outfit', date: upNext.date } })} />
        </View>
      </Card>

      <Segmented options={CATS} value={cat} onChange={setCat} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((o) => {
          const on = o.id === preview[slot];
          const ready = isReady(o);
          return (
            <Pressable key={o.id} onPress={() => choose(o.id)} accessibilityLabel={ready ? o.name : `${o.name}, ${statusLabel(o)}`} accessibilityState={{ selected: on }}
              style={{ width: 66, height: 64, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2.5, borderColor: on ? C.blue : 'transparent' }}>
              <Garment id={o.id} size={40} />
              {!ready && (
                <View style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: C.warnSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={o.issue ? 'exclamationmark.triangle.fill' : o.wash ? 'drop.fill' : 'flame.fill'} color={C.warn} size={11} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={s.rowBetween}>
        <Txt v="footnote" c={C.secondary}>Wearing: <Txt v="footnoteBold">{wearing.name}</Txt></Txt>
        <Txt v="footnote" c={C.secondary}>{ready} ready to wear</Txt>
      </View>

      <Pressable onPress={() => router.push('/ask-stylist')}
        style={({ pressed }) => [s.card, { flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.7 : 1, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }]}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkles" color="#fff" size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt v="subheadBold">Not sure? Ask the stylist</Txt>
          <Txt v="footnote" c={C.secondary} numberOfLines={1}>“Is this OK for {day}?”</Txt>
        </View>
        <Icon name="chevron.up" size={15} weight="semibold" />
      </Pressable>
    </ScrollView>
  );
}
