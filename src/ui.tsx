import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { ART, type Item } from './data';
import { fmt, isReady, useApp } from './store';
import { C, T } from './theme';

export function Txt({ v = 'body', c = C.label, style, ...p }: TextProps & { v?: keyof typeof T; c?: string }) {
  return <Text {...p} style={[T[v] as object, { color: c }, style]} />;
}

export function Icon({ name, size = 17, color = C.label, ...p }: Omit<SymbolViewProps, 'name'> & { name: SymbolViewProps['name']; size?: number; color?: string }) {
  return <SymbolView name={name} size={size} tintColor={color} {...p} />;
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

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const TONES = {
  blue: [C.blueSoft, C.blue],
  warn: [C.warnSoft, C.warn],
  ok: [C.okSoft, C.ok],
  grey: [C.fill, C.label],
  solid: [C.blue, '#fff'],
} as const;

export function Pill({ label, tone = 'grey', icon }: { label: string; tone?: keyof typeof TONES; icon?: SymbolViewProps['name'] }) {
  const [bg, fg] = TONES[tone];
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={11} color={fg} />}
      <Txt v="caption" c={fg}>{label}</Txt>
    </View>
  );
}

type BtnKind = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive';
export function Button({
  title, onPress, kind = 'filled', icon, disabled, loading, style, small,
}: {
  title: string; onPress?: () => void; kind?: BtnKind; icon?: SymbolViewProps['name'];
  disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const bg = disabled ? C.fill : { filled: C.blue, tinted: C.blueSoft, gray: C.fill, plain: 'transparent', destructive: C.fill }[kind];
  const fg = disabled ? C.tertiary : { filled: '#fff', tinted: C.blue, gray: C.label, plain: C.blue, destructive: C.red }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [s.btn, small && s.btnSmall, { backgroundColor: bg, opacity: pressed ? 0.6 : 1 }, style]}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={small ? 14 : 16} color={fg} weight="semibold" /> : null}
      <Txt v={small ? 'subheadBold' : 'headline'} c={fg}>{title}</Txt>
    </Pressable>
  );
}

export function IconButton({ name, onPress, bg = C.fill, color = C.label, size = 36, label }: {
  name: SymbolViewProps['name']; onPress?: () => void; bg?: string; color?: string; size?: number; label: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
      <Icon name={name} size={size * 0.45} color={color} weight="semibold" />
    </Pressable>
  );
}

export function Segmented<V extends string>({ options, value, onChange, labels }: {
  options: readonly V[]; value: V; onChange: (v: V) => void; labels?: Partial<Record<V, string>>;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={[s.segItem, o === value && s.segOn]} accessibilityRole="tab" accessibilityState={{ selected: o === value }}>
          <Txt v={o === value ? 'footnoteBold' : 'footnote'}>{labels?.[o] ?? o}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && { backgroundColor: C.label }]} accessibilityState={{ selected: on }}>
      {on && <Icon name="checkmark" size={12} color="#fff" weight="bold" />}
      <Txt v="subheadBold" c={on ? '#fff' : C.label}>{label}</Txt>
    </Pressable>
  );
}

export function Caption({ children }: { children: string }) {
  return <Txt v="footnote" c={C.secondary} style={{ marginLeft: 16, marginTop: 8, marginBottom: 6 }}>{children.toUpperCase()}</Txt>;
}

// Inset grouped list (UITableView .insetGrouped).
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const rows = (Array.isArray(children) ? children.flat() : [children]).filter(Boolean);
  return (
    <View style={[s.group, style]}>
      {rows.map((r, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={s.sep} />}
          {r}
        </Fragment>
      ))}
    </View>
  );
}

export function Row({ title, subtitle, value, left, right, onPress, chevron, tint, check }: {
  title: string; subtitle?: string; value?: string; left?: ReactNode; right?: ReactNode;
  onPress?: () => void; chevron?: boolean; tint?: string; check?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { backgroundColor: C.fill }]}>
      {left}
      <View style={{ flex: 1 }}>
        <Txt c={tint ?? C.label}>{title}</Txt>
        {subtitle && <Txt v="footnote" c={C.secondary}>{subtitle}</Txt>}
      </View>
      {value && <Txt c={C.secondary}>{value}</Txt>}
      {right}
      {check && <Icon name="checkmark" color={C.blue} weight="semibold" />}
      {chevron && <Icon name="chevron.right" size={13} color={C.tertiary} weight="semibold" />}
    </Pressable>
  );
}

export function GarmentThumb({ id, size = 44 }: { id: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Garment id={id} size={size * 0.7} />
    </View>
  );
}

// Bottom-anchored screen (full-screen modal or sheet): pads by the keyboard when it's up, else the
// home indicator. KeyboardAvoidingView can't do this in a sheet: it measures relative to the sheet.
export function KeyboardScreen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) => setKb(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKb(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return <View style={[{ flex: 1 }, style, { paddingBottom: (kb || insets.bottom) + 8 }]}>{children}</View>;
}

// Snackbar with Undo, shown above the tab bar.
export function ToastHost() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={s.toastWrap}>
      <View style={s.toast} accessibilityLiveRegion="polite">
        <Txt v="subhead" c="#fff" style={{ flex: 1 }}>{toast.message}</Txt>
        {toast.undo && (
          <Pressable onPress={toast.undo} hitSlop={10}>
            <Txt v="subheadBold" c="#fff">Undo</Txt>
          </Pressable>
        )}
      </View>
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
    Animated.spring(y, { toValue: 0, useNativeDriver: true }).start();
    const t = setTimeout(() => Animated.timing(y, { toValue: -200, duration: 250, useNativeDriver: true }).start(() => setReminder(undefined)), 8000);
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
    <Animated.View style={[s.reminderWrap, { top: insets.top + 4, transform: [{ translateY: y }] }]}>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel="DRIPPED notification" style={s.reminder}>
        <View style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
          <Icon name="hanger" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.rowBetween}>
            <Txt v="subheadBold">{title}</Txt>
            <Txt v="footnote" c={C.secondary}>now</Txt>
          </View>
          <Txt v="subhead">{body}</Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 16, gap: 12, paddingBottom: 120 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14, borderCurve: 'continuous' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  btn: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, borderCurve: 'continuous' },
  btnSmall: { height: 36, borderRadius: 18, paddingHorizontal: 14 },
  seg: { flexDirection: 'row', backgroundColor: C.fill, borderRadius: 9, padding: 2 },
  segItem: { flex: 1, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.card, boxShadow: '0 3px 8px rgba(0,0,0,0.12)' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 17, backgroundColor: C.card },
  group: { backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', borderCurve: 'continuous' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 16 },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toastWrap: { position: 'absolute', left: 16, right: 16, bottom: 104 },
  reminderWrap: { position: 'absolute', left: 8, right: 8 },
  reminder: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 24, backgroundColor: '#F5F5F7', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', borderCurve: 'continuous' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1C1C1E', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
});
