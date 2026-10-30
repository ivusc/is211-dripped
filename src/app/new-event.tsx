import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { TODAY } from '@/data';
import { parse, shortDay, useApp, ymd } from '@/store';
import { C, T } from '@/theme';
import { Button, Caption, Chip, Group, IconButton, Txt, s } from '@/ui';

const CODES = ['Casual', 'Smart casual', 'Formal', 'No dress code'];
const TIMES = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '7:30 PM'];

// ponytail: chip time + day stepper instead of a native DateTimePicker (needs @react-native-community/datetimepicker).
export default function NewEvent() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { setEvents, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState(date ?? TODAY);
  const [time, setTime] = useState(TIMES[2]);
  const [code, setCode] = useState(CODES[1]);

  const shift = (n: number) => {
    const d = parse(day);
    d.setDate(d.getDate() + n);
    setDay(ymd(d));
  };

  const add = () => {
    setEvents((es) => [...es, { id: `e${Date.now()}`, title: title.trim(), location: location.trim() || undefined, date: day, time, dressCode: code, optional: code === 'No dress code' }]);
    router.back();
    showToast(`${title.trim()} added to ${shortDay(day)}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header lives inside the ScrollView: a formSheet lays its ScrollView over any sibling above it. */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }} keyboardShouldPersistTaps="handled">
        <View style={[s.rowBetween, { paddingTop: 16, paddingBottom: 8 }]}>
          <Button title="Cancel" kind="plain" small onPress={() => router.back()} />
          <Txt v="headline">New event</Txt>
          <Button title="Add" kind="plain" small disabled={!title.trim()} onPress={add} style={{ backgroundColor: 'transparent' }} />
        </View>
        <Group>
          <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={C.tertiary} autoFocus style={[s.row, T.body]} />
          <TextInput value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor={C.tertiary} style={[s.row, T.body]} />
        </Group>
        <Caption>Date</Caption>
        <Group>
          <View style={s.row}>
            <Txt style={{ flex: 1 }}>{shortDay(day)}</Txt>
            <IconButton name="chevron.left" label="Previous day" size={30} onPress={() => shift(-1)} />
            <IconButton name="chevron.right" label="Next day" size={30} onPress={() => shift(1)} />
          </View>
        </Group>
        <Caption>Time</Caption>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TIMES.map((t) => <Chip key={t} label={t} on={t === time} onPress={() => setTime(t)} />)}
        </View>
        <Caption>Dress code</Caption>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CODES.map((c) => <Chip key={c} label={c} on={c === code} onPress={() => setCode(c)} />)}
        </View>
        <Txt v="footnote" c={C.secondary} style={{ marginTop: 12, marginHorizontal: 4 }}>The stylist uses the dress code to pick looks for this event.</Txt>
      </ScrollView>
    </View>
  );
}
