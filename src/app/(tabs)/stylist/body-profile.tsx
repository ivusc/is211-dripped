import { Form, HStack, Picker, Section, Text, VStack } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';

import { AVATAR } from '@/data';
import { useApp, type Body } from '@/store';
import { C } from '@/theme';
import { Figure, Note, Pill, RN, Row, Screen, f, sub } from '@/ui';

const MODE: Record<Body['mode'], string> = { plain: 'Plain model', scan: 'From body scan', measure: 'From your measurements' };
const SHAPES = ['Slim', 'Standard', 'Broad'] as const;

export default function BodyProfile() {
  const { body, setBody, showToast } = useApp();
  const m = body.m;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Body profile',
          unstable_headerRightItems: () => [
            { type: 'button', label: 'Done', variant: 'done', onPress: () => { showToast('Body profile saved'); router.back(); } },
          ],
        }}
      />
      <Form>
        <Section>
          <HStack spacing={16}>
            <RN>
              <View style={{ backgroundColor: C.bg, borderRadius: 12, borderCurve: 'continuous', padding: 8 }}>
                <Figure src={AVATAR.previewWhiteTee} height={150} />
              </View>
            </RN>
            <VStack alignment="leading" spacing={6}>
              <Pill label={MODE[body.mode]} tone="blue" />
              <Text modifiers={[f('headline')]}>{`${body.shape} build`}</Text>
              <Text modifiers={sub}>{`${m.Height} cm · chest ${m.Chest} · waist ${m.Waist}`}</Text>
            </VStack>
          </HStack>
        </Section>

        <Section title="Update your model">
          <Row title="Rescan my body" subtitle="About 1 minute with your camera" icon="camera.viewfinder" chevron onPress={() => router.push('/body-scan')} />
          <Row title="Enter measurements" icon="ruler" chevron onPress={() => router.push('/stylist/measurements')} />
          <Row title="Use a plain model" icon="person" check={body.mode === 'plain'} onPress={() => setBody({ ...body, mode: 'plain' })} />
        </Section>

        <Section title="Body shape" footer={<Note icon="lock.fill">Scans stay on your phone. We only keep the measurements, never the photos.</Note>}>
          <Picker selection={body.shape} onSelectionChange={(shape) => setBody({ ...body, shape })} modifiers={[pickerStyle('segmented')]}>
            {SHAPES.map((s) => <Text key={s} modifiers={[tag(s)]}>{s}</Text>)}
          </Picker>
        </Section>
      </Form>
    </Screen>
  );
}
