import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AppProvider, useApp } from '@/store';
import { C } from '@/theme';
import { ReminderHost, ToastHost } from '@/ui';

const sheet = { presentation: 'formSheet', sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: C.bg } } as const;

function RootStack() {
  const { loggedIn } = useApp();
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={loggedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item/[id]" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
          <Stack.Screen name="pieces" options={{ ...sheet, sheetAllowedDetents: [0.7, 1] }} />
          <Stack.Screen name="save-look" options={{ ...sheet, sheetAllowedDetents: [1] }} />
          <Stack.Screen name="new-event" options={{ ...sheet, sheetAllowedDetents: [1] }} />
          <Stack.Screen name="filters" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
          <Stack.Screen name="ask-stylist" options={{ ...sheet, sheetAllowedDetents: [0.7, 1] }} />
          <Stack.Screen name="menu" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
          <Stack.Screen name="add-item" options={{ presentation: 'fullScreenModal', contentStyle: { backgroundColor: '#1C1C1E' } }} />
          <Stack.Screen name="body-scan" options={{ presentation: 'fullScreenModal', contentStyle: { backgroundColor: '#1C1C1E' } }} />
        </Stack.Protected>
      </Stack>
      <ToastHost />
      <ReminderHost />
    </View>
  );
}

export default function Root() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppProvider>
  );
}
