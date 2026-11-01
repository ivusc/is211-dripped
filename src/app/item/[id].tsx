import { Button, ConfirmationDialog, Form, HStack, Label, Section, Spacer, Text, ZStack } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, foregroundStyle, frame } from '@expo/ui/swift-ui/modifiers';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { isReady, shortDay, statusLabel, useApp } from '@/store';
import { C } from '@/theme';
import { Actions, CTA, Garment, Pill, RN, Row, Sheet, sub } from '@/ui';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, updateItem, setItems, withUndo, plannedFor } = useApp();
  const [asking, setAsking] = useState(false);
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

  const notReady = (patch: Parameters<typeof updateItem>[1]) => withUndo(`${i.name} marked not ready`, () => updateItem(i.id, patch));

  const remove = () =>
    Alert.alert(`Remove ${i.name.toLowerCase()}?`, plan ? `It’s planned for ${plan.title}.` : 'You can undo this right after.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { router.back(); withUndo(`${i.name} removed`, () => setItems((xs) => xs.filter((x) => x.id !== i.id))); } },
    ]);

  const small = (label: string, onPress: () => void) => (
    <Button label={label} onPress={onPress} modifiers={[buttonStyle('bordered'), controlSize('small')]} />
  );

  return (
    <Sheet title={i.name} close>
      <Form>
        <Section footer={<Text modifiers={sub}>{`${i.kind} · ${i.material} · ${i.colour}`}</Text>}>
          <ZStack alignment="topLeading">
            <HStack modifiers={[frame({ height: 190 })]}><Spacer /><RN><Garment id={i.id} size={150} /></RN><Spacer /></HStack>
            <Pill label={statusLabel(i)} tone={isReady(i) ? 'ok' : 'warn'} icon={isReady(i) ? 'checkmark' : 'exclamationmark.triangle.fill'} />
          </ZStack>
        </Section>

        {plan && (
          <Section>
            <Label title={`Planned for ${plan.title} · ${shortDay(plan.date)}`} systemImage="calendar" modifiers={[foregroundStyle(C.blue)]} />
          </Section>
        )}

        <Section>
          <Row title="Clean" value={i.wash ? 'Needs washing' : 'Yes'} right={i.wash ? small('Mark washed', () => mark('wash')) : undefined} />
          <Row title="Ironed" value={i.iron ? 'Needs ironing' : 'Yes'} right={i.iron ? small('Mark ironed', () => mark('iron')) : undefined} />
          {i.issue ? <Row title="Issue" value={i.issue} subtitle={i.flaw} right={small('Fixed', () => withUndo(`${i.name} marked as fixed`, () => updateItem(i.id, { issue: undefined })))} /> : null}
          <Row title="Condition" value={i.condition} />
          <Row title="Last worn" value={i.lastWorn} />
        </Section>

        <Section title="Style tags">
          <HStack spacing={6}>{i.tags.map((t) => <Pill key={t} label={t} />)}</HStack>
        </Section>

        <Actions>
          <CTA label="Style a look with this" icon="sparkles"
            onPress={() => { router.back(); router.navigate({ pathname: '/stylist/looks', params: { prompt: `Style a look with my ${i.name.toLowerCase()}` } }); }} />
          <HStack spacing={10}>
            {isReady(i) && (
              <ConfirmationDialog title="What’s wrong with it?" titleVisibility="visible" isPresented={asking} onIsPresentedChange={setAsking}>
                <ConfirmationDialog.Trigger><CTA label="Mark not ready" kind="gray" onPress={() => setAsking(true)} /></ConfirmationDialog.Trigger>
                <ConfirmationDialog.Actions>
                  <Button label="Needs washing" onPress={() => notReady({ wash: true })} />
                  <Button label="Needs ironing" onPress={() => notReady({ iron: true })} />
                  <Button label="Has a hole" onPress={() => notReady({ issue: 'Has a hole' })} />
                  <Button label="Cancel" role="cancel" />
                </ConfirmationDialog.Actions>
              </ConfirmationDialog>
            )}
            <CTA label="Remove" kind="destructive" onPress={remove} />
          </HStack>
        </Actions>
      </Form>
    </Sheet>
  );
}
