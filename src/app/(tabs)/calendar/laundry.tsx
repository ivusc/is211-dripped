import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { Button, GarmentThumb, Group, Icon, Row, Segmented, Txt, s } from '@/ui';

export default function Laundry() {
  const { items, updateItem, setItems, withUndo, plannedFor } = useApp();
  const [tab, setTab] = useState<'wash' | 'iron'>('wash');
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const list = items.filter((i) => i[tab]);
  const verb = tab === 'wash' ? 'washed' : 'ironed';

  const markOne = (id: string, name: string) =>
    Alert.alert(`Mark ${name.toLowerCase()} as ${verb}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Mark as ${verb}`, onPress: () => withUndo(`${name} marked as ${verb}`, () => updateItem(id, { [tab]: false })) },
    ]);

  const markPicked = () =>
    Alert.alert(`Mark ${picked.length} items as ${verb}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: `Mark as ${verb}`,
        onPress: () => {
          withUndo(`${picked.length} items marked as ${verb}`, () => setItems((xs) => xs.map((x) => (picked.includes(x.id) ? { ...x, [tab]: false } : x))));
          setPicked([]);
          setSelecting(false);
        },
      },
    ]);

  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
        <Stack.Screen
          options={{
            title: 'Laundry',
            unstable_headerRightItems: () => list.length ? [
              { type: 'button', label: selecting ? 'Cancel' : 'Select', onPress: () => { setSelecting(!selecting); setPicked([]); } },
            ] : [],
          }}
        />
        <Segmented options={['wash', 'iron'] as const} value={tab} onChange={(t) => { setTab(t); setPicked([]); }}
          labels={{ wash: `To wash · ${items.filter((i) => i.wash).length}`, iron: `To iron · ${items.filter((i) => i.iron).length}` }} />
        {!list.length ? (
          <View style={{ alignItems: 'center', gap: 8, marginTop: 60 }}>
            <Icon name="checkmark.seal.fill" size={44} color={C.ok} />
            <Txt v="headline">All caught up</Txt>
            <Txt c={C.secondary}>Nothing left to {tab}.</Txt>
          </View>
        ) : (
          <Group>
            {list.map((i) => {
              const plan = plannedFor(i.id);
              const blocked = tab === 'iron' && i.wash;
              return (
                <Row key={i.id} title={i.name}
                  subtitle={blocked ? 'Needs washing first' : plan ? `Needed for ${plan.title} · ${shortDay(plan.date)}` : `Last worn ${i.lastWorn}`}
                  left={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      {selecting && <Icon name={picked.includes(i.id) ? 'checkmark.circle.fill' : 'circle'} color={picked.includes(i.id) ? C.blue : C.separator} size={22} />}
                      <GarmentThumb id={i.id} />
                    </View>
                  }
                  right={selecting ? undefined : <Button title={tab === 'wash' ? 'Washed' : 'Ironed'} kind="tinted" small disabled={blocked} onPress={() => markOne(i.id, i.name)} />}
                  onPress={selecting && !blocked ? () => toggle(i.id) : undefined} />
              );
            })}
          </Group>
        )}
      </ScrollView>
      {selecting && (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 100 }}>
          <Button title={picked.length ? `Mark ${picked.length} as ${verb}` : 'Select items'} disabled={!picked.length} onPress={markPicked} />
        </View>
      )}
    </View>
  );
}
