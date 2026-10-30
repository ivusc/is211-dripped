import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCANNED, type Category, type Item, type Scan } from '@/data';
import { statusLabel, useApp } from '@/store';
import { T } from '@/theme';
import { Button, Garment, Icon, IconButton, KeyboardScreen, Segmented, Txt } from '@/ui';

// ponytail: camera, photo library and link lookup are all mocked. Scans walk through SCANNED (Caleb's
// school tee, then his navy dress shirt from graduation); after that, and for links, each "finds" a fixed garment.
type Step = 'scan' | 'link' | 'upload' | 'details' | 'added';
type Draft = Item & { spot?: Scan['spot'] };
const SHOTS = ['Front', 'Back', 'Label'] as const;
const FOUND = {
  scan: { art: 'white-tshirt', name: 'White T-shirt', category: 'Tops', kind: 'T-shirt', colour: 'White' },
  link: { art: 'light-blue-shirt', name: 'Light blue oxford shirt', category: 'Tops', kind: 'Shirt', colour: 'Light blue' },
} as const;

const DARK = { card: '#2C2C2E', fg: '#fff', dim: 'rgba(235,235,245,0.6)', red: '#FF453A', orange: '#FF9F0A', green: '#30D158' };
const MSG = {
  dark: { icon: 'sun.max.fill', color: DARK.orange, title: 'Too dark to check the details', body: 'Turn on a light or move near a window, then retake.' },
  ok: { icon: 'checkmark.circle.fill', color: DARK.green, title: 'Looks good', body: 'Clear enough to check the details. Keep going.' },
  flaw: { icon: 'exclamationmark.triangle.fill', color: DARK.red, title: '', body: '' },
} as const;

