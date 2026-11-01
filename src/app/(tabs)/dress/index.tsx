import { Button, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Alert, Animated, PanResponder, ScrollView, View } from "react-native";

import { DECK } from "@/data";
import { useApp } from "@/store";
import { C } from "@/theme";
import { Figure, IconCTA, Inline, Txt, f } from "@/ui";

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
    Animated.spring(x, {
      toValue: dir * 520,
      velocity,
      stiffness: 180,
      damping: 26,
      overshootClamping: true,
      useNativeDriver: false,
    }).start(() => {
      if (dir === 1) setLiked((l) => ({ ...l, [look.id]: true }));
      x.setValue(0);
      setN((v) => v + 1);
    });
  };

  // Rebuilt each render so fling always sees the current card.
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
    // Grab mid-flight: stop the spring where the card is and keep tracking from there.
    onPanResponderGrant: () => {
      x.stopAnimation((v) => {
        x.setOffset(v);
        x.setValue(0);
      });
    },
    onPanResponderMove: Animated.event([null, { dx: x }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, g) => {
      x.flattenOffset();
      const vx = g.vx * 1000; // px/s
      const landing = g.dx + project(vx);
      if (Math.abs(landing) > THRESHOLD) fling(landing > 0 ? 1 : -1, vx);
      // A thrown-but-not-far-enough card settles with a touch of bounce; a gentle release doesn't.
      else
        Animated.spring(x, {
          toValue: 0,
          velocity: vx,
          damping: Math.abs(vx) > 300 ? 18 : 26,
          stiffness: 220,
          useNativeDriver: false,
        }).start();
    },
  });

  const rotate = x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ["-12deg", "0deg", "12deg"],
  });
  const likeOpacity = x.interpolate({
    inputRange: [0, THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const skipOpacity = x.interpolate({
    inputRange: [-THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const openPieces = () =>
    router.push({
      pathname: "/pieces",
      params: {
        pieces: look.pieces.join(","),
        title: look.name,
        deck: look.id,
      },
    });

  // Laid out to the Figma (node 7:634) and sized to fit one screen, so scrolling is off.
  return (
    <ScrollView
      scrollEnabled={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 2, gap: 12 }}
      style={{ backgroundColor: C.bg }}
    >
      <Stack.Screen
        options={{
          title: "Down to Dress",
          unstable_headerRightItems: () => [
            {
              type: "button",
              label: "About",
              icon: { type: "sfSymbol", name: "info.circle" },
              onPress: () =>
                Alert.alert(
                  "Down to Dress",
                  "Looks posted by other students. Swipe right to like, left to skip. Tap a look to see the pieces and recreate it with your own clothes.",
                ),
            },
          ],
        }}
      />
      <Txt v="subhead" c={C.secondary}>
        Looks from other students
      </Txt>
      {/* Two cards peek out above the top one, 12pt narrower each, as in the design. */}
      <View style={{ height: 16 + CARD_H }}>
        <View
          style={[
            card,
            {
              position: "absolute",
              left: 24,
              right: 24,
              top: 0,
              height: CARD_H - 30,
              opacity: 0.5,
            },
          ]}
        />
        <View
          style={[
            card,
            {
              position: "absolute",
              left: 12,
              right: 12,
              top: 8,
              height: CARD_H - 30,
              opacity: 0.8,
            },
          ]}
        />
        {/* No Like button any more, so VoiceOver gets like/skip as card actions instead of the swipe. */}
        <Animated.View
          {...pan.panHandlers}
          accessibilityActions={[
            { name: "like", label: "Like" },
            { name: "skip", label: "Skip" },
          ]}
          onAccessibilityAction={(e) =>
            fling(e.nativeEvent.actionName === "like" ? 1 : -1)
          }
          style={[
            card,
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 16,
              height: CARD_H,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              transform: [{ translateX: x }, { rotate }],
            },
          ]}
        >
          <View
            style={{
              height: IMAGE_H,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.bg,
            }}
          >
            <Figure src={look.avatar} height={IMAGE_H - 30} />
          </View>
          <Inline fill style={{ alignSelf: "stretch" }}>
            <VStack
              alignment="leading"
              spacing={10}
              modifiers={[padding({ horizontal: 16, top: 14, bottom: 8 })]}
            >
              <HStack alignment="firstTextBaseline">
                <Text modifiers={[f("title2", "bold"), lineLimit(1)]}>
                  {look.name}
                </Text>
                <Spacer />
                <Text
                  modifiers={[f("footnote", "semibold"), foregroundStyle(C.ok)]}
                >{`You own ${look.pieces.filter(owns).length} of ${look.pieces.length} pieces`}</Text>
              </HStack>
              <HStack spacing={6}>
                {look.tags.map((t) => (
                  <Text
                    key={t}
                    modifiers={[
                      font({ size: 10, weight: "semibold" }),
                      foregroundStyle(C.secondary),
                      lineLimit(1),
                      padding({ horizontal: 8, vertical: 4 }),
                      background(C.fill, shapes.capsule()),
                    ]}
                  >
                    {t}
                  </Text>
                ))}
              </HStack>
              <Button
                onPress={openPieces}
                modifiers={[
                  buttonStyle("plain"),
                  accessibilityLabel("Show the pieces"),
                ]}
              >
                <HStack
                  spacing={4}
                  modifiers={[
                    frame({ maxWidth: Infinity }),
                    padding({ vertical: 6 }),
                  ]}
                >
                  <Image
                    systemName="chevron.up"
                    color={C.secondary}
                    modifiers={[f("caption2", "bold")]}
                  />
                  <Text
                    modifiers={[f("footnote"), foregroundStyle(C.secondary)]}
                  >{`${(n % DECK.length) + 1} of ${DECK.length} · tap to see the pieces`}</Text>
                </HStack>
              </Button>
            </VStack>
          </Inline>
          <Animated.View
            style={[
              stamp,
              {
                left: 16,
                borderColor: C.ok,
                opacity: likeOpacity,
                transform: [{ rotate: "-12deg" }],
              },
            ]}
          >
            <Txt v="title2" c={C.ok}>
              LIKE
            </Txt>
          </Animated.View>
          <Animated.View
            style={[
              stamp,
              {
                right: 16,
                borderColor: C.red,
                opacity: skipOpacity,
                transform: [{ rotate: "12deg" }],
              },
            ]}
          >
            <Txt v="title2" c={C.red}>
              SKIP
            </Txt>
          </Animated.View>
        </Animated.View>
      </View>
      {/* Figma node 34:1853: Back and Skip either side, a swipe hint between them; liking is swipe-only. */}
      <Inline fill style={{ alignSelf: "stretch" }}>
        <HStack modifiers={[padding({ horizontal: 18 })]}>
          <VStack spacing={4}>
            <IconCTA
              label="Back"
              icon="arrow.uturn.backward"
              size="large"
              disabled={!n}
              onPress={() => setN(n - 1)}
            />
            <Text modifiers={[f("caption", "semibold")]}>Back</Text>
          </VStack>
          <Spacer />
          <VStack spacing={2}>
            <HStack spacing={14}>
              <Text modifiers={[f("headline"), foregroundStyle(C.secondary)]}>
                ← Skip
              </Text>
              <Text modifiers={[f("headline"), foregroundStyle(C.secondary)]}>
                Like →
              </Text>
            </HStack>
            <Text modifiers={[f("footnote"), foregroundStyle(C.tertiary)]}>
              Swipe the card
            </Text>
          </VStack>
          <Spacer />
          <VStack spacing={4}>
            <IconCTA
              label="Skip"
              icon="xmark"
              size="large"
              tint="red"
              onPress={() => fling(-1)}
            />
            <Text modifiers={[f("caption", "semibold")]}>Skip</Text>
          </VStack>
        </HStack>
      </Inline>
    </ScrollView>
  );
}

// Picture height from the design; the card is the picture plus its info block, so the screen fits without scrolling.
const IMAGE_H = 300;
const CARD_H = IMAGE_H + 116;

const card = {
  backgroundColor: C.card,
  borderRadius: 20,
  borderCurve: "continuous",
} as const;
const stamp = {
  position: "absolute",
  top: 20,
  borderWidth: 3,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 2,
} as const;
