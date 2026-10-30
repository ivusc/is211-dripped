import { NativeTabs } from 'expo-router/native-tabs';

import { C } from '@/theme';

export const unstable_settings = { anchor: 'stylist' };

// Native UITabBar — on iOS 26 this is the floating Liquid Glass bar from the design.
export default function Tabs() {
  return (
    <NativeTabs tintColor={C.blue}>
      <NativeTabs.Trigger name="preview">
        <NativeTabs.Trigger.Label>Preview</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.square.badge.camera" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wardrobe">
        <NativeTabs.Trigger.Label>Wardrobe</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="hanger" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stylist">
        <NativeTabs.Trigger.Label>Stylist</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dress">
        <NativeTabs.Trigger.Label>Dress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'heart.text.square', selected: 'heart.text.square.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
