import { useFocusEffect } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useCallback, useState } from 'react';

import { C } from '@/theme';

export const unstable_settings = { anchor: 'stylist' };

// SF Symbols with real text labels. "Down to Dress" is shortened to DTD so it fits UITabBar's single-line label.
const TABS = [
  { name: 'preview', label: 'Preview', icon: 'person.fill.viewfinder' },
  { name: 'wardrobe', label: 'Wardrobe', icon: 'hanger' },
  { name: 'stylist', label: 'Stylist', icon: 'sparkles' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar' },
  { name: 'dress', label: 'DTD', icon: 'heart.text.square', a11y: 'Down to Dress' },
] as const;

// Native UITabBar — on iOS 26 this is the floating Liquid Glass bar from the design.
export default function Tabs() {
  // UITabBar measures the labels while the bar is still hidden behind login/onboarding, keeps those widths and
  // truncates "Preview" to "Pre…". Changing every title (by a zero-width space) when the tabs come back into view
  // makes UIKit measure them again. ponytail: drop once react-native-screens relays the bar out by itself.
  const [nudge, setNudge] = useState(false);
  useFocusEffect(useCallback(() => setNudge((v) => !v), []));

  return (
    <NativeTabs tintColor={C.blue} iconColor={{ default: C.label, selected: C.blue }}>
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name} accessibilityLabel={'a11y' in t ? t.a11y : t.label}>
          <NativeTabs.Trigger.Label>{nudge ? `${t.label}​` : t.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={t.icon} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
