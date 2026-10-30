import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/store';
import { C, T } from '@/theme';
import { Button, Group, Icon, Txt, s } from '@/ui';

export default function Login() {
  const { setLoggedIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // ponytail: no auth backend — any non-empty email + password signs in.
  const logIn = () => {
    setBusy(true);
    setTimeout(() => setLoggedIn(true), 1200);
  };

  const field = { ...T.body, flex: 1, color: C.label } as const;

  return (
    <SafeAreaView style={s.screen}>
      {/* Scrolls instead of squashing when the keyboard is up. */}
      <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 56, gap: 10 }}>
          <View style={{ width: 76, height: 76, borderRadius: 18, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' }}>
            <Icon name="hanger" size={44} color="#fff" />
          </View>
          <Txt v="largeTitle" style={{ fontWeight: '800', letterSpacing: 3 }}>DRIPPED</Txt>
          <Txt v="subhead" c={C.secondary}>Your wardrobe, styled for every event.</Txt>
        </View>

        <Group style={{ marginTop: 40 }}>
          <View style={[s.row, { height: 50 }]}>
            <Txt style={{ width: 84 }}>Email</Txt>
            <TextInput style={field} value={email} onChangeText={setEmail} placeholder="name@smu.edu.sg" placeholderTextColor={C.tertiary}
              keyboardType="email-address" textContentType="username" autoCapitalize="none" autoComplete="email" returnKeyType="next" />
          </View>
          <View style={[s.row, { height: 50 }]}>
            <Txt style={{ width: 84 }}>Password</Txt>
            <TextInput style={field} value={password} onChangeText={setPassword} placeholder="Required" placeholderTextColor={C.tertiary}
              secureTextEntry textContentType="password" returnKeyType="go" onSubmitEditing={() => email && password && logIn()} />
          </View>
        </Group>
        <Pressable style={{ alignSelf: 'flex-end', marginVertical: 12 }} hitSlop={8}>
          <Txt v="footnote" c={C.blue}>Forgot password?</Txt>
        </Pressable>

        <Button title={busy ? 'Logging in…' : 'Log in'} loading={busy} disabled={!email || !password} onPress={logIn} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }}>
          <View style={{ flex: 1, height: 0.5, backgroundColor: C.separator }} />
          <Txt v="footnote" c={C.secondary}>or</Txt>
          <View style={{ flex: 1, height: 0.5, backgroundColor: C.separator }} />
        </View>
        {/* ponytail: stand-in for ASAuthorizationAppleIDButton; add expo-apple-authentication for real Sign in with Apple. */}
        <Pressable onPress={logIn} style={({ pressed }) => [s.btn, { backgroundColor: '#000', opacity: pressed ? 0.7 : 1 }]}>
          <Icon name="apple.logo" color="#fff" size={18} />
          <Txt v="headline" c="#fff">Continue with Apple</Txt>
        </Pressable>

        <View style={{ flex: 1 }} />
        <Txt v="footnote" c={C.secondary} style={{ textAlign: 'center', marginBottom: 12 }}>
          New to DRIPPED? <Txt v="footnote" c={C.blue}>Create an account</Txt>
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}
