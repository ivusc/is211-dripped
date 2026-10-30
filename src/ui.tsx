import {
  Button,
  HStack,
  Host,
  Image as SFImage,
  NavigationStack,
  RNHostView,
  Section,
  Spacer,
  Text,
  Toolbar,
  ToolbarItem,
  VStack,
  type HostProps,
  type useNativeState,
} from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  background,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  lineLimit,
  listRowBackground,
  listRowInsets,
  minimumScaleFactor,
  navigationBarTitleDisplayMode,
  navigationTitle,
  onTapGesture,
  padding,
  shapes,
  tint,
  type ModifierConfig,
} from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, PlatformColor, Text as RNText, View, type ColorValue, type TextProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import type { SFSymbol } from 'sf-symbols-typescript';

import { ART, type Item } from './data';
import { fmt, isReady, useApp } from './store';
import { C, T } from './theme';

// ---------- SwiftUI building blocks ----------

type TextStyle = NonNullable<Parameters<typeof font>[0]['textStyle']>;
type Weight = Parameters<typeof font>[0]['weight'];
export const f = (textStyle: TextStyle, weight?: Weight) => font({ textStyle, weight });
export const secondary = foregroundStyle({ type: 'hierarchical', style: 'secondary' });
export const tertiary = foregroundStyle({ type: 'hierarchical', style: 'tertiary' });
export const primary = foregroundStyle({ type: 'hierarchical', style: 'primary' });
export const sub: ModifierConfig[] = [f('footnote'), secondary];

// Writes a native text state (TextField/searchable) from JS. Kept outside components: the React Compiler
// treats hook results as immutable, but a native state is meant to be set like this.
export const setNative = (state: ReturnType<typeof useNativeState<string>>, value: string) => { state.value = value; };

// Full-screen SwiftUI host. The app tint flows to every control inside.
export function Screen({ children, ...p }: Omit<HostProps, 'style'>) {
  return <Host style={{ flex: 1 }} seedColor={C.blue} {...p}>{children}</Host>;
}

// Content-sized SwiftUI host, for SwiftUI controls inside an RN layout. `fill` takes the width from RN.
export function Inline({ children, fill, ...p }: Omit<HostProps, 'matchContents'> & { fill?: boolean }) {
  return <Host matchContents={fill ? { vertical: true } : true} seedColor={C.blue} {...p}>{children}</Host>;
}

// RN view (garment art, figures, month grid) embedded in a SwiftUI tree. `fill` takes the width from
// SwiftUI and the height from the RN content, for views laid out with flex.
export function RN({ children, fill }: { children: React.ReactElement; fill?: boolean }) {
  return <RNHostView matchContents={fill ? { vertical: true } : true}>{children}</RNHostView>;
}

type BarButton = { label: string; onPress: () => void; disabled?: boolean };

// Sheet with its own inline navigation bar: Cancel/close on the leading edge, the confirm action trailing.
export function Sheet({ title, cancel, confirm, close, modifiers = [], children }: {
  title: string; cancel?: BarButton; confirm?: BarButton; close?: boolean; modifiers?: ModifierConfig[]; children: ReactNode;
}) {
  return (
    <Screen>
      <NavigationStack>
        <Toolbar modifiers={[navigationTitle(title), navigationBarTitleDisplayMode('inline'), ...modifiers]}>
          {children}
          <Toolbar.Content>
            {close && <ToolbarItem placement="cancellationAction"><Button role="close" onPress={() => router.back()} /></ToolbarItem>}
            {cancel && <ToolbarItem placement="cancellationAction"><Button label={cancel.label} onPress={cancel.onPress} /></ToolbarItem>}
            {confirm && (
              <ToolbarItem placement="confirmationAction">
                <Button label={confirm.label} onPress={confirm.onPress} modifiers={[disabled(!!confirm.disabled)]} />
              </ToolbarItem>
            )}
          </Toolbar.Content>
        </Toolbar>
      </NavigationStack>
    </Screen>
  );
}

const TONES = {
  blue: [C.blueSoft, C.blue],
  warn: [C.warnSoft, C.warn],
  ok: [C.okSoft, C.ok],
  grey: [C.fill, C.label],
} as const;

export function Pill({ label, tone = 'grey', icon }: { label: string; tone?: keyof typeof TONES; icon?: SFSymbol }) {
  const [bg, fg] = TONES[tone];
  return (
    <HStack spacing={3} modifiers={[padding({ horizontal: 8, vertical: 3 }), background(bg, shapes.capsule())]}>
      {icon && <SFImage systemName={icon} size={10} color={fg} />}
      <Text modifiers={[f('caption', 'semibold'), foregroundStyle(fg), lineLimit(1)]}>{label}</Text>
    </HStack>
  );
}

