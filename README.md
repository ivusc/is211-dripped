# DRIPPED

> Your wardrobe, styled for every event.

A high-fidelity, iOS mobile prototype built for **IS211 IDP Iteration 2**. It is a clickable prototype, not a production app: all data is seeded and the stylist AI is scripted.

## What is DRIPPED?

DRIPPED is a wardrobe and outfit-planning app for students who aren't sure what to wear. It connects what you own, what's on your calendar, and what the dress code is.

The prototype follows one persona, **Caleb**, a student with 20 clothing items, a calendar full of events with different dress codes, and a career fair coming up on Friday.

### Features

| Tab                     | What it does                                                                                                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preview**             | Try on outfits on an avatar built from your body profile. Swap tops, bottoms and shoes, save the result as a look, and browse old drips.                                                                                                                       |
| **Wardrobe**            | Browse everything you own by category (Tops / Bottoms / Shoes). Filter by search, items needing a wash or iron, or occasion. Add new pieces by scanning them.                                                                                                  |
| **Stylist**             | Ask the stylist for outfit advice for an upcoming event. It factors in dress code, weather and the condition of your clothes (for example, a hole spotted during scanning), and suggests swaps. Also holds saved looks and your body profile and measurements. |
| **Calendar**            | Month and day views of your events, with an outfit planned per event. Events sync in from the phone calendar, and you can add your own. A laundry list tracks what needs washing or ironing, and reminders fire the night before and the morning of.           |
| **DTD (Down to Dress)** | Swipe through outfit ideas, Tinder-style: swipe right to like, left to pass. Liked looks can be recreated from pieces you already own, with the closest match suggested for anything you don't.                                                                |

### Onboarding flow

1. **Login**: any non-empty email and password signs in (no backend).
2. **Body profile**: plain defaults, a scripted body scan, or manual measurements.
3. **Scan clothes**: add the last two items to your wardrobe, taking it from 20 to 22 items.

## Tech stack

- [Expo](https://expo.dev) SDK 58, React Native 0.88, React 19 with the React Compiler enabled
- [Expo Router](https://docs.expo.dev/router/introduction) for file-based routing, with typed routes
- [`@expo/ui/swift-ui`](https://docs.expo.dev/versions/v58.0.0/sdk/ui/) for native SwiftUI components (Form, Picker, Button, glass effects and more)
- Native tabs (`expo-router/native-tabs`) for the iOS 26 Liquid Glass tab bar
- `expo-glass-effect`, `expo-symbols` (SF Symbols), `expo-image`
- `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`
- TypeScript

Platform is **iOS only** (`"platforms": ["ios"]`, portrait, light mode). The UI uses SwiftUI views and Liquid Glass, so it won't render on Android or web.

## Project structure

```
src/
  app/                 Expo Router routes (every file is a screen)
    (tabs)/            The five tabs: preview, wardrobe, stylist, calendar, dress
    login.tsx          Sign in
    body-scan.tsx      Mock body scan (timed steps, no camera)
    add-item.tsx       Add a clothing item
    ask-stylist.tsx    Chat with the stylist
    new-event.tsx      Create a calendar event
    save-look.tsx      Save a look
    filters.tsx        Wardrobe filters
    item/[id].tsx      Item detail
  data.ts              Seed data: items, events, looks, catalogue, SVG art map
  store.tsx            App-wide state (React context)
  theme.ts             Colours
  ui.tsx               Shared UI building blocks
  month.tsx, stack.tsx Calendar grid and navigation helpers
assets/
  garments/            SVG art for each clothing item
  avatars/             SVG avatars for looks and previews
```

## Prototype shortcuts

This is a prototype, so these parts are deliberately faked:

- **State is in-memory only** (React context in `src/store.tsx`). Nothing persists between launches.
- **No auth backend.** Any non-empty email and password logs in.
- **Body scan and clothes scan are mocked.** Timed steps run over a static figure, with no camera access.
- **The stylist is scripted.** Replies are regex-matched and rule-based (dress code, weather, flaws, swaps), not a real model.
- **Outfit matching** uses a fixed table for the demo scenario. Real matching would need colour and kind scoring.
- **Calendar sync and reminders are simulated.**
- **Garments and avatars are SVG illustrations**, not photos.

## Getting started

Requires macOS with Xcode (iOS Simulator) or an iPhone.

```bash
npm install
npx expo start
```

Then press `i` to open the iOS Simulator.

SwiftUI components from `@expo/ui` are not in Expo Go, so for a physical device or if Expo Go fails, use a development build:

```bash
npx expo run:ios
```

### Other commands

```bash
npx expo lint        # lint
npx tsc --noEmit     # typecheck
```

## Credits

Built by G12T2 for IS211 Interaction Design and Prototyping. The design is based on the team's Figma file.
Figma link [here](https://www.figma.com/design/3hk53ZkDVt6CZj7jyOPcuw/DRIPPED-Hi-Fi-Prototype?node-id=0-1&t=mihQZdEP5REjtAZd-1).
