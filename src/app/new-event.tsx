import { DatePicker, Form, Picker, Section, Text, TextField } from '@expo/ui/swift-ui';
import { pickerStyle, tag, textInputAutocapitalization } from '@expo/ui/swift-ui/modifiers';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { TODAY } from '@/data';
import { parse, shortDay, useApp, ymd } from '@/store';
import { Sheet, sub } from '@/ui';

const CODES = ['Casual', 'Smart casual', 'Formal', 'No dress code'];

export default function NewEvent() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { setEvents, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [when, setWhen] = useState(() => {
    const d = parse(date ?? TODAY);
    d.setHours(15, 0);
    return d;
  });
  const [code, setCode] = useState(CODES[1]);

  const add = () => {
    const day = ymd(when);
    const time = when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setEvents((es) => [...es, { id: `e${Date.now()}`, title: title.trim(), location: location.trim() || undefined, date: day, time, dressCode: code, optional: code === 'No dress code' }]);
    router.back();
    showToast(`${title.trim()} added to ${shortDay(day)}`);
  };

  return (
    <Sheet title="New Event" cancel={{ label: 'Cancel', onPress: () => router.back() }} confirm={{ label: 'Add', onPress: add, disabled: !title.trim() }}>
      <Form>
        <Section>
          <TextField placeholder="Title" autoFocus onTextChange={setTitle} modifiers={[textInputAutocapitalization('sentences')]} />
          <TextField placeholder="Location" onTextChange={setLocation} />
        </Section>
        <Section>
          <DatePicker title="Starts" selection={when} onDateChange={setWhen} displayedComponents={['date', 'hourAndMinute']} />
        </Section>
        <Section footer={<Text modifiers={sub}>The stylist uses the dress code to pick looks for this event.</Text>}>
          <Picker label="Dress code" selection={code} onSelectionChange={setCode} modifiers={[pickerStyle('menu')]}>
            {CODES.map((c) => <Text key={c} modifiers={[tag(c)]}>{c}</Text>)}
          </Picker>
        </Section>
      </Form>
    </Sheet>
  );
}
