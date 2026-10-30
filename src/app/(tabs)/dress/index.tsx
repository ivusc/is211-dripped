import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Animated, PanResponder, ScrollView, View } from 'react-native';

import { DECK } from '@/data';
import { useApp } from '@/store';
import { C } from '@/theme';
import { Button, Card, Figure, IconButton, Pill, Txt, s } from '@/ui';

const THRESHOLD = 110;

export default function Dress() {
  const { setLiked, owns } = useApp();
  const [n, setN] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  const look = DECK[n % DECK.length];

  // Fly the card off, then advance. Liked cards go to Old drips › Liked.
  // JS driver throughout: the pan writes x from JS, so x can't move to the native driver.
  const fling = (dir: 1 | -1) => {
    Animated.timing(x, { toValue: dir * 500, duration: 220, useNativeDriver: false }).start(() => {
      if (dir === 1) setLiked((l) => ({ ...l, [look.id]: true }));
      x.setValue(0);
      setN((v) => v + 1);
    });
  };

  // Rebuilt each render so fling always sees the current card.
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
    onPanResponderMove: Animated.event([null, { dx: x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > THRESHOLD) fling(g.dx > 0 ? 1 : -1);
      else Animated.spring(x, { toValue: 0, useNativeDriver: false }).start();
    },
  });

  const rotate = x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-12deg', '0deg', '12deg'] });
  const likeOpacity = x.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = x.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[s.pad, { gap: 14 }]}>
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
        <View style={[s.card, { position: 'absolute', inset: 0, top: 10, transform: [{ scale: 0.95 }], opacity: 0.6 }]} />
        <Animated.View {...pan.panHandlers} style={{ flex: 1, transform: [{ translateX: x }, { rotate }] }}>
          <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Figure src={look.avatar} height={300} />
            </View>
            <View style={{ alignSelf: 'stretch', gap: 6 }}>
              <View style={s.rowBetween}>
                <Txt v="title3">{look.name}</Txt>
                <Button title="Pieces" icon="chevron.up" kind="gray" small
                  onPress={() => router.push({ pathname: '/pieces', params: { pieces: look.pieces.join(','), title: look.name, deck: look.id } })} />
              </View>
              <Txt v="footnote" c={C.secondary}>You own {look.pieces.filter(owns).length} of {look.pieces.length} pieces</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {look.tags.map((t) => <Pill key={t} label={t} />)}
              </View>
            </View>
            <Animated.View style={[stamp, { left: 16, borderColor: C.ok, opacity: likeOpacity, transform: [{ rotate: '-12deg' }] }]}>
              <Txt v="title2" c={C.ok}>LIKE</Txt>
            </Animated.View>
            <Animated.View style={[stamp, { right: 16, borderColor: C.red, opacity: skipOpacity, transform: [{ rotate: '12deg' }] }]}>
              <Txt v="title2" c={C.red}>SKIP</Txt>
            </Animated.View>
          </Card>
        </Animated.View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
        <IconButton name="arrow.uturn.backward" label="Back" size={44} bg={C.card} color={n ? C.label : C.tertiary} onPress={() => n && setN(n - 1)} />
        <IconButton name="xmark" label="Skip" size={60} bg={C.card} color={C.red} onPress={() => fling(-1)} />
        <IconButton name="heart.fill" label="Like" size={60} bg={C.card} color={C.ok} onPress={() => fling(1)} />
      </View>
    </ScrollView>
  );
}

const stamp = { position: 'absolute', top: 20, borderWidth: 3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 } as const;
