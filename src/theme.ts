// Tokens from the DRIPPED Figma file (variables: bg/*, label/*, fill/*, tint/*, status/*).
export const C = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  label: '#000000',
  secondary: '#6C6C70',
  tertiary: '#8A8A8E',
  fill: '#E9E9EE',
  separator: '#C6C6C8',
  blue: '#0071E3',
  blueSoft: '#E5F0FD',
  warn: '#B25000',
  warnSoft: '#FFF1E0',
  ok: '#1E7D34',
  okSoft: '#E3F5E7',
  red: '#E5242B',
};

// iOS type ramp (SF Pro via the system font) — same sizes the Figma file uses.
export const T = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.26 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.45 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.43 },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: -0.43 },
  subhead: { fontSize: 15, lineHeight: 20, letterSpacing: -0.23 },
  subheadBold: { fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: -0.23 },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: -0.08 },
  footnoteBold: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: -0.08 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;
