import { Stack, router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AVATAR } from '@/data';
import { useApp, type Body } from '@/store';
import { C } from '@/theme';
import { Button, Caption, Card, Figure, Group, Icon, Pill, Row, Segmented, Txt, s } from '@/ui';

const MODE: Record<Body['mode'], string> = { plain: 'Plain model', scan: 'From body scan', measure: 'From your measurements' };

export default function BodyProfile() {
  const { body, setBody, showToast } = useApp();
  const m = body.m;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
      <Stack.Screen options={{ title: 'Body profile' }} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ backgroundColor: C.bg, borderRadius: 12, padding: 8 }}>
          <Figure src={AVATAR.previewWhiteTee} height={150} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Pill label={MODE[body.mode]} tone="blue" />
          <Txt v="headline">{body.shape} build</Txt>
          <Txt v="footnote" c={C.secondary}>{m.Height} cm · chest {m.Chest} · waist {m.Waist}</Txt>
        </View>
      </Card>

      <Caption>Update your model</Caption>
      <Group>
        <Row title="Rescan my body" subtitle="About 1 minute with your camera" left={<Icon name="camera.viewfinder" color={C.blue} />} chevron onPress={() => router.push('/body-scan')} />
        <Row title="Enter measurements" left={<Icon name="ruler" color={C.blue} />} chevron onPress={() => router.push('/stylist/measurements')} />
        <Row title="Use a plain model" left={<Icon name="person" color={C.blue} />} check={body.mode === 'plain'} onPress={() => setBody({ ...body, mode: 'plain' })} />
      </Group>

      <Caption>Body shape</Caption>
      <Segmented options={['Slim', 'Standard', 'Broad'] as const} value={body.shape} onChange={(shape) => setBody({ ...body, shape })} />

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, marginTop: 4 }}>
        <Icon name="lock.fill" size={13} color={C.secondary} />
        <Txt v="footnote" c={C.secondary} style={{ flex: 1 }}>Scans stay on your phone. We only keep the measurements, never the photos.</Txt>
      </View>
      <Button title="Save" style={{ marginTop: 8 }} onPress={() => { showToast('Body profile saved'); router.back(); }} />
    </ScrollView>
  );
}
