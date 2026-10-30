import { NativeTabs } from 'expo-router/native-tabs';

import { C } from '@/theme';

export const unstable_settings = { anchor: 'stylist' };

// Each icon is the Figma glyph (node 2:224) with its label drawn underneath, as one same-size template image.
// UITabBar labels are single-line, so this is how "Down to Dress" gets two lines and every tab gets equal width.
const TABS = [
  { name: 'preview', label: 'Preview', icon: require('../../../assets/tabs/preview.png') },
  { name: 'wardrobe', label: 'Wardrobe', icon: require('../../../assets/tabs/wardrobe.png') },
  { name: 'stylist', label: 'Stylist', icon: require('../../../assets/tabs/stylist.png') },
  { name: 'calendar', label: 'Calendar', icon: require('../../../assets/tabs/calendar.png') },
  { name: 'dress', label: 'Down to Dress', icon: require('../../../assets/tabs/dress.png') },
];

// Native UITabBar — on iOS 26 this is the floating Liquid Glass bar from the design.
export default function Tabs() {
  return (
    <NativeTabs tintColor={C.blue} iconColor={{ default: C.label, selected: C.blue }}>
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name} accessibilityLabel={t.label}>
          <NativeTabs.Trigger.Label hidden />
          <NativeTabs.Trigger.Icon src={t.icon} renderingMode="template" />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
