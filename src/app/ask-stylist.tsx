import { Button, HStack, ScrollView, Spacer, Text, TextField, VStack, useNativeState } from '@expo/ui/swift-ui';
import {
  background, buttonBorderShape, buttonStyle, controlSize, defaultScrollAnchor, disabled, foregroundStyle, frame,
  glassEffect, labelStyle, onSubmit, padding, scrollDismissesKeyboard, shapes, submitLabel,
} from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { useState } from 'react';

import type { Event, Item } from '@/data';
import { eve, fmt, useApp } from '@/store';
import { C } from '@/theme';
import { CTA, Sheet, secondary, setNative } from '@/ui';

type Msg = { me: boolean; text: string; swap?: Item };

const RELAXED = /T-shirt|Hoodie/;
const lc = (x: string) => x.toLowerCase().replace('t-shirt', 'T-shirt');

// ponytail: scripted replies stand in for the real stylist model.
function reply(q: string, top: Item, shoes: Item, event: Event, items: Item[]): Omit<Msg, 'me'> {
  const day = fmt(event.date, { weekday: 'long' });
  const code = lc(event.dressCode);
  if (/rain|weather|forecast/i.test(q)) return { text: `${day} looks like 31°C with a 60% chance of rain from 5 PM. Keep the ${lc(top.name)}, and bring an umbrella for the walk over.` };
  // Swap suggestions: a clean, undamaged, collared top that suits the dress code. Ironing can happen the night before.
  const alt = items.find((i) => i.category === 'Tops' && i.id !== top.id && !i.issue && !i.wash && !RELAXED.test(i.kind) && i.tags.includes(event.dressCode));
  const prep = alt?.iron ? `It’s clean and just needs a quick iron. We’ll remind you on ${fmt(eve(event.date), { weekday: 'long' })} night.` : 'It’s clean and ready to wear.';
  // A flaw caught when the top was scanned comes first, whether he's wearing it or asking about it.
  const asked = items.find((i) => i.category === 'Tops' && i.id !== top.id && q.toLowerCase().includes(i.name.toLowerCase()));
  const why = (t: Item) => (alt?.kind === 'Polo' && /shirt/i.test(t.kind) ? 'It keeps the look neat but less stiff.' : `It’s right for ${code}.`);
  if (asked?.flaw && alt) return { text: `Your ${lc(asked.name)} still has the ${asked.flaw.toLowerCase()} we spotted when you scanned it. Try your ${lc(alt.name)} instead. ${why(asked)} ${prep}`, swap: alt };
  if (asked && !asked.issue) return { text: `Your ${lc(asked.name)} works for ${code}. ${asked.wash ? 'It needs a wash first, though.' : 'It’s clean and ready.'}`, swap: asked.wash ? undefined : asked };
  if (top.flaw && alt) return { text: `Heads up: your ${lc(top.name)} still has the ${top.flaw.toLowerCase()} we spotted when you scanned it. Try your ${lc(alt.name)} instead. ${why(top)} ${prep}`, swap: alt };
  // A tee or hoodie reads too relaxed for anything dressier than casual.
  if (RELAXED.test(top.kind) && event.dressCode !== 'Casual' && alt) {
    return { text: `A plain ${lc(top.kind)} can look too relaxed for ${code}. Try your ${lc(alt.name)} instead, the collar keeps it neat. ${prep}`, swap: alt };
  }
  if (/formal/i.test(q)) return { text: `Not too formal. A ${lc(top.name)} with long pants sits right at ${code}, which matches the dress code.` };
  if (/shoe/i.test(q)) return { text: `Keep the ${lc(shoes.name)}. They’re clean, and leather shoes keep the look sharp.` };
  return { text: `Yes, the ${lc(top.name)} works for the ${lc(event.title)}. It’s neat without looking stiff.` };
}

const bubbleShape = shapes.roundedRectangle({ cornerRadius: 18, roundedCornerStyle: 'continuous' });

