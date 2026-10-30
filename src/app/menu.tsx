import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { CHATS } from '@/data';
import { C, T } from '@/theme';
import { Caption, Group, Icon, IconButton, Row, Txt, s } from '@/ui';

// Stylist side menu: new chat, chat history, body profile.
export default function Menu() {
  const [q, setQ] = useState('');
  const chats = CHATS.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  const open = (path: '/stylist' | '/stylist/body-profile') => {
    router.back();
    router.navigate(path);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      <View style={s.rowBetween}>
        <Txt v="title2">Stylist</Txt>
        <IconButton name="xmark" label="Close" size={30} onPress={() => router.back()} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.fill, borderRadius: 10, paddingHorizontal: 8, height: 36 }}>
        <Icon name="magnifyingglass" size={15} color={C.secondary} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search chats" placeholderTextColor={C.secondary} style={{ ...T.body, flex: 1 }} clearButtonMode="while-editing" />
      </View>
      <Group>
        <Row title="New chat" tint={C.blue} left={<Icon name="square.and.pencil" color={C.blue} />} onPress={() => open('/stylist')} />
        <Row title="Body profile" left={<Icon name="figure.stand" color={C.blue} />} chevron onPress={() => open('/stylist/body-profile')} />
      </Group>
      <Caption>Recents</Caption>
      <Group>
        {chats.map((c) => <Row key={c.title} title={c.title} value={c.when} onPress={() => open('/stylist')} />)}
      </Group>
      {!chats.length && <Txt v="footnote" c={C.secondary} style={{ textAlign: 'center' }}>No chats match “{q}”.</Txt>}
    </ScrollView>
  );
}
