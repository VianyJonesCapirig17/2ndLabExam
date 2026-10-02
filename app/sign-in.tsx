import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { login as authenticate } from '@/services/api';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login: storeLogin } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password) {
      setError('Enter a valid email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await authenticate(email.trim(), password);
      await storeLogin(result.token, result.user);
      router.replace('/(app)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <StatusBar barStyle="dark-content" backgroundColor="#f1f7f2" />
      <View style={styles.card}>
        <View style={styles.brandMark}>
          <Ionicons name="school-outline" size={26} color="#16803c" />
        </View>
        <Text style={styles.title}>Student Service Portal</Text>
        <Text style={styles.subtitle}>Sign in to access student services.</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} accessibilityLabel="Email" placeholder="student@example.com" placeholderTextColor="#87958c" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordField}>
          <TextInput style={styles.passwordInput} accessibilityLabel="Password" placeholder="student-demo-2026" placeholderTextColor="#87958c" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoComplete="current-password" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityState={{ selected: showPassword }}
            onPress={() => setShowPassword((visible) => !visible)}
            style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#16803c" />
          </Pressable>
        </View>
        <View style={styles.feedback} accessibilityLiveRegion="polite">
          {loading && <ActivityIndicator color="#16803c" accessibilityLabel="Signing in" />}
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Login'}</Text>
        </Pressable>
        <Text style={styles.note}>Use the account credentials provided for this exam.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f1f7f2' },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 26, borderRadius: 22, backgroundColor: '#ffffff', shadowColor: '#173b2d', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4 },
  brandMark: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#eaf5ed', marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 0.8, fontWeight: '700', color: '#16803c', marginBottom: 10 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: '#173b2d' },
  subtitle: { color: '#536579', fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 26 },
  label: { color: '#173b2d', fontWeight: '600', fontSize: 14, marginBottom: 8 },
  input: { minHeight: 54, borderWidth: 1, borderColor: '#d6e2d8', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 18, color: '#173b2d', backgroundColor: '#f9fbf9' },
  passwordField: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d6e2d8', borderRadius: 12, marginBottom: 18, backgroundColor: '#f9fbf9' },
  passwordInput: { flex: 1, minHeight: 52, paddingHorizontal: 15, fontSize: 16, color: '#173b2d' },
  eyeButton: { minWidth: 52, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  feedback: { marginBottom: 14 },
  error: { color: '#a52e25', backgroundColor: '#fff2f0', borderColor: '#f4d1cd', borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, lineHeight: 20 },
  button: { minHeight: 54, backgroundColor: '#16803c', paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#16803c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 },
  buttonDisabled: { opacity: 0.72 },
  buttonText: { color: '#ffffff', fontWeight: '700' },
  note: { color: '#64756b', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
});