export default function AskStylist() {
  const { preview, setPreview, item, items, upNext, showToast } = useApp();
  const top = item(preview[0]);
  const day = fmt(upNext.date, { weekday: 'long' });
  // A top he owns but can't wear yet is the one he's likeliest to ask about.
  const flawed = items.find((i) => i.category === 'Tops' && i.flaw && i.id !== top.id);
  const quick = [flawed && `What about my ${lc(flawed.name)}?`, `Is this OK for ${day}?`, 'Will it rain?', 'Swap the shoes?'].filter((q): q is string => !!q);
  const [msgs, setMsgs] = useState<Msg[]>([{
    me: false,
    text: `You’re wearing the ${lc(top.name)}, ${lc(item(preview[1]).name)} and ${lc(item(preview[2]).name)} for ${day}’s ${lc(upNext.title)} (${lc(upNext.dressCode)}). What would you like to know?`,
  }]);
  const [typing, setTyping] = useState(false);
  const text = useNativeState('');
  const [draft, setDraft] = useState('');

  const send = (q: string) => {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { me: true, text: q.trim() }]);
    setNative(text, '');
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { me: false, ...reply(q, top, item(preview[2]), upNext, items) }]);
      setTyping(false);
    }, 1200);
  };

  const swap = (to: Item) => {
    setPreview([to.id, ...preview.slice(1)]);
    router.back();
    showToast(`Swapped to your ${lc(to.name)}`);
  };

  const bubble = (m: Msg, key: number) => (
    <HStack key={key}>
      {m.me && <Spacer minLength={48} />}
      <VStack alignment="leading" spacing={8}>
        <Text modifiers={[foregroundStyle(m.me ? 'white' : C.label), padding({ horizontal: 14, vertical: 9 }), background(m.me ? C.blue : C.card, bubbleShape)]}>{m.text}</Text>
        {m.swap && preview[0] !== m.swap.id && (
          <HStack spacing={8}>
            <CTA label={`Swap to ${lc(m.swap.name)}`} icon="arrow.triangle.2.circlepath" small wide={false} onPress={() => swap(m.swap!)} />
            <CTA label="Keep this" kind="gray" small wide={false} onPress={() => setMsgs((ms) => ms.map((x, j) => (j === key ? { ...x, swap: undefined } : x)))} />
          </HStack>
        )}
      </VStack>
      {!m.me && <Spacer minLength={48} />}
    </HStack>
  );

  return (
    <Sheet title="Ask the Stylist" close>
      <VStack spacing={8} modifiers={[background(C.bg)]}>
        <ScrollView modifiers={[defaultScrollAnchor('bottom'), scrollDismissesKeyboard('interactively')]}>
          <VStack spacing={10} modifiers={[padding({ all: 16 })]}>
            {msgs.map(bubble)}
            {typing && (
              <HStack>
                <Text modifiers={[secondary, padding({ horizontal: 14, vertical: 9 }), background(C.card, bubbleShape)]}>Typing…</Text>
                <Spacer />
              </HStack>
            )}
          </VStack>
        </ScrollView>
        <ScrollView axes="horizontal" showsIndicators={false}>
          <HStack spacing={8} modifiers={[padding({ horizontal: 16 })]}>
            {quick.map((q) => (
              <Button key={q} label={q} onPress={() => send(q)} modifiers={[buttonStyle('bordered'), buttonBorderShape('capsule'), controlSize('small'), disabled(typing)]} />
            ))}
          </HStack>
        </ScrollView>
        <HStack spacing={8} modifiers={[padding({ leading: 16, trailing: 6, vertical: 6 }), glassEffect({ glass: { variant: 'regular' }, shape: 'capsule' }), padding({ horizontal: 16, bottom: 8 })]}>
          <TextField text={text} onTextChange={setDraft} placeholder="Ask about this outfit"
            modifiers={[submitLabel('send'), onSubmit(() => send(text.value)), padding({ vertical: 8 }), frame({ maxWidth: Infinity })]} />
          <Button label="Send" systemImage="arrow.up" onPress={() => send(text.value)}
            modifiers={[labelStyle('iconOnly'), buttonStyle('borderedProminent'), buttonBorderShape('circle'), disabled(!draft.trim() || typing)]} />
        </HStack>
      </VStack>
    </Sheet>
  );
}
