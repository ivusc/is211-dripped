import { Button, Form, HStack, Image, ProgressView, Section, Spacer, Text, TextField, VStack, ZStack, useNativeState } from '@expo/ui/swift-ui';
import {
  background, buttonStyle, controlSize, disabled, foregroundStyle, frame, glassEffect, labelStyle, listRowBackground,
  listRowInsets, onSubmit, opacity, padding, shapes, submitLabel,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { LOOK_ROUNDS } from '@/data';
import { shortDay, useApp } from '@/store';
import { C } from '@/theme';
import { Actions, CTA, Figure, IconCTA, Pill, RN, Screen, f, sub, setNative } from '@/ui';

export default function Looks() {
  const { prompt, event: eventId } = useLocalSearchParams<{ prompt: string; event?: string }>();
  const { events, items, item, setPreview, liked, setLiked, upNext } = useApp();
  const event = events.find((e) => e.id === eventId) ?? upNext;
  const [step, setStep] = useState(0); // 0-2 thinking, 3 = looks ready
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const refineText = useNativeState('');
  const [refine, setRefine] = useState('');

  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep(step + 1), 900);
    return () => clearTimeout(t);
  }, [step]);

  const look = LOOK_ROUNDS[round][i];
  const pieces = look.pieces.map(item);
  const attention = pieces.filter((p) => p.wash || p.iron).length;
  const day = shortDay(event.date);
  const STEPS = [
    ['Read the event', `${event.dressCode} · ${event.time} · ${day}`],
    ['Checked your wardrobe', `${items.filter((x) => x.tags.includes(event.dressCode)).length || items.length} of ${items.length} items fit the dress code. Skipped ${items.filter((x) => x.issue).length} with stains or damage.`],
    ['Matching pieces to your body profile', 'Usually about 10 seconds'],
  ];

  const regenerate = () => {
    setBusy(true);
    setNative(refineText, '');
    setRefine('');
    setTimeout(() => {
      setRound((r) => (r + 1) % LOOK_ROUNDS.length);
      setI(0);
      setBusy(false);
    }, 1600);
  };

  const tryOn = () => {
    setPreview(look.pieces);
    router.navigate('/preview');
  };
  const save = () => router.push({ pathname: '/save-look', params: { pieces: look.pieces.join(','), name: `${look.name} · Look ${i + 1}`, date: event.date } });
  const openPieces = () =>
    router.push({ pathname: '/pieces', params: { pieces: look.pieces.join(','), title: `Look ${i + 1} · ${look.name}`, date: event.date } });

  const bubble = (
    <HStack>
      <Spacer minLength={60} />
      <Text modifiers={[foregroundStyle('white'), padding({ horizontal: 14, vertical: 9 }), background(C.blue, shapes.roundedRectangle({ cornerRadius: 18, roundedCornerStyle: 'continuous' }))]}>{prompt}</Text>
    </HStack>
  );

  if (step < 3) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'New look', headerLargeTitleEnabled: false }} />
        <Form>
          <Section modifiers={[listRowBackground('clear'), listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}>{bubble}</Section>
          <Section header={<HStack><Text>Putting your looks together</Text><Spacer /><Text>{`${Math.min(step + 1, 3)} of 3`}</Text></HStack>}>
            <ProgressView value={(step + 1) / 3} />
            {STEPS.map(([title, subtitle], n) => (
              <HStack key={title} spacing={10} alignment="top" modifiers={[opacity(n <= step ? 1 : 0.35)]}>
                {n < step ? <Image systemName="checkmark.circle.fill" color={C.ok} size={20} /> : n === step ? <ProgressView modifiers={[frame({ width: 20 })]} /> : <Image systemName="circle" color={C.separator} size={20} />}
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[f('subheadline', 'semibold')]}>{title}</Text>
                  <Text modifiers={sub}>{subtitle}</Text>
                </VStack>
              </HStack>
            ))}
          </Section>
          <Actions><CTA label="Cancel" kind="plain" onPress={() => router.back()} /></Actions>
        </Form>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: `${event.dressCode} looks`,
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [
            { type: 'button', label: 'History', icon: { type: 'sfSymbol', name: 'clock.arrow.circlepath' }, onPress: () => router.push('/menu') },
          ],
        }}
      />
      <VStack spacing={0}>
        <Form>
          <Section footer={<Text modifiers={sub}>{`For ${event.title} · ${day}`}</Text>}>
            <ZStack alignment="top" modifiers={[frame({ height: 340 })]}>
              <VStack modifiers={[frame({ maxWidth: Infinity }), frame({ height: 340 })]}>
                {busy ? (
                  <VStack spacing={8}>
                    <ProgressView />
                    <Text modifiers={[f('headline')]}>Styling 3 new looks…</Text>
                    <Text modifiers={sub}>Your current looks are saved in Earlier</Text>
                  </VStack>
                ) : (
                  <RN><Figure src={look.avatar} height={290} /></RN>
                )}
              </VStack>
              <HStack spacing={8}>
                <Pill label={busy ? 'Regenerating' : `Look ${i + 1} of 3`} />
                <Spacer />
                <IconCTA label={liked[look.id] ? 'Remove from Liked' : 'Save to Liked'} icon={liked[look.id] ? 'heart.fill' : 'heart'} size="small"
                  onPress={() => setLiked((l) => ({ ...l, [look.id]: !l[look.id] }))} />
                <CTA label="Try on" icon="figure.stand" kind="gray" small wide={false} onPress={tryOn} />
              </HStack>
              {!busy && (
                <HStack modifiers={[frame({ height: 340 })]}>
                  <IconCTA label="Previous look" icon="chevron.left" disabled={!i} onPress={() => setI(Math.max(0, i - 1))} />
                  <Spacer />
                  <IconCTA label="Next look" icon="chevron.right" disabled={i >= 2} onPress={() => setI(Math.min(2, i + 1))} />
                </HStack>
              )}
            </ZStack>
            <Button onPress={openPieces} modifiers={[disabled(busy)]}>
              <HStack spacing={6}>
                <Spacer />
                <Image systemName="chevron.up" size={13} />
                <Text modifiers={[f('subheadline', 'semibold')]}>
                  {busy ? 'Hang on, this takes a few seconds' : `${pieces.length} pieces · ${attention ? `${attention} need${attention > 1 ? '' : 's'} attention` : 'all ready'}`}
                </Text>
                <Spacer />
              </HStack>
            </Button>
          </Section>
          <Actions>
            <HStack spacing={10}>
              <CTA label="New looks" icon="arrow.clockwise" kind="gray" onPress={regenerate} disabled={busy} />
              <CTA label={`Save to ${day.replace(/^\w+ /, '')}`} icon="calendar" onPress={save} disabled={busy} />
            </HStack>
          </Actions>
        </Form>

        <HStack spacing={8} modifiers={[padding({ leading: 16, trailing: 6, vertical: 6 }), glassEffect({ glass: { variant: 'regular' }, shape: 'capsule' }), padding({ horizontal: 16, bottom: 8 })]}>
          <TextField text={refineText} onTextChange={setRefine} placeholder="Refine: “no belt”, “something lighter”"
            modifiers={[submitLabel('send'), onSubmit(() => refineText.value.trim() && regenerate()), padding({ vertical: 8 })]} />
          <Button label="Refine looks" systemImage="arrow.up" onPress={() => refine.trim() && regenerate()}
            modifiers={[labelStyle('iconOnly'), buttonStyle('borderedProminent'), controlSize('regular'), disabled(!refine.trim() || busy)]} />
        </HStack>
      </VStack>
    </Screen>
  );
}