// A list row. Tappable rows are plain buttons so the title keeps the label colour; navigation rows get a chevron.
export function Row({ title, subtitle, value, icon, thumb, right, onPress, chevron, check, tint }: {
  title: string; subtitle?: string; value?: string; icon?: SFSymbol; thumb?: string; right?: ReactNode;
  onPress?: () => void; chevron?: boolean; check?: boolean; tint?: string;
}) {
  const body = (
    <HStack spacing={12}>
      {icon && <SFImage systemName={icon} color={C.blue} modifiers={[f('body'), frame({ width: 26 })]} />}
      {thumb && <RN><GarmentThumb id={thumb} /></RN>}
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[foregroundStyle(tint ?? C.label)]}>{title}</Text>
        {subtitle && <Text modifiers={sub}>{subtitle}</Text>}
      </VStack>
      <Spacer />
      {value && <Text modifiers={[secondary]}>{value}</Text>}
      {right}
      {check && <SFImage systemName="checkmark" color={C.blue} modifiers={[f('body', 'semibold')]} />}
      {chevron && <SFImage systemName="chevron.right" modifiers={[f('footnote', 'semibold'), tertiary]} />}
    </HStack>
  );
  if (!onPress) return body;
  return <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>{body}</Button>;
}

type CTAKind = 'filled' | 'gray' | 'plain' | 'destructive';
const CTA_STYLE = { filled: 'borderedProminent', gray: 'glass', plain: 'borderless', destructive: 'bordered' } as const;
// Secondary buttons are Liquid Glass tinted with the system label colour, so they read in light and dark screens.
// PlatformColor, not a hierarchical style: a hierarchical tint recurses inside the glass material and crashes SwiftUI.
const TINT: Partial<Record<CTAKind, ColorValue>> = { gray: PlatformColor('label'), destructive: C.red };

// Full-width action button: filled for the one primary action, gray for secondary ones, red for destructive ones
// (role alone doesn't colour a bordered button inside a Form row, so TINT does).
export function CTA({ label, icon, onPress, kind = 'filled', disabled: off, small, wide = true }: {
  label: string; icon?: SFSymbol; onPress: () => void; kind?: CTAKind; disabled?: boolean; small?: boolean; wide?: boolean;
}) {
  // The frame goes on the label: SwiftUI sizes a bordered button's background to its label.
  // Labels stay on one line and shrink a little when two buttons share a row.
  return (
    <Button onPress={onPress} role={kind === 'destructive' ? 'destructive' : undefined}
      modifiers={[buttonStyle(CTA_STYLE[kind]), controlSize(small ? 'small' : 'large'), buttonBorderShape('capsule'), disabled(!!off), accessibilityLabel(label), ...(TINT[kind] ? [tint(TINT[kind])] : [])]}>
      <HStack spacing={6} modifiers={wide ? [frame({ maxWidth: Infinity })] : []}>
        {/* Icon pinned to the text's line height, so buttons with different symbols in one row match. */}
        {icon && <SFImage systemName={icon} modifiers={[frame({ height: small ? 20 : 22 })]} />}
        <Text modifiers={[f(small ? 'subheadline' : 'body', 'semibold'), lineLimit(1), minimumScaleFactor(0.8)]}>{label}</Text>
      </HStack>
    </Button>
  );
}

// Circular icon-only button (glass on iOS 26), for toolbars floating over content.
export function IconCTA({ label, icon, onPress, kind = 'gray', disabled: off, size = 'regular' }: {
  label: string; icon: SFSymbol; onPress: () => void; kind?: CTAKind; disabled?: boolean; size?: 'small' | 'regular' | 'large' | 'extraLarge';
}) {
  return (
    <Button label={label} systemImage={icon} onPress={onPress} role={kind === 'destructive' ? 'destructive' : undefined}
      modifiers={[labelStyle('iconOnly'), buttonStyle(kind === 'filled' ? 'glassProminent' : 'glass'), buttonBorderShape('circle'), controlSize(size), disabled(!!off)]} />
  );
}

