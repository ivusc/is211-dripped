import { Form, Picker, Section, Stepper, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { useApp, type Body } from '@/store';
import { Screen } from '@/ui';

type Key = keyof Body['m'];
const KEYS: Key[] = ['Height', 'Chest', 'Waist', 'Hips', 'Shoulders', 'Inside leg'];

export default function Measurements() {
  const { body, setBody, showToast } = useApp();
  const [m, setM] = useState(body.m);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const show = (cm: number) => (unit === 'cm' ? String(cm) : (cm / 2.54).toFixed(1));

  const save = () => {
    setBody({ ...body, m, mode: 'measure' });
    showToast('Measurements saved');
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Measurements',
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [{ type: 'button', label: 'Save', variant: 'done', onPress: save }],
        }}
      />
      <Form>
        <Section>
          <Picker selection={unit} onSelectionChange={setUnit} modifiers={[pickerStyle('segmented')]}>
            <Text modifiers={[tag('cm')]}>Centimetres</Text>
            <Text modifiers={[tag('in')]}>Inches</Text>
          </Picker>
        </Section>
        <Section footer={<Text>Measure over light clothing. Rough numbers are fine; the stylist only uses them for fit.</Text>}>
          {KEYS.map((k) => (
            <Stepper key={k} label={`${k}  ${show(m[k])} ${unit}`} value={m[k]} min={1} max={250}
              onValueChange={(v) => setM((x) => ({ ...x, [k]: v }))} />
          ))}
        </Section>
      </Form>
    </Screen>
  );
}
