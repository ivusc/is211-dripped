import { ContentUnavailableView, Form, Grid, HStack, Image, Picker, Section, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { background, frame, lineLimit, listRowBackground, onTapGesture, padding, pickerStyle, shapes, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { DRIPS } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { Figure, RN, Screen, f, sub } from '@/ui';

const TAGS = ['All', 'Formal', 'Smart casual', 'Casual'];

export default function OldDrips() {
  const { liked } = useApp();
  const [tab, setTab] = useState<'Worn' | 'Liked'>('Worn');
  const [dressCode, setDressCode] = useState('All');
  const shown = DRIPS.filter((d) => (tab === 'Worn' || liked[d.id]) && (dressCode === 'All' || d.tag === dressCode));
  const rows = Array.from({ length: Math.ceil(shown.length / 2) }, (_, r) => shown.slice(r * 2, r * 2 + 2));

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Old drips' }} />
      <Form>
        <Section>
          <Picker selection={tab} onSelectionChange={setTab} modifiers={[pickerStyle('segmented')]}>
            <Text modifiers={[tag('Worn')]}>Worn</Text>
            <Text modifiers={[tag('Liked')]}>Liked</Text>
          </Picker>
          <Picker label="Dress code" selection={dressCode} onSelectionChange={setDressCode} modifiers={[pickerStyle('menu')]}>
            {TAGS.map((t) => <Text key={t} modifiers={[tag(t)]}>{t}</Text>)}
          </Picker>
        </Section>

        <Section modifiers={[listRowBackground('clear')]}>
          {shown.length === 0 ? (
            <ContentUnavailableView title="Nothing here yet" systemImage={tab === 'Liked' ? 'heart' : 'tshirt'}
              description={tab === 'Liked' ? 'Looks you like in Down to Dress show up here.' : 'Outfits you wear show up here.'} />
          ) : (
            <Grid horizontalSpacing={12} verticalSpacing={12}>
              {rows.map((r) => (
                <Grid.Row key={r[0].id}>
                  {r.map((d) => (
                    <VStack key={d.id} alignment="leading" spacing={6}
                      modifiers={[padding({ all: 12 }), frame({ maxWidth: Infinity }), background(C.card, shapes.roundedRectangle({ cornerRadius: 16, roundedCornerStyle: 'continuous' })), onTapGesture(() => router.push(`/preview/drip/${d.id}`))]}>
                      <ZStack alignment="topTrailing" modifiers={[frame({ maxWidth: Infinity }), padding({ vertical: 8 }), background(C.bg, shapes.roundedRectangle({ cornerRadius: 12, roundedCornerStyle: 'continuous' }))]}>
                        <HStack><Spacer /><RN><Figure src={d.avatar} height={170} /></RN><Spacer /></HStack>
                        {liked[d.id] && <Image systemName="heart.fill" size={15} color={C.red} modifiers={[padding({ all: 8 })]} />}
                      </ZStack>
                      <Text modifiers={[f('subheadline', 'semibold'), lineLimit(1)]}>{d.name}</Text>
                      <Text modifiers={sub}>{`${d.short} · ${d.tag}`}</Text>
                    </VStack>
                  ))}
                  {r.length === 1 && <Spacer />}
                </Grid.Row>
              ))}
            </Grid>
          )}
        </Section>
      </Form>
    </Screen>
  );
}