// Actions under a form sit on the grouped background, not inside a row.
export function Actions({ children }: { children: ReactNode }) {
  return (
    <Section modifiers={[listRowBackground('clear'), listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}>
      <VStack spacing={10}>{children}</VStack>
    </Section>
  );
}

// Footnote with a leading symbol, for section footers.
export function Note({ icon, children }: { icon?: SFSymbol; children: string }) {
  return (
    <HStack spacing={6} alignment="firstTextBaseline">
      {icon && <SFImage systemName={icon} modifiers={sub} />}
      <Text modifiers={sub}>{children}</Text>
    </HStack>
  );
}

// ---------- React Native art (rendered via RNHostView inside SwiftUI) ----------

export function Txt({ v = 'body', c = C.label, style, ...p }: TextProps & { v?: keyof typeof T; c?: string }) {
  return <RNText {...p} style={[T[v] as object, { color: c }, style]} />;
}

export function Garment({ id, size = 58 }: { id: string; size?: number }) {
  // Added items are `<garment>-<timestamp>`, so they fall back to their garment's artwork.
  return <Image source={ART[id] ?? ART[id.replace(/-\d+$/, '')]} style={{ width: size, height: size }} contentFit="contain" />;
}

// src is a Figma render (asset) or an SVG drawn by dressed().
export function Figure({ src, height = 270 }: { src: number | string; height?: number }) {
  const width = (height * 114) / 270;
  if (typeof src === 'string') return <SvgXml xml={src} width={width} height={height} />;
  return <Image source={src} style={{ width, height }} contentFit="contain" transition={200} />;
}

export function GarmentThumb({ id, size = 44 }: { id: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 10, borderCurve: 'continuous', backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Garment id={id} size={size * 0.7} />
    </View>
  );
}

// ---------- Overlays ----------

// Liquid Glass snackbar with Undo, above the tab bar and the glass composers that sit on it.
export function ToastHost() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 156, alignItems: 'center' }} accessibilityLiveRegion="polite">
      <Inline>
        <HStack spacing={16} modifiers={[padding({ horizontal: 18, vertical: 12 }), glassEffect({ glass: { variant: 'regular' }, shape: 'capsule' })]}>
          <Text modifiers={[f('subheadline')]}>{toast.message}</Text>
          {toast.undo && <Button label="Undo" onPress={toast.undo} modifiers={[f('subheadline', 'semibold')]} />}
        </HStack>
      </Inline>
    </View>
  );
}

// ponytail: an in-app stand-in for the Friday-morning push notification, so testers can see it on demand.
// Real reminders need expo-notifications and a scheduled trigger.
export function ReminderHost() {
  const { reminder, setReminder, item } = useApp();
  const insets = useSafeAreaInsets();
  const [y] = useState(() => new Animated.Value(-200));

  useEffect(() => {
    if (!reminder) return;
    // Critically damped: the banner arrives without bouncing, and leaves the way it came.
    Animated.spring(y, { toValue: 0, damping: 30, stiffness: 260, useNativeDriver: true }).start();
    const t = setTimeout(() => Animated.spring(y, { toValue: -200, damping: 30, stiffness: 260, useNativeDriver: true }).start(() => setReminder(undefined)), 8000);
    return () => clearTimeout(t);
  }, [reminder]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!reminder) return null;
  const { e, night } = reminder;
  const pieces = (e.outfit ?? []).map(item);
  const lc = (p: Item) => p.name.toLowerCase().replace('t-shirt', 'T-shirt');
  const and = (xs: string[]) => xs.join(', ').replace(/, (?=[^,]*$)/, ' and ');
  const todo = pieces.filter((p) => !isReady(p)).length;
  // Night before: what to wash or iron tonight. Morning of: what to wear.
  const chores = [
    pieces.some((p) => p.wash) && `wash your ${and(pieces.filter((p) => p.wash).map(lc))}`,
    pieces.some((p) => p.iron) && `iron your ${and(pieces.filter((p) => p.iron).map(lc))}`,
  ].filter((x): x is string => !!x);
  const title = night ? `Get ${fmt(e.date, { weekday: 'long' })}’s outfit ready` : 'Your outfit is ready';
  const body = night
    ? chores.length
      ? `${and(chores).replace(/^./, (c) => c.toUpperCase())} tonight, so you’re set for tomorrow’s ${e.title.toLowerCase()} at ${e.time}.`
      : `Everything for tomorrow’s ${e.title.toLowerCase()} is clean and ready. Nothing to do tonight.`
    : `Wear your ${and(pieces.map(lc))} to the ${e.title.toLowerCase()} at ${e.time}. ${todo ? `${todo} still need${todo > 1 ? '' : 's'} attention.` : 'Everything’s clean and ironed, so you’ll be dressed in five minutes.'}`;
  const open = () => {
    setReminder(undefined);
    router.navigate(`/calendar/day/${e.date}`);
  };
  return (
    <Animated.View style={{ position: 'absolute', left: 8, right: 8, top: insets.top + 4, transform: [{ translateY: y }] }}
      accessibilityRole="button" accessibilityLabel="DRIPPED notification">
      <Host matchContents={{ vertical: true }} seedColor={C.blue}>
        <HStack spacing={10} alignment="top"
          modifiers={[padding({ all: 14 }), glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'roundedRectangle', cornerRadius: 24 }), onTapGesture(open)]}>
          <SFImage systemName="hanger" size={20} color="white"
            modifiers={[padding({ all: 9 }), background(C.blue, shapes.roundedRectangle({ cornerRadius: 9, roundedCornerStyle: 'continuous' }))]} />
          <VStack alignment="leading" spacing={2}>
            <HStack>
              <Text modifiers={[f('subheadline', 'semibold')]}>{title}</Text>
              <Spacer />
              <Text modifiers={sub}>now</Text>
            </HStack>
            <Text modifiers={[f('subheadline')]}>{body}</Text>
          </VStack>
        </HStack>
      </Host>
    </Animated.View>
  );
}
