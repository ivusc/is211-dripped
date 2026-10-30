import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AVATAR } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { Button, Figure, Icon, IconButton, Txt } from '@/ui';

// ponytail: mock scan — timed steps over a static figure, no camera. Wire expo-camera in a dev build for real capture.
const STEPS = [
  ['Stand 2 m from your phone', 'Prop it up at waist height, then tap Start.'],
  ['Front · 1 of 4', 'Arms slightly away from your body.'],
  ['Turn right · 3 of 4', 'Keep turning slowly.'],
  ['Analysing your shape', 'This takes a few seconds.'],
] as const;

export default function BodyScan() {
  const { body, setBody, showToast, setup } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 4 = result

  useEffect(() => {
    if (step === 0 || step >= 4) return;
    const t = setTimeout(() => setStep(step + 1), 1500);
    return () => clearTimeout(t);
  }, [step]);

  const done = () => {
    setBody({ ...body, mode: 'scan', shape: 'Standard', m: { ...body.m, Chest: 97, Waist: 81 } });
    if (!setup) showToast('Body profile updated from scan');
    leave();
  };
  // First run goes straight on to scanning clothes.
  const leave = () => (setup ? router.replace('/add-item') : router.back());

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16, paddingHorizontal: 20, gap: 16 }}>
      <StatusBar style="light" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
        {setup && <Txt v="subheadBold" c="#fff" style={{ flex: 1 }}>First, your measurements</Txt>}
        <IconButton name="xmark" label={setup ? 'Skip' : 'Close'} bg="rgba(255,255,255,0.15)" color="#fff" onPress={leave} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 2, borderColor: step >= 1 && step <= 2 ? C.blue : 'rgba(255,255,255,0.25)', borderStyle: step === 0 ? 'dashed' : 'solid' }}>
        <View style={{ opacity: step === 4 ? 1 : 0.6 }}>
          <Figure src={AVATAR.previewWhiteTee} height={360} />
        </View>
        {step === 3 && <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute' }} />}
      </View>
      {step < 4 ? (
        <>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <Txt v="title3" c="#fff">{STEPS[step][0]}</Txt>
            <Txt v="subhead" c="rgba(255,255,255,0.7)" style={{ textAlign: 'center' }}>{STEPS[step][1]}</Txt>
          </View>
          {step === 0 && <Button title="Start scan" onPress={() => setStep(1)} />}
        </>
      ) : (
        <>
          <View style={{ gap: 6, alignItems: 'center' }}>
            <Icon name="checkmark.circle.fill" color="#30D158" size={32} />
            <Txt v="title3" c="#fff">Standard build</Txt>
            <Txt v="subhead" c="rgba(255,255,255,0.7)">Chest 97 cm · Waist 81 cm · Height {body.m.Height} cm</Txt>
          </View>
          <Button title={setup ? 'Next: add your clothes' : 'Use this shape'} onPress={done} />
          <Button title="Scan again" kind="plain" onPress={() => setStep(0)} />
        </>
      )}
    </View>
  );
}
