import { router } from 'expo-router';
import { ScrollView, Switch, TextInput, View } from 'react-native';

import type { Category } from '@/data';
import { matches, useApp } from '@/store';
import { C, T } from '@/theme';
import { Button, Caption, Chip, Group, Icon, Row, Txt, s } from '@/ui';

const CATS: Category[] = ['Tops', 'Bottoms', 'Shoes'];
const OCCASIONS = ['Casual', 'Smart casual', 'Formal', 'Campus'];

export default function Filters() {
  const { filters: f, setFilters, items } = useApp();
  const count = items.filter((i) => matches(i, f)).length;

  return (
    <View style={{ flex: 1 }}>
      {/* Header lives inside the ScrollView: a formSheet lays its ScrollView over any sibling above it. */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }} keyboardShouldPersistTaps="handled">
        <View style={[s.rowBetween, { paddingTop: 16, paddingBottom: 8 }]}>
          <Button title="Reset" kind="plain" small onPress={() => setFilters({ wash: false, iron: false })} />
          <Txt v="headline">Filter</Txt>
          <Button title="Done" kind="plain" small onPress={() => router.back()} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 10, borderRadius: 10, backgroundColor: C.fill }}>
          <Icon name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput value={f.q ?? ''} onChangeText={(q) => setFilters({ ...f, q })} placeholder="Search your clothes" placeholderTextColor={C.secondary}
            returnKeyType="search" clearButtonMode="while-editing" autoCapitalize="none" autoCorrect={false} style={{ ...T.body, flex: 1, color: C.label }} />
        </View>
        <Caption>Category</Caption>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="All" on={!f.category} onPress={() => setFilters({ ...f, category: undefined })} />
          {CATS.map((c) => <Chip key={c} label={c} on={f.category === c} onPress={() => setFilters({ ...f, category: c })} />)}
        </View>
        <Caption>Status</Caption>
        <Group>
          <Row title="Needs washing" right={<Switch value={f.wash} onValueChange={(wash) => setFilters({ ...f, wash })} />} />
          <Row title="Needs ironing" right={<Switch value={f.iron} onValueChange={(iron) => setFilters({ ...f, iron })} />} />
        </Group>
        <Caption>Occasion</Caption>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {OCCASIONS.map((o) => <Chip key={o} label={o} on={f.occasion === o} onPress={() => setFilters({ ...f, occasion: f.occasion === o ? undefined : o })} />)}
        </View>
        <Txt v="footnote" c={C.secondary} style={{ marginTop: 12, textAlign: 'center' }}>{count} items match</Txt>
      </ScrollView>
    </View>
  );
}