export default function AddItem() {
  const { items, setItems, setup, setSetup } = useApp();
  const insets = useSafeAreaInsets();
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 44 }}>
      {back ? <IconButton name="chevron.left" label="Back" bg={DARK.card} color={DARK.fg} size={32} onPress={back} /> : <View style={{ width: 32 }} />}
      <Txt v="headline" c={DARK.fg}>{title}</Txt>
      <IconButton name="xmark" label="Close" bg={DARK.card} color={DARK.fg} size={32} onPress={close} />
    </View>
  );

  if (step === 'added' && added) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom + 16, paddingHorizontal: 20, gap: 14 }}>
        <StatusBar style="light" />
        <View style={{ marginHorizontal: -20 }}>{header('')}</View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <View style={{ backgroundColor: DARK.card, borderRadius: 24, padding: 24 }}><Garment id={added.id} size={140} /></View>
          <Icon name="checkmark.circle.fill" color="#30D158" size={34} />
          <Txt v="title2" c={DARK.fg}>Added to wardrobe</Txt>
          <Txt v="subhead" c={DARK.dim}>{added.name} · {statusLabel(added) === 'Ready' ? 'Ready to wear' : statusLabel(added)}</Txt>
          <Txt v="footnote" c={DARK.dim}>{items.length} items in your wardrobe</Txt>
          <Button title="Undo" kind="plain" onPress={() => { setItems((xs) => xs.filter((x) => x.id !== added.id)); reset(); }} />
        </View>
        <Button title="Scan next item" kind="gray" onPress={reset} />
        <Button title={setup ? 'Go to my wardrobe' : 'Done'} onPress={close} />
      </View>
    );
  }

  if (step === 'details' && draft) {
    return (
      <KeyboardScreen style={{ paddingTop: insets.top }}>
        <StatusBar style="light" />
        {header('Details', () => { setShots(0); setResult(undefined); setStep(from); })}
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <View style={{ alignSelf: 'center', backgroundColor: DARK.card, borderRadius: 20, padding: 16 }}>
            <Photo id={draft.id} size={130} spot={draft.spot} />
          </View>
          {draft.flaw && (
            <View style={{ flexDirection: 'row', gap: 8, backgroundColor: 'rgba(255,69,58,0.15)', borderRadius: 12, padding: 12 }}>
              <Icon name="exclamationmark.triangle.fill" color={DARK.red} size={15} />
              <View style={{ flex: 1 }}>
                <Txt v="subheadBold" c={DARK.fg}>Marked as {draft.issue?.toLowerCase()}: {draft.flaw.toLowerCase()}</Txt>
                <Txt v="footnote" c={DARK.dim}>We circled it on the photo. The stylist won’t suggest it until you mark it fixed.</Txt>
              </View>
            </View>
          )}
          <View style={{ gap: 6 }}>
            <Txt v="footnote" c={DARK.dim}>FROM YOUR PHOTOS</Txt>
            <View style={{ backgroundColor: DARK.card, borderRadius: 12, padding: 14, gap: 2 }}>
              <Txt v="headline" c={DARK.fg}>{draft.name}</Txt>
              <Txt v="subhead" c={DARK.dim}>{draft.kind} · {draft.colour} · {draft.material}</Txt>
              <Txt v="footnote" c={DARK.dim}>Good for {draft.tags.join(', ').toLowerCase()}</Txt>
            </View>
          </View>
          {dupe && (
            <View style={{ flexDirection: 'row', gap: 8, backgroundColor: 'rgba(255,159,10,0.15)', borderRadius: 12, padding: 12 }}>
              <Icon name="exclamationmark.triangle.fill" color={DARK.orange} size={15} />
              <Txt v="footnote" c="#FFD60A" style={{ flex: 1 }}>You already have a “{draft.name}”. Add it anyway if it’s a second one.</Txt>
            </View>
          )}
          <View style={{ gap: 6 }}>
            <Txt v="footnote" c={DARK.dim}>WE CAN’T TELL FROM A PHOTO</Txt>
            <View style={{ backgroundColor: DARK.card, borderRadius: 12 }}>
              <Toggle label="Is it clean?" value={clean} onChange={setClean} />
              <View style={{ height: 0.5, backgroundColor: 'rgba(84,84,88,0.65)', marginLeft: 16 }} />
              <Toggle label="Does it still fit?" value={fits} onChange={setFits} />
            </View>
          </View>
        </ScrollView>
        <Button title="Add to wardrobe" style={{ marginHorizontal: 20 }} onPress={add} />
      </KeyboardScreen>
    );
  }

  const art = next?.id ?? FOUND.scan.art;
  return (
    <KeyboardScreen style={{ paddingTop: insets.top, gap: 12 }}>
      <StatusBar style="light" />
      {header(setup ? 'Add your clothes' : 'Add clothing')}
      <View style={{ paddingHorizontal: 20 }}>
        <Segmented options={['scan', 'link', 'upload'] as const} value={step} onChange={setStep} labels={{ scan: 'Scan', link: 'Paste link', upload: 'Upload' }} />
      </View>

      {step === 'scan' && (
        <>
          <View style={{ flex: 1, marginHorizontal: 20, borderRadius: 24, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '70%', aspectRatio: 0.8, borderRadius: 20, borderWidth: 2, borderColor: result === 'dark' ? DARK.orange : result === 'ok' ? DARK.green : 'rgba(255,255,255,0.6)', borderStyle: result ? 'solid' : 'dashed', alignItems: 'center', justifyContent: 'center' }}>
              {checking ? <ActivityIndicator color="#fff" size="large" />
                : result ? <Photo id={art} size={170} dim={result === 'dark'} spot={result === 'flaw' ? next?.spot : undefined} />
                : <Icon name="tshirt" color="rgba(255,255,255,0.4)" size={64} />}
            </View>
            {result && !checking && (
              <View style={{ position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', gap: 8, backgroundColor: 'rgba(44,44,46,0.92)', borderRadius: 12, padding: 12 }}>
                <Icon name={MSG[result].icon} color={MSG[result].color} size={16} />
                <View style={{ flex: 1 }}>
                  <Txt v="subheadBold" c={DARK.fg}>{result === 'flaw' ? `Spotted: ${next?.flaw?.toLowerCase()}` : MSG[result].title}</Txt>
                  <Txt v="footnote" c={DARK.dim}>
                    {result === 'flaw' ? `We’ll mark it as ${next?.issue?.toLowerCase()}. Keep going.` : MSG[result].body}
                  </Txt>
                </View>
              </View>
            )}
            <Txt v="subhead" c="#fff" style={{ position: 'absolute', bottom: 20 }}>
              {checking ? 'Checking the photo…' : result === 'dark' ? `Retake · ${SHOTS[shots]}` : `Lay it flat · ${SHOTS[shots]}${shots === 2 ? ' (optional)' : ''}`}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {SHOTS.map((sh, n) => (
              <View key={sh} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: n < shots ? 'rgba(48,209,88,0.2)' : DARK.card }}>
                {n < shots && <Icon name="checkmark" color="#30D158" size={11} weight="bold" />}
                <Txt v="caption" c={n < shots ? '#30D158' : n === shots ? DARK.fg : DARK.dim}>{sh}{n === 2 ? ' · optional' : ''}</Txt>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 84 }}>
            {shots === 2 && <Button title="Skip label" kind="plain" style={{ position: 'absolute', left: 20 }} onPress={() => found('scan')} />}
            <Pressable accessibilityLabel={result === 'dark' ? 'Retake photo' : 'Take photo'} disabled={checking} onPress={() => setChecking(true)}
              style={({ pressed }) => ({ width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', opacity: pressed || checking ? 0.6 : 1 })}>
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' }} />
            </Pressable>
          </View>
        </>
      )}

      {step === 'link' && (
        <View style={{ flex: 1, padding: 20, gap: 12 }}>
          <Txt v="subhead" c={DARK.dim}>Paste a product link from any online shop. We’ll pull the photo and details.</Txt>
          <View style={{ backgroundColor: DARK.card, borderRadius: 12, paddingHorizontal: 14, height: 48, justifyContent: 'center' }}>
            <TextInput value={url} onChangeText={setUrl} placeholder="https://" placeholderTextColor={DARK.dim} autoCapitalize="none" autoCorrect={false}
              keyboardType="url" textContentType="URL" style={{ ...T.body, color: DARK.fg }} />
          </View>
          {!!url && !validUrl && <Txt v="footnote" c="#FF6961">That doesn’t look like a web link. It should start with https://</Txt>}
          <Button title={fetching ? 'Finding product…' : 'Find product'} loading={fetching} disabled={!validUrl} onPress={fetchLink} />
        </View>
      )}

      {step === 'upload' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
          <Icon name="photo.on.rectangle" color={DARK.dim} size={44} />
          <Txt v="headline" c={DARK.fg}>Upload from Photos</Txt>
          <Txt v="subhead" c={DARK.dim} style={{ textAlign: 'center' }}>Photo library access isn’t part of this prototype. Use Scan or Paste link instead.</Txt>
        </View>
      )}
    </KeyboardScreen>
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, minHeight: 48 }}>
      <Txt c={DARK.fg}>{label}</Txt>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
