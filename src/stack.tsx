import { Stack } from 'expo-router';

import { C } from './theme';

// Native large-title stack used inside every tab.
export function TabStack() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerTintColor: C.blue,
        headerTitleStyle: { color: C.label },
        contentStyle: { backgroundColor: C.bg },
      }}
    />
  );
}
