import { Stack } from 'expo-router';

import { C } from './theme';

// Native large-title stack used inside every tab. Back buttons inside a tab are labelled with the tab's name,
// in a smaller font with a smaller chevron (SF Symbol chevron.left, 14pt semibold, rendered to assets/nav).
export function TabStack({ back }: { back: string }) {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerTintColor: C.blue,
        headerTitleStyle: { color: C.label },
        headerBackTitle: back,
        headerBackTitleStyle: { fontSize: 14 },
        headerBackIcon: { type: 'image', source: require('../assets/nav/back.png') },
        contentStyle: { backgroundColor: C.bg },
      }}
    />
  );
}
