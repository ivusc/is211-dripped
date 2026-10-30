import { Form, Picker, Section, Text, Toggle, useNativeState } from '@expo/ui/swift-ui';
import { pickerStyle, searchable, tag } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';

import type { Category } from '@/data';
import { matches, useApp } from '@/store';
import { Sheet, sub, setNative } from '@/ui';

const CATS = ['All', 'Tops', 'Bottoms', 'Shoes'] as const;
const OCCASIONS = ['Any', 'Casual', 'Smart casual', 'Formal', 'Campus'];

export default function Filters() {
  const { filters: f, setFilters, items } = useApp();
  const q = useNativeState(f.q ?? '');
  const count = items.filter((i) => matches(i, f)).length;

  return (
    <Sheet title="Filter"
      cancel={{ label: 'Reset', onPress: () => { setNative(q, ''); setFilters({ wash: false, iron: false }); } }}
      confirm={{ label: 'Done', onPress: () => router.back() }}
      modifiers={[searchable(q, { placement: 'navigationBarDrawer', prompt: 'Search your clothes', onChange: (v) => setFilters({ ...f, q: v || undefined }) })]}>
      <Form>
        <Section title="Category">
          <Picker selection={f.category ?? 'All'} onSelectionChange={(c) => setFilters({ ...f, category: c === 'All' ? undefined : (c as Category) })}
            modifiers={[pickerStyle('segmented')]}>
            {CATS.map((c) => <Text key={c} modifiers={[tag(c)]}>{c}</Text>)}
          </Picker>
        </Section>
        <Section title="Status">
          <Toggle label="Needs washing" isOn={f.wash} onIsOnChange={(wash) => setFilters({ ...f, wash })} />
          <Toggle label="Needs ironing" isOn={f.iron} onIsOnChange={(iron) => setFilters({ ...f, iron })} />
        </Section>
        <Section footer={<Text modifiers={sub}>{`${count} item${count === 1 ? '' : 's'} match`}</Text>}>
          <Picker label="Occasion" selection={f.occasion ?? 'Any'} onSelectionChange={(o) => setFilters({ ...f, occasion: o === 'Any' ? undefined : o })}
            modifiers={[pickerStyle('menu')]}>
            {OCCASIONS.map((o) => <Text key={o} modifiers={[tag(o)]}>{o}</Text>)}
          </Picker>
        </Section>
      </Form>
    </Sheet>
  );
}
