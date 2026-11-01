import { HStack, Image, ProgressView, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  background, controlSize, frame, multilineTextAlignment, opacity, padding, shapes, strokeBorder, tint,
} from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AVATAR } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { CTA, Figure, IconCTA, RN, Screen, f, secondary } from '@/ui';

// ponytail: mock scan — timed steps over a static figure, no camera. Wire expo-camera in a dev build for real capture.
const STEPS = [
  ['Stand 2 m from your phone', 'Prop it up at waist height, then tap Start.'],
  ['Front · 1 of 4', 'Arms slightly away from your body.'],
  ['Turn right · 3 of 4', 'Keep turning slowly.'],
  ['Analysing your shape', 'This takes a few seconds.'],
] as const;
const TIPS = ['Fitted clothes', 'Good light', 'Plain wall'];
const card = background('#2C2C2E', shapes.roundedRectangle({ cornerRadius: 20, roundedCornerStyle: 'continuous' }));

export default function BodyScan() {
  const { body, setBody, showToast, setup } = useApp();
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
  const scanning = step >= 1 && step <= 2;
  const result = { Height: body.m.Height, Chest: 97, Waist: 81, Hips: body.m.Hips };

  return (
    <Screen colorScheme="dark">
      <StatusBar style="light" />
      <VStack spacing={16} modifiers={[padding({ horizontal: 20, top: 8, bottom: 8 })]}>
        <HStack>
          <Spacer modifiers={[frame({ width: 44 })]} />
          <Spacer />
          <VStack spacing={1}>
            <Text modifiers={[f('headline')]}>Body scan</Text>
            {setup && <Text modifiers={[f('caption'), secondary]}>Step 1 of 2 · then your clothes</Text>}
          </VStack>
          <Spacer />
          <IconCTA label={setup ? 'Skip' : 'Close'} icon="xmark" onPress={leave} />
        </HStack>
        <ZStack modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }),
          strokeBorder({ color: scanning ? C.blue : 'rgba(255,255,255,0.25)', style: { lineWidth: 2, dash: step === 0 ? [8, 6] : undefined }, shape: 'roundedRectangle', cornerRadius: 24 })]}>
          <VStack modifiers={[opacity(step === 4 ? 1 : 0.6)]}><RN><Figure src={AVATAR.previewWhiteTee} height={360} /></RN></VStack>
          {step === 3 && <ProgressView modifiers={[controlSize('large')]} />}
        </ZStack>
        {step < 4 ? (
          <VStack spacing={4}>
            <Text modifiers={[f('title3', 'semibold')]}>{STEPS[step][0]}</Text>
            <Text modifiers={[f('subheadline'), secondary, multilineTextAlignment('center')]}>{STEPS[step][1]}</Text>
            {step > 0 && <ProgressView value={[0, 0.25, 0.75, 1][step]} modifiers={[tint(C.blue), padding({ top: 10, horizontal: 24 })]} />}
            {step === 0 && (
              <VStack spacing={12} modifiers={[padding({ top: 12 })]}>
                <HStack spacing={8}>
                  {TIPS.map((t) => (
                    <HStack key={t} spacing={4} modifiers={[padding({ horizontal: 10, vertical: 6 }), background('#2C2C2E', shapes.capsule())]}>
                      <Image systemName="checkmark" size={11} color="#30D158" />
                      <Text modifiers={[f('footnote', 'semibold')]}>{t}</Text>
                    </HStack>
                  ))}
                </HStack>
                <CTA label="Start scan" onPress={() => setStep(1)} />
                <HStack spacing={5}>
                  <Image systemName="lock.fill" size={11} modifiers={[secondary]} />
                  <Text modifiers={[f('caption'), secondary]}>Processed on your phone. No photos are saved.</Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        ) : (
          <VStack spacing={10}>
            <HStack spacing={8}>
              <Image systemName="checkmark.circle.fill" color="#30D158" size={22} />
              <Text modifiers={[f('title3', 'semibold')]}>You’re a standard build</Text>
            </HStack>
            <HStack modifiers={[padding({ vertical: 14 }), card]}>
              {Object.entries(result).map(([k, v]) => (
                <VStack key={k} spacing={2} modifiers={[frame({ maxWidth: Infinity })]}>
                  <Text modifiers={[f('title3', 'semibold')]}>{`${v}`}</Text>
                  <Text modifiers={[f('caption'), secondary]}>{`${k} · cm`}</Text>
                </VStack>
              ))}
            </HStack>
            <Text modifiers={[f('caption'), secondary]}>Usually within 2 cm. You can adjust these any time.</Text>
            <CTA label={setup ? 'Next: add your clothes' : 'Use this shape'} onPress={done} />
            <CTA label="Scan again" kind="plain" onPress={() => setStep(0)} />
          </VStack>
        )}
      </VStack>
    </Screen>
  );
}
