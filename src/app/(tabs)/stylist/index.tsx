import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TODAY } from '@/data';
import { fmt, parse, useApp } from '@/store';
import { C, T } from '@/theme';
import { Button, Card, IconButton, Pill, Txt, s } from '@/ui';

export default function StylistHome() {
  const { upNext: next } = useApp();
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const eventPrompt = `Style me for the ${next.title} on ${fmt(next.date, { weekday: 'long' })}. ${next.dressCode}.`;

  const send = (text: string) => {
    setPrompt('');
    router.push({ pathname: '/stylist/looks', params: { prompt: text, event: next.id } });
  };

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ title: 'Stylist', headerShown: false }} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={-80}>
        <ScrollView contentContainerStyle={[s.pad, { paddingTop: insets.top + 12 }]} keyboardDismissMode="interactive">
          <View style={s.rowBetween}>
            <View>
              <Txt v="footnoteBold" c={C.secondary}>{fmt(TODAY, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Txt>
              <Txt v="largeTitle">Hi, Caleb</Txt>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <IconButton name="figure.stand" label="Body profile" bg={C.card} onPress={() => router.push('/stylist/body-profile')} />
              <IconButton name="c.circle.fill" label="Menu and chat history" bg={C.blueSoft} color={C.blue} onPress={() => router.push('/menu')} />
            </View>
          </View>

          <Card style={{ gap: 12 }}>
            <View style={s.rowBetween}>
              <Txt v="footnoteBold" c={C.secondary}>Up next</Txt>
              {next.outfit ? <Pill label="Outfit planned" tone="blue" icon="checkmark" /> : <Pill label="No outfit yet" tone="warn" />}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 44, height: 48, borderRadius: 10, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Txt v="caption" c={C.blue}>{fmt(next.date, { weekday: 'short' }).toUpperCase()}</Txt>
                <Txt v="title3" c={C.blue}>{parse(next.date).getDate()}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="headline">{next.title}</Txt>
                <Txt v="footnote" c={C.secondary}>{next.time} · {next.dressCode}</Txt>
              </View>
            </View>
            <Button title="Style me for this event" icon="sparkles" onPress={() => send(eventPrompt)} />
          </Card>
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 70 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 22, paddingLeft: 16, paddingRight: 6, minHeight: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder={'Tell me about your event, like “career fair on Friday”'}
              placeholderTextColor={C.tertiary}
              style={{ ...T.body, flex: 1, paddingVertical: 12 }}
              multiline
              returnKeyType="send"
              submitBehavior="submit"
              onSubmitEditing={() => prompt.trim() && send(prompt.trim())}
            />
            <IconButton name="arrow.up" label="Send" bg={prompt ? C.blue : C.fill} color={prompt ? '#fff' : C.tertiary} size={34} onPress={() => prompt.trim() && send(prompt.trim())} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
