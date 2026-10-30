import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Animated, PanResponder, ScrollView, View } from 'react-native';

import { DECK } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { CTA, Figure, IconCTA, Inline, Pill, Txt, f } from '@/ui';

const THRESHOLD = 110;
// Apple's momentum projection: where a flick would come to rest under scroll-like deceleration.
const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);

export default function Dress() {
  const { setLiked, owns } = useApp();
  const [n, setN] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  const look = DECK[n % DECK.length];

  // Fly the card off, carrying the finger's velocity, then advance. Liked cards go to Old drips › Liked.
  // JS driver throughout: the pan writes x from JS, so x can't move to the native driver.
  const fling = (dir: 1 | -1, velocity = 0) => {
    Animated.spring(x, { toValue: dir * 520, velocity, stiffness: 180, damping: 26, overshootClamping: true, useNativeDriver: false }).start(() => {
      if (dir === 1) setLiked((l) => ({ ...l, [look.id]: true }));
      x.setValue(0);
      setN((v) => v + 1);
    });
  };

  // Rebuilt each render so fling always sees the current card.
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
    // Grab mid-flight: stop the spring where the card is and keep tracking from there.
    onPanResponderGrant: () => { x.stopAnimation((v) => { x.setOffset(v); x.setValue(0); }); },
    onPanResponderMove: Animated.event([null, { dx: x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      x.flattenOffset();
      const vx = g.vx * 1000; // px/s
      const landing = g.dx + project(vx);
      if (Math.abs(landing) > THRESHOLD) fling(landing > 0 ? 1 : -1, vx);
      // A thrown-but-not-far-enough card settles with a touch of bounce; a gentle release doesn't.
      else Animated.spring(x, { toValue: 0, velocity: vx, damping: Math.abs(vx) > 300 ? 18 : 26, stiffness: 220, useNativeDriver: false }).start();
    },
  });

  const rotate = x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-12deg', '0deg', '12deg'] });
  const likeOpacity = x.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = x.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }} style={{ backgroundColor: C.bg }}>
      <Stack.Screen
        options={{
          title: 'Down to Dress',
          unstable_headerRightItems: () => [
            {
              type: 'button', label: 'About', icon: { type: 'sfSymbol', name: 'info.circle' },
              onPress: () => Alert.alert('Down to Dress', 'Looks posted by other students. Swipe right to like, left to skip. Tap a look to see the pieces and recreate it with your own clothes.'),
            },
          ],
        }}
      />
      <Txt v="subhead" c={C.secondary}>Looks from other students</Txt>
      <View style={{ height: 470 }}>
        <View style={[card, { position: 'absolute', inset: 0, top: 10, transform: [{ scale: 0.95 }], opacity: 0.6 }]} />
        <Animated.View {...pan.panHandlers} style={[card, { flex: 1, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: [{ translateX: x }, { rotate }] }]}>
          <View style={{ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderRadius: 14, borderCurve: 'continuous', backgroundColor: C.bg }}>
            <Figure src={look.avatar} height={280} />
          </View>
          <Inline fill style={{ alignSelf: 'stretch' }}>
            <VStack alignment="leading" spacing={6}>
              <HStack>
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[f('title3', 'semibold')]}>{look.name}</Text>
                  <HStack spacing={4}>
                    <Image systemName="checkmark.circle.fill" size={13} color={C.ok} />
                    <Text modifiers={[f('footnote', 'semibold'), foregroundStyle(C.ok)]}>{`You own ${look.pieces.filter(owns).length} of ${look.pieces.length} pieces`}</Text>
                  </HStack>
                </VStack>
                <Spacer />
                <CTA label="Pieces" icon="chevron.up" kind="gray" small wide={false}
                  onPress={() => router.push({ pathname: '/pieces', params: { pieces: look.pieces.join(','), title: look.name, deck: look.id } })} />
              </HStack>
              <HStack spacing={6}>{look.tags.map((t) => <Pill key={t} label={t} />)}</HStack>
            </VStack>
          </Inline>
          <Animated.View style={[stamp, { left: 16, borderColor: C.ok, opacity: likeOpacity, transform: [{ rotate: '-12deg' }] }]}>
            <Txt v="title2" c={C.ok}>LIKE</Txt>
          </Animated.View>
          <Animated.View style={[stamp, { right: 16, borderColor: C.red, opacity: skipOpacity, transform: [{ rotate: '12deg' }] }]}>
            <Txt v="title2" c={C.red}>SKIP</Txt>
          </Animated.View>
        </Animated.View>
      </View>
      <Inline style={{ alignSelf: 'center' }} alignment="center">
        <HStack spacing={28}>
          <IconCTA label="Back" icon="arrow.uturn.backward" size="regular" disabled={!n} onPress={() => setN(n - 1)} />
          <IconCTA label="Skip" icon="xmark" size="extraLarge" onPress={() => fling(-1)} />
          <IconCTA label="Like" icon="heart.fill" size="extraLarge" kind="filled" onPress={() => fling(1)} />
        </HStack>
      </Inline>
    </ScrollView>
  );
}

const card = { backgroundColor: C.card, borderRadius: 20, borderCurve: 'continuous', padding: 14 } as const;
const stamp = { position: 'absolute', top: 20, borderWidth: 3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 } as const;
