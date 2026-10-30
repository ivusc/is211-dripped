import { router, useLocalSearchParams } from 'expo-router';
import { ActionSheetIOS, Alert, ScrollView, View } from 'react-native';

import { isReady, shortDay, statusLabel, useApp } from '@/store';
import { C } from '@/theme';
import { Button, Caption, Card, Garment, Group, Icon, IconButton, Pill, Row, Txt, s } from '@/ui';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, updateItem, setItems, withUndo, plannedFor } = useApp();
  const i = items.find((x) => x.id === id);
  if (!i) return null; // removed while open
  const plan = plannedFor(i.id);

  const mark = (field: 'wash' | 'iron') => {
    const verb = field === 'wash' ? 'washed' : 'ironed';
    Alert.alert(`Mark ${i.name.toLowerCase()} as ${verb}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Mark as ${verb}`, onPress: () => withUndo(`${i.name} marked as ${verb}`, () => updateItem(i.id, { [field]: false })) },
    ]);
  };

  const notReady = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'What’s wrong with it?', options: ['Needs washing', 'Needs ironing', 'Has a hole', 'Cancel'], cancelButtonIndex: 3 },
      (n) => {
        const patch = [{ wash: true }, { iron: true }, { issue: 'Has a hole' }][n];
        if (patch) withUndo(`${i.name} marked not ready`, () => updateItem(i.id, patch));
      },
    );

  const remove = () =>
    Alert.alert(`Remove ${i.name.toLowerCase()}?`, plan ? `It’s planned for ${plan.title}.` : 'You can undo this right after.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { router.back(); withUndo(`${i.name} removed`, () => setItems((xs) => xs.filter((x) => x.id !== i.id))); } },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <Txt v="title2">{i.name}</Txt>
          <Txt v="subhead" c={C.secondary}>{i.kind} · {i.material} · {i.colour}</Txt>
        </View>
        <IconButton name="xmark" label="Close" size={30} onPress={() => router.back()} />
      </View>
      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Garment id={i.id} size={150} />
        <View style={{ position: 'absolute', top: 12, left: 12 }}>
          <Pill label={statusLabel(i)} tone={isReady(i) ? 'ok' : 'warn'} icon={isReady(i) ? 'checkmark' : 'exclamationmark.triangle.fill'} />
        </View>
      </Card>
      {plan && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.blueSoft }}>
          <Icon name="calendar" color={C.blue} />
          <Txt v="subhead" c={C.blue} style={{ flex: 1 }}>Planned for {plan.title} · {shortDay(plan.date)}</Txt>
        </Card>
      )}
      <Group>
        <Row title="Clean" value={i.wash ? 'Needs washing' : 'Yes'} right={i.wash ? <Button title="Mark washed" kind="tinted" small onPress={() => mark('wash')} /> : undefined} />
        <Row title="Ironed" value={i.iron ? 'Needs ironing' : 'Yes'} right={i.iron ? <Button title="Mark ironed" kind="tinted" small onPress={() => mark('iron')} /> : undefined} />
        {i.issue ? <Row title="Issue" value={i.issue} subtitle={i.flaw} right={<Button title="Fixed" kind="tinted" small onPress={() => withUndo(`${i.name} marked as fixed`, () => updateItem(i.id, { issue: undefined }))} />} /> : null}
        <Row title="Condition" value={i.condition} />
        <Row title="Last worn" value={i.lastWorn} />
      </Group>
      <Caption>Style tags</Caption>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 4 }}>
        {i.tags.map((t) => <Pill key={t} label={t} />)}
      </View>
      <Button title="Style a look with this" icon="sparkles" style={{ marginTop: 8 }}
        onPress={() => { router.back(); router.navigate({ pathname: '/stylist/looks', params: { prompt: `Style a look with my ${i.name.toLowerCase()}` } }); }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {isReady(i) && <Button title="Mark not ready" kind="gray" style={{ flex: 1 }} onPress={notReady} />}
        <Button title="Remove" kind="destructive" style={{ flex: 1 }} onPress={remove} />
      </View>
    </ScrollView>
  );
}
