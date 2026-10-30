import { ContentUnavailableView, Form, Section, useNativeState } from '@expo/ui/swift-ui';
import { searchable } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { useState } from 'react';

import { CHATS } from '@/data';
import { C } from '@/theme';
import { Row, Sheet } from '@/ui';

// Stylist side menu: new chat, chat history, body profile.
export default function Menu() {
  const search = useNativeState('');
  const [q, setQ] = useState('');
  const chats = CHATS.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  const open = (path: '/stylist' | '/stylist/body-profile') => {
    router.back();
    router.navigate(path);
  };

  return (
    <Sheet title="Stylist" close modifiers={[searchable(search, { placement: 'navigationBarDrawer', prompt: 'Search chats', onChange: setQ })]}>
      <Form>
        {!q && (
          <Section>
            <Row title="New chat" tint={C.blue} icon="square.and.pencil" onPress={() => open('/stylist')} />
            <Row title="Body profile" icon="figure.stand" chevron onPress={() => open('/stylist/body-profile')} />
          </Section>
        )}
        {chats.length ? (
          <Section title="Recents">
            {chats.map((c) => <Row key={c.title} title={c.title} value={c.when} onPress={() => open('/stylist')} />)}
          </Section>
        ) : (
          <ContentUnavailableView title={`No results for “${q}”`} systemImage="magnifyingglass" description="Check the spelling or try a new search." />
        )}
      </Form>
    </Sheet>
  );
}
