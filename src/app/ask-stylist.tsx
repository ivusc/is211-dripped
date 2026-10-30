import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import type { Event, Item } from '@/data';
import { eve, fmt, useApp } from '@/store';
import { C, T } from '@/theme';
import { Button, Chip, IconButton, KeyboardScreen, Txt, s } from '@/ui';

type Msg = { me: boolean; text: string; swap?: Item };

const RELAXED = /T-shirt|Hoodie/;
const lc = (x: string) => x.toLowerCase().replace('t-shirt', 'T-shirt');

// ponytail: scripted replies stand in for the real stylist model.
function reply(q: string, top: Item, shoes: Item, event: Event, items: Item[]): Omit<Msg, 'me'> {
  const day = fmt(event.date, { weekday: 'long' });
  const code = lc(event.dressCode);
  if (/rain|weather|forecast/i.test(q)) return { text: `${day} looks like 31°C with a 60% chance of rain from 5 PM. Keep the ${lc(top.name)}, and bring an umbrella for the walk over.` };
  // Swap suggestions: a clean, undamaged, collared top that suits the dress code. Ironing can happen the night before.
  const alt = items.find((i) => i.category === 'Tops' && !i.issue && !i.wash && !RELAXED.test(i.kind) && i.tags.includes(event.dressCode));
  const prep = alt?.iron ? `It’s clean and just needs a quick iron. We’ll remind you on ${fmt(eve(event.date), { weekday: 'long' })} night.` : 'It’s clean and ready to wear.';
  // A flaw caught when the top was scanned comes first.
  const why = alt?.kind === 'Polo' && /shirt/i.test(top.kind) ? 'It keeps the look neat but less stiff.' : `It’s right for ${code}.`;
  if (top.flaw && alt) return { text: `Heads up: your ${lc(top.name)} still has the ${top.flaw.toLowerCase()} we spotted when you scanned it. Try your ${lc(alt.name)} instead. ${why} ${prep}`, swap: alt };
  // A tee or hoodie reads too relaxed for anything dressier than casual.
  if (RELAXED.test(top.kind) && event.dressCode !== 'Casual' && alt) {
    return { text: `A plain ${lc(top.kind)} can look too relaxed for ${code}. Try your ${lc(alt.name)} instead, the collar keeps it neat. ${prep}`, swap: alt };
  }
  if (/formal/i.test(q)) return { text: `Not too formal. A ${lc(top.name)} with long pants sits right at ${code}, which matches the dress code.` };
  if (/shoe/i.test(q)) return { text: `Keep the ${lc(shoes.name)}. They’re clean, and leather shoes keep the look sharp.` };
  return { text: `Yes, the ${lc(top.name)} works for the ${lc(event.title)}. It’s neat without looking stiff.` };
}

export default function AskStylist() {
  const { preview, setPreview, item, items, upNext, showToast } = useApp();
  const top = item(preview[0]);
  const day = fmt(upNext.date, { weekday: 'long' });
  const quick = [`Is this OK for ${day}?`, 'Will it rain?', 'Swap the shoes?'];
  const [msgs, setMsgs] = useState<Msg[]>([{
    me: false,
    text: `You’re wearing the ${lc(top.name)}, ${lc(item(preview[1]).name)} and ${lc(item(preview[2]).name)} for ${day}’s ${lc(upNext.title)} (${lc(upNext.dressCode)}). What would you like to know?`,
  }]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const send = (q: string) => {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { me: true, text: q.trim() }]);
    setText('');
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

  return (
    <KeyboardScreen>
      {/* Header lives inside the ScrollView: a formSheet lays its ScrollView over its siblings, so it also runs
          under the chips and input. The bottom padding keeps the last reply above them. */}
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 150, gap: 10 }} onContentSizeChange={() => scroll.current?.scrollToEnd()}>
        <View style={s.rowBetween}>
          <Txt v="headline">Ask the stylist</Txt>
          <IconButton name="xmark" label="Close" size={30} onPress={() => router.back()} />
        </View>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '82%', gap: 8 }}>
            <View style={{ backgroundColor: m.me ? C.blue : C.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 }}>
              <Txt c={m.me ? '#fff' : C.label}>{m.text}</Txt>
            </View>
            {m.swap && preview[0] !== m.swap.id && (
              <Button title={`Swap to ${lc(m.swap.name)}`} icon="arrow.triangle.2.circlepath" kind="tinted" small style={{ alignSelf: 'flex-start' }} onPress={() => swap(m.swap!)} />
            )}
          </View>
        ))}
        {typing && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: C.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 }}>
            <Txt c={C.secondary}>Typing…</Txt>
          </View>
        )}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 8 }} style={{ flexGrow: 0, flexShrink: 0 }}>
        {quick.map((q) => <Chip key={q} label={q} onPress={() => send(q)} />)}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 22, marginHorizontal: 16, paddingLeft: 16, paddingRight: 6, height: 46 }}>
        <TextInput value={text} onChangeText={setText} placeholder="Ask about this outfit" placeholderTextColor={C.tertiary}
          style={{ ...T.body, flex: 1 }} returnKeyType="send" onSubmitEditing={() => send(text)} />
        <IconButton name="arrow.up" label="Send" size={32} bg={text ? C.blue : C.separator} color="#fff" onPress={() => send(text)} />
      </View>
    </KeyboardScreen>
  );
}
