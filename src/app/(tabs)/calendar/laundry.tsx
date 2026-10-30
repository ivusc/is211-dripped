import { Button, ContentUnavailableView, Form, HStack, Image, Picker, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, disabled, foregroundStyle, padding, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { CTA, GarmentThumb, RN, Screen, sub } from '@/ui';

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
    <Screen>
      <Stack.Screen
        options={{
          title: 'Laundry',
          unstable_headerRightItems: () => list.length ? [
            { type: 'button', label: selecting ? 'Done' : 'Select', variant: selecting ? 'done' : 'plain', onPress: () => { setSelecting(!selecting); setPicked([]); } },
          ] : [],
        }}
      />
      <VStack spacing={0}>
        <Form>
          <Section>
            <Picker selection={tab} onSelectionChange={(t) => { setTab(t); setPicked([]); }} modifiers={[pickerStyle('segmented')]}>
              <Text modifiers={[tag('wash')]}>{`To wash · ${items.filter((i) => i.wash).length}`}</Text>
              <Text modifiers={[tag('iron')]}>{`To iron · ${items.filter((i) => i.iron).length}`}</Text>
            </Picker>
          </Section>
          {!list.length ? (
            <ContentUnavailableView title="All caught up" systemImage="checkmark.seal.fill" description={`Nothing left to ${tab}.`} />
          ) : (
            <Section>
              {list.map((i) => {
                const plan = plannedFor(i.id);
                const blocked = tab === 'iron' && i.wash;
                const on = picked.includes(i.id);
                const row = (
                  <HStack spacing={12}>
                    {selecting && <Image systemName={on ? 'checkmark.circle.fill' : 'circle'} size={22} color={on ? C.blue : C.separator} />}
                    <RN><GarmentThumb id={i.id} /></RN>
                    <VStack alignment="leading" spacing={2}>
                      <Text modifiers={[foregroundStyle(C.label)]}>{i.name}</Text>
                      <Text modifiers={sub}>{blocked ? 'Needs washing first' : plan ? `Needed for ${plan.title} · ${shortDay(plan.date)}` : `Last worn ${i.lastWorn}`}</Text>
                    </VStack>
                    <Spacer />
                    {!selecting && (
                      <Button label={tab === 'wash' ? 'Washed' : 'Ironed'} onPress={() => markOne(i.id, i.name)}
                        modifiers={[buttonStyle('bordered'), controlSize('small'), disabled(blocked)]} />
                    )}
                  </HStack>
                );
                return selecting
                  ? <Button key={i.id} onPress={() => toggle(i.id)} modifiers={[buttonStyle('plain'), disabled(blocked)]}>{row}</Button>
                  : <HStack key={i.id}>{row}</HStack>;
              })}
            </Section>
          )}
        </Form>
        {selecting && (
          <VStack modifiers={[padding({ horizontal: 16, bottom: 8 })]}>
            <CTA label={picked.length ? `Mark ${picked.length} as ${verb}` : 'Select items'} disabled={!picked.length} onPress={markPicked} />
          </VStack>
        )}
      </VStack>
    </Screen>
  );
}
