import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { useApp, type Body } from '@/store';
import { C, T } from '@/theme';
import { Button, Group, IconButton, Segmented, Txt, s } from '@/ui';

type Key = keyof Body['m'];
const KEYS: Key[] = ['Height', 'Chest', 'Waist', 'Hips', 'Shoulders', 'Inside leg'];

export default function Measurements() {
  const { body, setBody, showToast } = useApp();
  const [m, setM] = useState(body.m);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const show = (cm: number) => (unit === 'cm' ? String(cm) : (cm / 2.54).toFixed(1));
  const step = (k: Key, d: number) => setM({ ...m, [k]: Math.max(1, m[k] + d) });

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad} keyboardDismissMode="interactive">
      <Stack.Screen options={{ title: 'Measurements', headerLargeTitleEnabled: false }} />
      <Segmented options={['cm', 'in'] as const} value={unit} onChange={setUnit} />
      <Group>
        {KEYS.map((k) => (
          <View key={k} style={s.row}>
            <Txt style={{ flex: 1 }}>{k}</Txt>
            {k === 'Height' && unit === 'cm' ? (
              <TextInput value={String(m.Height)} keyboardType="number-pad" accessibilityLabel="Height in cm" selectTextOnFocus
                onChangeText={(t) => setM({ ...m, Height: Number(t.replace(/\D/g, '')) || 0 })}
                style={{ ...T.body, color: C.blue, minWidth: 48, textAlign: 'right' }} />
            ) : (
              <Txt c={C.secondary} style={{ minWidth: 48, textAlign: 'right' }}>{show(m[k])}</Txt>
            )}
            <Txt c={C.secondary}>{unit}</Txt>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <IconButton name="minus" label={`Decrease ${k}`} size={30} onPress={() => step(k, -1)} />
              <IconButton name="plus" label={`Increase ${k}`} size={30} onPress={() => step(k, 1)} />
            </View>
          </View>
        ))}
      </Group>
      <Txt v="footnote" c={C.secondary} style={{ marginHorizontal: 16 }}>Measure over light clothing. Rough numbers are fine; the stylist only uses them for fit.</Txt>
      <Button title="Save measurements" onPress={() => { setBody({ ...body, m, mode: 'measure' }); showToast('Measurements saved'); router.back(); }} />
    </ScrollView>
  );
}
