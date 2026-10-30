import { Button, ContentUnavailableView, Form, HStack, Image, Picker, ProgressView, Section, Spacer, Text, TextField, Toggle, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel, autocorrectionDisabled, background, buttonStyle, controlSize, disabled, foregroundStyle, frame, glassEffect,
  keyboardType, padding, pickerStyle, shapes, strokeBorder, tag, textContentType, textInputAutocapitalization,
} from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { SCANNED, type Category, type Item, type Scan } from '@/data';
import { statusLabel, useApp } from '@/store';
import { Actions, CTA, Garment, IconCTA, RN, Screen, f, secondary, sub } from '@/ui';

// ponytail: camera, photo library and link lookup are all mocked. Scans walk through SCANNED (Caleb's
// school tee, then his navy dress shirt from graduation); after that, and for links, each "finds" a fixed garment.
type Step = 'scan' | 'link' | 'upload' | 'details' | 'added';
type Draft = Item & { spot?: Scan['spot'] };
const SHOTS = ['Front', 'Back', 'Label'] as const;
const FOUND = {
  scan: { art: 'white-tshirt', name: 'White T-shirt', category: 'Tops', kind: 'T-shirt', colour: 'White' },
  link: { art: 'light-blue-shirt', name: 'Light blue oxford shirt', category: 'Tops', kind: 'Shirt', colour: 'Light blue' },
} as const;

const DARK = { card: '#2C2C2E', red: '#FF453A', orange: '#FF9F0A', green: '#30D158' };
const MSG = {
  dark: { icon: 'sun.max.fill', color: DARK.orange, title: 'Too dark to check the details', body: 'Turn on a light or move near a window, then retake.' },
  ok: { icon: 'checkmark.circle.fill', color: DARK.green, title: 'Looks good', body: 'Clear enough to check the details. Keep going.' },
  flaw: { icon: 'exclamationmark.triangle.fill', color: DARK.red, title: '', body: '' },
} as const;

const rounded = (r: number) => shapes.roundedRectangle({ cornerRadius: r, roundedCornerStyle: 'continuous' });

