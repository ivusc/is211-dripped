import { Button, Form, HStack, Image, SecureField, Section, Text, TextField, VStack } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled, buttonBorderShape, buttonStyle, controlSize, font, foregroundStyle, frame, kerning, keyboardType, listRowBackground,
  multilineTextAlignment, padding, submitLabel, onSubmit, textContentType, textInputAutocapitalization, tint,
} from '@expo/ui/swift-ui/modifiers';
import { Image as ExpoImage } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '@/store';
import { C } from '@/theme';
import { Actions, CTA, RN, Screen, f, secondary } from '@/ui';

// Light cyan → royal blue → navy, sampled from the logo.
const LOGO_GRADIENT = foregroundStyle({ type: 'linearGradient', colors: ['#33BBF7', '#0A7ADB', '#0D43A8'], startPoint: { x: 0, y: 0.5 }, endPoint: { x: 1, y: 0.5 } });

export default function Login() {
  const { setLoggedIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const ready = !!email && !!password && !busy;

  // ponytail: no auth backend — any non-empty email + password signs in.
  const logIn = () => {
    setBusy(true);
    setTimeout(() => setLoggedIn(true), 1200);
  };

  return (
    <Screen>
      <Form>
        <Section modifiers={[listRowBackground('clear')]}>
          <VStack spacing={10} modifiers={[frame({ maxWidth: Infinity }), padding({ top: 32, bottom: 8 })]}>
            <RN>
              <ExpoImage source={require('../../assets/images/icon.png')} contentFit="cover"
                style={{ width: 96, height: 96, borderRadius: 22, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }} />
            </RN>
            <Text modifiers={[font({ textStyle: 'largeTitle', weight: 'heavy' }), kerning(3), LOGO_GRADIENT]}>DRIPPED</Text>
            <Text modifiers={[f('subheadline'), secondary, multilineTextAlignment('center')]}>Your wardrobe, styled for every event.</Text>
          </VStack>
        </Section>

        <Section>
          <HStack>
            <Text modifiers={[frame({ width: 92, alignment: 'leading' })]}>Email</Text>
            <TextField placeholder="name@smu.edu.sg" onTextChange={setEmail}
              modifiers={[keyboardType('email-address'), textContentType('username'), textInputAutocapitalization('never'), autocorrectionDisabled(), submitLabel('next')]} />
          </HStack>
          <HStack>
            <Text modifiers={[frame({ width: 92, alignment: 'leading' })]}>Password</Text>
            <SecureField placeholder="Required" onTextChange={setPassword}
              modifiers={[textContentType('password'), submitLabel('go'), onSubmit(() => ready && logIn())]} />
          </HStack>
        </Section>

        <Actions>
          <CTA label={busy ? 'Logging in…' : 'Log in'} disabled={!ready} onPress={logIn} />
          {/* ponytail: stand-in for ASAuthorizationAppleIDButton; add expo-apple-authentication for real Sign in with Apple. */}
          <Button onPress={logIn} modifiers={[buttonStyle('borderedProminent'), controlSize('large'), buttonBorderShape('capsule'), tint('black')]}>
            <HStack spacing={6} modifiers={[frame({ maxWidth: Infinity })]}>
              <Image systemName="apple.logo" color="white" />
              <Text modifiers={[f('body', 'semibold'), foregroundStyle('white')]}>Continue with Apple</Text>
            </HStack>
          </Button>
          <Button label="Forgot password?" onPress={() => {}} modifiers={[f('footnote')]} />
          <HStack spacing={4} modifiers={[padding({ top: 24 })]}>
            <Text modifiers={[f('footnote'), secondary]}>New to DRIPPED?</Text>
            <Button label="Create an account" onPress={() => {}} modifiers={[f('footnote', 'semibold')]} />
          </HStack>
        </Actions>
      </Form>
    </Screen>
  );
}
