import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from 'react-native';

import { LOOK_ROUNDS } from '@/data';
import { shortDay, useApp } from '@/store';
import { C, T } from '@/theme';
import { Button, Card, Figure, Icon, IconButton, Pill, Txt, s } from '@/ui';

export default function Looks() {
  const { prompt, event: eventId } = useLocalSearchParams<{ prompt: string; event?: string }>();
  const { events, items, item, setPreview, liked, setLiked, upNext } = useApp();
  const event = events.find((e) => e.id === eventId) ?? upNext;
  const [step, setStep] = useState(0); // 0-2 thinking, 3 = looks ready
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
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

  if (step < 3) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad}>
        <Stack.Screen options={{ title: 'New look', headerLargeTitleEnabled: false }} />
        <Bubble text={prompt} />
        <Card style={{ gap: 12 }}>
          <View style={s.rowBetween}>
            <Txt v="headline">Putting your looks together</Txt>
            <Txt v="footnote" c={C.blue}>{Math.min(step + 1, 3)} of 3</Txt>
          </View>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.fill }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: C.blue, width: `${((step + 1) / 3) * 100}%` }} />
          </View>
          {STEPS.map(([title, sub], n) => (
            <View key={title} style={{ flexDirection: 'row', gap: 10, opacity: n <= step ? 1 : 0.35 }}>
              {n < step ? <Icon name="checkmark.circle.fill" color={C.ok} size={20} /> : <ActivityIndicator size="small" animating={n === step} color={C.blue} style={{ width: 20 }} />}
              <View style={{ flex: 1 }}>
                <Txt v="subheadBold">{title}</Txt>
                <Txt v="footnote" c={C.secondary}>{sub}</Txt>
              </View>
            </View>
          ))}
        </Card>
        <Button title="Cancel" kind="gray" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <Stack.Screen
        options={{
          title: `${event.dressCode} looks`,
          headerLargeTitleEnabled: false,
          unstable_headerRightItems: () => [
            { type: 'button', label: 'History', icon: { type: 'sfSymbol', name: 'clock.arrow.circlepath' }, onPress: () => router.push('/menu') },
          ],
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.pad} keyboardDismissMode="interactive">
        <Txt v="footnote" c={C.secondary} style={{ textAlign: 'center' }}>For {event.title} · {day}</Txt>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ height: 340, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="large" color={C.blue} />
                <Txt v="headline">Styling 3 new looks…</Txt>
                <Txt v="footnote" c={C.secondary}>Your current looks are saved in Earlier</Txt>
              </View>
            ) : (
              <Figure src={look.avatar} height={290} />
            )}
            <View style={{ position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pill label={busy ? 'Regenerating' : `Look ${i + 1} of 3`} />
              <View style={{ flex: 1 }} />
              <IconButton name={liked[look.id] ? 'heart.fill' : 'heart'} label="Save to Liked" size={32}
                color={liked[look.id] ? C.red : C.label} onPress={() => setLiked((l) => ({ ...l, [look.id]: !l[look.id] }))} />
              <Button title="Try on" icon="arrow.triangle.2.circlepath" kind="gray" small onPress={tryOn} />
            </View>
            {!busy && (
              <>
                <View style={{ position: 'absolute', left: 10 }}>
                  <IconButton name="chevron.left" label="Previous look" bg={C.bg} color={i ? C.label : C.tertiary} onPress={() => setI(Math.max(0, i - 1))} />
                </View>
                <View style={{ position: 'absolute', right: 10 }}>
                  <IconButton name="chevron.right" label="Next look" bg={C.bg} color={i < 2 ? C.label : C.tertiary} onPress={() => setI(Math.min(2, i + 1))} />
                </View>
                <View style={{ position: 'absolute', bottom: 10, flexDirection: 'row', gap: 6 }}>
                  {[0, 1, 2].map((d) => (
                    <View key={d} style={{ width: d === i ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: d === i ? C.label : C.separator }} />
                  ))}
                </View>
              </>
            )}
          </View>
          <Pressable onPress={openPieces} disabled={busy} style={{ height: 48, borderTopWidth: 0.5, borderColor: C.separator, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="chevron.up" size={13} weight="semibold" />
            <Txt v="subheadBold">
              {busy ? 'Hang on, this takes a few seconds' : `${pieces.length} pieces · ${attention ? `${attention} need${attention > 1 ? "" : "s"} attention` : 'all ready'}`}
            </Txt>
          </Pressable>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="New looks" icon="arrow.clockwise" kind="gray" onPress={regenerate} disabled={busy} style={{ flex: 1 }} />
          <Button title={`Save to ${day.replace(/^\w+ /, '')}`} icon="calendar" onPress={save} disabled={busy} style={{ flex: 1.4 }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 22, paddingLeft: 16, paddingRight: 6, height: 46 }}>
          <TextInput value={refine} onChangeText={setRefine} placeholder={'Refine: “no belt”, “something lighter”'} placeholderTextColor={C.tertiary}
            style={{ ...T.subhead, flex: 1 }} returnKeyType="send" onSubmitEditing={() => refine.trim() && regenerate()} />
          <IconButton name="arrow.up" label="Refine looks" size={32} bg={refine ? C.blue : C.label} color="#fff" onPress={() => refine.trim() && regenerate()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Bubble({ text }: { text: string }) {
  return (
    <View style={{ alignSelf: 'flex-end', maxWidth: '80%', backgroundColor: C.blue, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 }}>
      <Txt c="#fff">{text}</Txt>
    </View>
  );
}
