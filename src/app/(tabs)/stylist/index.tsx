import { Button, Form, HStack, Image, Section, Spacer, Text, TextField, VStack, ZStack, useNativeState } from '@expo/ui/swift-ui';
import {
  background, buttonBorderShape, buttonStyle, controlSize, disabled, foregroundStyle, frame, glassEffect,
  labelStyle, lineLimit, listRowBackground, onSubmit, padding, shapes, submitLabel,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { TODAY } from '@/data';
import { fmt, parse, useApp } from '@/store';
import { C } from '@/theme';
import { CTA, Pill, Screen, f, sub, setNative, tertiary } from '@/ui';

export default function StylistHome() {
  const { upNext: next } = useApp();
  const text = useNativeState('');
  const [prompt, setPrompt] = useState('');
  const eventPrompt = `Style me for the ${next.title.toLowerCase()} on ${fmt(next.date, { weekday: 'long' })}. ${next.dressCode}.`;
  const days = Math.round((parse(next.date).getTime() - parse(TODAY).getTime()) / 864e5);

  const send = (q: string) => {
    if (!q.trim()) return;
    setNative(text, '');
    setPrompt('');
    router.push({ pathname: '/stylist/looks', params: { prompt: q.trim(), event: next.id } });
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Hi, Caleb',
          unstable_headerRightItems: () => [
            { type: 'button', label: 'Body profile', icon: { type: 'sfSymbol', name: 'figure.stand' }, onPress: () => router.push('/stylist/body-profile') },
            { type: 'button', label: 'Chats', icon: { type: 'sfSymbol', name: 'bubble.left.and.text.bubble.right' }, onPress: () => router.push('/menu') },
          ],
        }}
      />
      <ZStack alignment="bottom">
        <Form>
          <Section title={`Up next · ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`}>
            {/* One row for the event and its button, so the Form draws no separator between them. */}
            <VStack spacing={14}>
              <HStack spacing={12}>
                <VStack spacing={0} modifiers={[frame({ width: 46, height: 50 }), background(C.blueSoft, shapes.roundedRectangle({ cornerRadius: 10, roundedCornerStyle: 'continuous' }))]}>
                  <Text modifiers={[f('caption2', 'semibold'), foregroundStyle(C.blue)]}>{fmt(next.date, { weekday: 'short' }).toUpperCase()}</Text>
                  <Text modifiers={[f('title3', 'semibold'), foregroundStyle(C.blue)]}>{String(parse(next.date).getDate())}</Text>
                </VStack>
                <VStack alignment="leading" spacing={3}>
                  <Text modifiers={[f('headline')]}>{next.title}</Text>
                  <Text modifiers={sub}>{`${next.time} · ${next.dressCode}`}</Text>
                  {next.outfit ? <Pill label="Outfit planned" tone="blue" icon="checkmark" /> : <Pill label="Needs an outfit" tone="warn" />}
                </VStack>
                <Spacer />
              </HStack>
              <CTA label="Style me for this event" icon="sparkles" onPress={() => send(eventPrompt)} />
            </VStack>
          </Section>
          <Section title="Try asking">
            {['What goes with my navy polo?', 'Smart casual for a presentation', 'What should I wash before Friday?'].map((q) => (
              <Button key={q} onPress={() => send(q)} modifiers={[buttonStyle('plain')]}>
                <HStack spacing={10}>
                  <Image systemName="text.bubble" color={C.blue} modifiers={[f('subheadline'), frame({ width: 20 })]} />
                  <Text modifiers={[f('subheadline')]}>{q}</Text>
                  <Spacer />
                  <Image systemName="chevron.right" modifiers={[f('caption', 'semibold'), tertiary]} />
                </HStack>
              </Button>
            ))}
          </Section>
          {/* Clear room at the end so the last row can scroll out from under the floating composer. */}
          <Section modifiers={[listRowBackground('clear')]}><Spacer modifiers={[frame({ height: 40 })]} /></Section>
        </Form>

        {/* Composer floats on glass over the list, above the tab bar, and rides up with the keyboard (SwiftUI keyboard safe area). */}
        <HStack spacing={8} alignment="bottom" modifiers={[padding({ leading: 16, trailing: 6, vertical: 6 }), glassEffect({ glass: { variant: 'regular' }, shape: 'roundedRectangle', cornerRadius: 24 }), padding({ horizontal: 16, bottom: 8 })]}>
          <TextField text={text} onTextChange={setPrompt} axis="vertical" placeholder="Tell me about your event, like “career fair on Friday”"
            modifiers={[lineLimit({ min: 1, max: 4 }), submitLabel('send'), onSubmit(() => send(text.value)), padding({ vertical: 8 })]} />
          <Button label="Send" systemImage="arrow.up" onPress={() => send(text.value)}
            modifiers={[labelStyle('iconOnly'), buttonStyle('borderedProminent'), buttonBorderShape('circle'), controlSize('regular'), disabled(!prompt.trim())]} />
        </HStack>
      </ZStack>
    </Screen>
  );
}