export default function AddItem() {
  const { items, setItems, setup, setSetup } = useApp();
  const [step, setStep] = useState<Step>('scan');
  const [shots, setShots] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<'dark' | 'flaw' | 'ok'>();
  const [darkSeen, setDarkSeen] = useState(false);
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [draft, setDraft] = useState<Draft>();
  const [from, setFrom] = useState<'scan' | 'link'>('scan');
  const [clean, setClean] = useState(true);
  const [fits, setFits] = useState(true);
  const [added, setAdded] = useState<Item>();

  const next = SCANNED.find((x) => !items.some((i) => i.id === x.id));
  const validUrl = /^https:\/\/[^\s.]+\.[^\s]+$/.test(url.trim());
  const dupe = !!draft && items.some((i) => i.name.toLowerCase() === draft.name.toLowerCase());

  const close = () => {
    if (!setup) return router.back();
    setSetup(false);
    router.replace('/wardrobe');
  };

  const found = (src: keyof typeof FOUND) => {
    const f = FOUND[src];
    setFrom(src);
    setDraft(src === 'scan' && next ? next : {
      id: `${f.art}-${Date.now()}`, name: f.name, category: f.category as Category, kind: f.kind, material: 'Cotton',
      colour: f.colour, lastWorn: 'Never', condition: 'Brand new', tags: ['Casual'],
    });
    setStep('details');
  };

  useEffect(() => {
    if (!checking) return;
    const t = setTimeout(() => {
      setChecking(false);
      if (next?.dark && !darkSeen) {
        setDarkSeen(true);
        setResult('dark'); // not counted: he retakes the same shot
        return;
      }
      // After a too-dark shot, confirm the retake worked.
      setResult(next?.spot?.shot === shots ? 'flaw' : result === 'dark' ? 'ok' : undefined);
      if (shots + 1 === SHOTS.length) found('scan');
      setShots((n) => n + 1);
    }, 1100);
    return () => clearTimeout(t);
  }, [checking]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLink = () => {
    setFetching(true);
    setTimeout(() => { setFetching(false); found('link'); }, 1400);
  };

  const add = () => {
    if (!draft) return;
    const it: Item = { ...draft, wash: !clean, issue: draft.issue ?? (fits ? undefined : 'Doesn’t fit') };
    setItems((xs) => [it, ...xs]);
    setAdded(it);
    setStep('added');
  };

  const reset = () => { setShots(0); setResult(undefined); setDarkSeen(false); setUrl(''); setDraft(undefined); setClean(true); setFits(true); setStep('scan'); };

  const header = (title: string, back?: () => void) => (
    <HStack modifiers={[padding({ horizontal: 16 }), frame({ height: 52 })]}>
      {back ? <IconCTA label="Back" icon="chevron.left" onPress={back} /> : <Spacer modifiers={[frame({ width: 44 })]} />}
      <Spacer />
      <VStack spacing={1}>
        <Text modifiers={[f('headline')]}>{title}</Text>
        {setup && !!title && <Text modifiers={[f('caption'), secondary]}>{`Step 2 of 2 · ${items.length} items so far`}</Text>}
      </VStack>
      <Spacer />
      <IconCTA label="Close" icon="xmark" onPress={close} />
    </HStack>
  );

  const banner = (icon: string, color: string, title: string, body?: string) => (
    <HStack spacing={8} alignment="top">
      <Image systemName={icon as 'sun.max.fill'} color={color} size={16} />
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[f('subheadline', 'semibold')]}>{title}</Text>
        {body && <Text modifiers={sub}>{body}</Text>}
      </VStack>
      <Spacer />
    </HStack>
  );

  const tabs = (
    <Picker selection={step} onSelectionChange={(s) => setStep(s as Step)} modifiers={[pickerStyle('segmented')]}>
      <Text modifiers={[tag('scan')]}>Scan</Text>
      <Text modifiers={[tag('link')]}>Paste link</Text>
      <Text modifiers={[tag('upload')]}>Upload</Text>
    </Picker>
  );

  let body;
  if (step === 'added' && added) {
    body = (
      <VStack spacing={14}>
        {header('')}
        <Spacer />
        <VStack spacing={12} modifiers={[padding({ horizontal: 20 })]}>
          <VStack modifiers={[padding({ all: 24 }), background(DARK.card, rounded(24))]}><RN><Photo id={added.id} size={140} spot={draft?.spot} /></RN></VStack>
          <Image systemName="checkmark.circle.fill" color={DARK.green} size={34} />
          <Text modifiers={[f('title2', 'bold')]}>Added to wardrobe</Text>
          <Text modifiers={[f('subheadline'), secondary]}>{`${added.name} · ${statusLabel(added) === 'Ready' ? 'Ready to wear' : statusLabel(added)}`}</Text>
          <Text modifiers={sub}>{setup && !next ? `That’s everything. All ${items.length} items are in your wardrobe.` : `${items.length} items in your wardrobe`}</Text>
          <Button label="Undo" onPress={() => { setItems((xs) => xs.filter((x) => x.id !== added.id)); reset(); }} />
        </VStack>
        <Spacer />
        <VStack spacing={10} modifiers={[padding({ horizontal: 20, bottom: 8 })]}>
          <CTA label="Scan next item" kind="gray" onPress={reset} />
          <CTA label={setup ? 'Go to my wardrobe' : 'Done'} onPress={close} />
        </VStack>
      </VStack>
    );
  } else if (step === 'details' && draft) {
    body = (
      <VStack spacing={0}>
        {header('Details', () => { setShots(0); setResult(undefined); setStep(from); })}
        <Form>
          <Section>
            <HStack><Spacer /><RN><Photo id={draft.id} size={130} spot={draft.spot} /></RN><Spacer /></HStack>
          </Section>
          {draft.flaw && (
            <Section>
              {banner('exclamationmark.triangle.fill', DARK.red, `Marked as ${draft.issue?.toLowerCase()}: ${draft.flaw.toLowerCase()}`,
                'We circled it on the photo. The stylist won’t suggest it until you mark it fixed.')}
            </Section>
          )}
          <Section title="From your photos">
            <VStack alignment="leading" spacing={2}>
              <Text modifiers={[f('headline')]}>{draft.name}</Text>
              <Text modifiers={[f('subheadline'), secondary]}>{`${draft.kind} · ${draft.colour} · ${draft.material}`}</Text>
              <Text modifiers={sub}>{`Good for ${draft.tags.join(', ').toLowerCase()}`}</Text>
            </VStack>
            {dupe && banner('exclamationmark.triangle.fill', DARK.orange, `You already have a “${draft.name}”.`, 'Add it anyway if it’s a second one.')}
          </Section>
          <Section title="We can’t tell from a photo">
            <Toggle label="Is it clean?" isOn={clean} onIsOnChange={setClean} />
            <Toggle label="Does it still fit?" isOn={fits} onIsOnChange={setFits} />
          </Section>
          <Actions><CTA label="Add to wardrobe" onPress={add} /></Actions>
        </Form>
      </VStack>
    );
  } else if (step === 'scan') {
    const art = next?.id ?? FOUND.scan.art;
    const ring = result === 'dark' ? DARK.orange : result === 'flaw' ? DARK.red : result === 'ok' ? DARK.green : 'rgba(255,255,255,0.6)';
    body = (
      <VStack spacing={12}>
        {header(setup ? 'Add your clothes' : 'Add clothing')}
        <VStack modifiers={[padding({ horizontal: 20 })]}>{tabs}</VStack>
        <ZStack modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity }), background('black', rounded(24)), padding({ horizontal: 20 })]}>
          <ZStack modifiers={[frame({ width: 240, height: 300 }), strokeBorder({ color: ring, style: { lineWidth: 2, dash: result ? undefined : [8, 6] }, shape: 'roundedRectangle', cornerRadius: 20 })]}>
            {checking ? <ProgressView modifiers={[controlSize('large')]} />
              : result ? <RN><Photo id={art} size={170} dim={result === 'dark'} spot={result === 'flaw' ? next?.spot : undefined} /></RN>
              : <Image systemName="tshirt" color="rgba(255,255,255,0.4)" size={64} />}
          </ZStack>
          <VStack modifiers={[padding({ all: 14 })]}>
            {result && !checking && (
              <VStack modifiers={[padding({ all: 12 }), glassEffect({ glass: { variant: 'regular' }, shape: 'roundedRectangle', cornerRadius: 16 })]}>
                {banner(MSG[result].icon, MSG[result].color,
                  result === 'flaw' ? `Spotted: ${next?.flaw?.toLowerCase()}` : MSG[result].title,
                  result === 'flaw' ? `We’ll mark it as ${next?.issue?.toLowerCase()}. Keep going.` : MSG[result].body)}
              </VStack>
            )}
            <Spacer />
            <Text modifiers={[f('subheadline')]}>
              {checking ? 'Checking the photo…' : result === 'dark' ? `Retake · ${SHOTS[shots]}` : `Lay it flat · ${SHOTS[shots]}${shots === 2 ? ' (optional)' : ''}`}
            </Text>
          </VStack>
        </ZStack>
        <HStack spacing={8}>
          {SHOTS.map((sh, n) => (
            <HStack key={sh} spacing={4} modifiers={[padding({ horizontal: 10, vertical: 5 }), background(n < shots ? 'rgba(48,209,88,0.2)' : n === shots ? 'white' : DARK.card, shapes.capsule())]}>
              {n < shots && <Image systemName="checkmark" color={DARK.green} size={11} />}
              <Text modifiers={[f('caption', 'semibold'), n < shots ? foregroundStyle(DARK.green) : n === shots ? foregroundStyle('black') : secondary]}>
                {`${sh}${n === 2 ? ' · optional' : ''}`}
              </Text>
            </HStack>
          ))}
        </HStack>
        <ZStack modifiers={[frame({ height: 84 }), padding({ horizontal: 20 })]}>
          <HStack>
            {shots === 2 && <Button label="Skip label" onPress={() => found('scan')} />}
            <Spacer />
          </HStack>
          <Button onPress={() => setChecking(true)} modifiers={[buttonStyle('plain'), disabled(checking), accessibilityLabel(result === 'dark' ? 'Retake photo' : 'Take photo')]}>
            <Image systemName="circle.inset.filled" size={72} color="white" />
          </Button>
        </ZStack>
      </VStack>
    );
  } else {
    body = (
      <VStack spacing={0}>
        {header(setup ? 'Add your clothes' : 'Add clothing')}
        <Form>
          <Section>{tabs}</Section>
          {step === 'link' ? (
            <>
              <Section footer={<Text modifiers={!!url && !validUrl ? [f('footnote'), foregroundStyle('#FF6961')] : sub}>
                {!!url && !validUrl ? 'That doesn’t look like a web link. It should start with https://' : 'Paste a product link from any online shop. We’ll pull the photo and details.'}
              </Text>}>
                <TextField placeholder="https://" onTextChange={setUrl}
                  modifiers={[keyboardType('url'), textContentType('URL'), textInputAutocapitalization('never'), autocorrectionDisabled()]} />
              </Section>
              <Actions><CTA label={fetching ? 'Finding product…' : 'Find product'} disabled={!validUrl || fetching} onPress={fetchLink} /></Actions>
            </>
          ) : (
            <ContentUnavailableView title="Upload from Photos" systemImage="photo.on.rectangle"
              description="Photo library access isn’t part of this prototype. Use Scan or Paste link instead." />
          )}
        </Form>
      </VStack>
    );
  }

  return (
    <Screen colorScheme="dark">
      <StatusBar style="light" />
      {body}
    </Screen>
  );
}

// The "photo": garment art, darkened for a bad shot, with the flaw (a hole or stain) drawn in and circled.
function Photo({ id, size, spot, dim }: { id: string; size: number; spot?: Scan['spot']; dim?: boolean }) {
  const d = size * 0.05;
  return (
    <View style={{ width: size, height: size }}>
      <Garment id={id} size={size} />
      {spot && <View style={{ position: 'absolute', left: spot.x * size - d / 2, top: spot.y * size - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: spot.mark }} />}
      {dim && <View style={{ position: 'absolute', inset: 0, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.75)' }} />}
      {spot && (
        <View accessibilityLabel="Circled flaw"
          style={{ position: 'absolute', left: spot.x * size - 16, top: spot.y * size - 16, width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: DARK.red }} />
      )}
    </View>
  );
}
