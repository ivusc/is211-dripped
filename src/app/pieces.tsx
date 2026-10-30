import { Form, Section, Text } from '@expo/ui/swift-ui';
import { router, useLocalSearchParams } from 'expo-router';

import { DECK } from '@/data';
import { isReady, shortDay, statusLabel, useApp } from '@/store';
import { Actions, CTA, Note, Pill, Row, Sheet, sub } from '@/ui';

// Bottom sheet listing the pieces of a look (Stylist 1.4 and Down to Dress 4.2).
export default function Pieces() {
  const { pieces, title, date, deck } = useLocalSearchParams<{ pieces: string; title: string; date?: string; deck?: string }>();
  const { item, owns, setPreview, liked, setLiked } = useApp();
  const ids = pieces.split(',');
  const look = DECK.find((d) => d.id === deck);
  const ironing = ids.map(item).find((i) => i.iron);
  const gaps = ids.filter((id) => !owns(id) || !isReady(item(id))).map((id) => item(id).name.toLowerCase());
  const summary = look
    ? `You own ${ids.filter(owns).length} of ${ids.length} pieces.${gaps.length ? ` Recreate swaps in your closest match for the ${gaps.join(' and ')}.` : ''}`
    : `All ${ids.length} pieces are from your wardrobe`;

  return (
    <Sheet title={title} close>
      <Form>
        <Section header={<Text modifiers={sub}>{summary}</Text>}
          footer={ironing && !look ? <Note icon="bell">{`We’ll remind you the night before at 8 PM to iron the ${ironing.name.toLowerCase()}.`}</Note> : undefined}>
          {ids.map((id) => {
            const i = item(id);
            const status = statusLabel(i);
            const mine = owns(id);
            return (
              <Row key={id} title={i.name} thumb={id} chevron={!look}
                subtitle={!look ? `${i.category.slice(0, -1)} · ${i.material}`
                  : !mine ? 'Not in your wardrobe'
                  : status !== 'Ready' ? `Yours is ${status.toLowerCase()}` : `${i.category.slice(0, -1)} · ${i.colour}`}
                right={<Pill label={look && !mine ? 'Not owned' : look && status === 'Ready' ? 'You own' : status} tone={mine && status === 'Ready' ? 'ok' : 'warn'}
                  icon={look && mine && status === 'Ready' ? 'checkmark' : undefined} />}
                onPress={look ? undefined : () => router.push(`/item/${id}`)} />
            );
          })}
        </Section>
        <Actions>
          {look ? (
            <>
              <CTA label="Recreate with my clothes" icon="sparkles" onPress={() => { router.back(); router.push({ pathname: '/dress/recreate', params: { deck: look.id } }); }} />
              <CTA label={liked[look.id] ? 'Liked' : 'Like'} icon={liked[look.id] ? 'heart.fill' : 'heart'} kind="gray" onPress={() => setLiked((l) => ({ ...l, [look.id]: !l[look.id] }))} />
            </>
          ) : (
            <>
              <CTA label={date ? `Save to ${shortDay(date)}` : 'Save to a date'} icon="calendar"
                onPress={() => { router.back(); router.push({ pathname: '/save-look', params: { pieces, name: title, date } }); }} />
              <CTA label="Try On" kind="gray" onPress={() => { setPreview(ids); router.back(); router.navigate('/preview'); }} />
            </>
          )}
        </Actions>
      </Form>
    </Sheet>
  );
}
