import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, getProfile } from '@/services/api';
import type { User } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initials = (profile?.name || profile?.email || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('Please sign in to load your profile.');
      setProfile(await getProfile(token));
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
        await logout();
        setError('Your session expired. Please sign in again.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not load your profile.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.eyebrow}>STUDENT PORTAL</Text>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your account information</Text>
      </View>
      <View style={styles.heroCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.name}>{profile?.name || 'Student'}</Text>
        {profile?.email ? <Text style={styles.heroEmail}>{profile.email}</Text> : null}
        <View style={styles.roleBadge}>
          <Ionicons name="school-outline" size={15} color="#16803c" />
          <Text style={styles.roleText}>{profile?.role || 'Student'}</Text>
        </View>
      </View>
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Account details</Text>
        {profile?.id !== undefined && profile.id !== null ? (
          <DetailRow icon="id-card-outline" label="Student ID" value={String(profile.id)} />
        ) : null}
        <DetailRow icon="person-outline" label="Full name" value={profile?.name || 'Not provided'} />
        <View style={styles.divider} />
        <DetailRow icon="mail-outline" label="Email address" value={profile?.email || 'Not provided'} />
        <View style={styles.divider} />
        <DetailRow icon="briefcase-outline" label="Account role" value={profile?.role || 'Student'} />
      </View>
      {loading ? (
        <View style={styles.feedbackCard}>
          <ActivityIndicator color="#16803c" />
          <Text style={styles.feedbackText}>Refreshing your profile…</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorCard} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle-outline" size={20} color="#a52e25" />
          <View style={styles.errorContent}>
            <Text style={styles.error}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={loadProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={styles.sessionCard}>
        <View style={styles.sessionIcon}><Ionicons name="shield-checkmark-outline" size={20} color={token ? '#16803c' : '#7b8780'} /></View>
        <View style={styles.sessionCopy}>
          <Text style={styles.sessionTitle}>Account security</Text>
          <Text style={styles.sessionText}>{token ? 'You are signed in securely.' : 'Your session is unavailable.'}</Text>
        </View>
        <View style={[styles.statusDot, token ? styles.activeDot : styles.inactiveDot]} />
      </View>
      <Pressable accessibilityRole="button" style={styles.logoutButton} onPress={() => void logout()}>
        <Ionicons name="log-out-outline" size={19} color="#a52e25" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}><Ionicons name={icon} size={19} color="#16803c" /></View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, paddingTop: 30, paddingBottom: 32, gap: 18, backgroundColor: '#f3f7f3' },
  topBar: { gap: 5, marginBottom: 2 },
  eyebrow: { color: '#16803c', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#173b2d', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#718078', fontSize: 14 },
  heroCard: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 24, borderRadius: 22, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4ece5', elevation: 2, shadowColor: '#173b2d', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  avatar: { width: 84, height: 84, borderRadius: 28, backgroundColor: '#e4f2e7', borderWidth: 4, borderColor: '#f3f8f4', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#16803c', fontSize: 28, fontWeight: '800' },
  name: { color: '#173b2d', fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center' },
  heroEmail: { color: '#718078', fontSize: 14, marginTop: 4, textAlign: 'center' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#edf7ef', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, marginTop: 14 },
  roleText: { color: '#315c40', fontSize: 13, fontWeight: '700' },
  detailsCard: { width: '100%', padding: 20, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4ece5', elevation: 2, shadowColor: '#173b2d', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sectionTitle: { color: '#173b2d', fontSize: 17, fontWeight: '800', marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  detailIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#edf7ef', alignItems: 'center', justifyContent: 'center' },
  detailCopy: { flex: 1, gap: 3 },
  detailLabel: { color: '#819087', fontSize: 12, fontWeight: '600' },
  detailValue: { color: '#263e32', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#edf1ed' },
  feedbackCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: '#ffffff' },
  feedbackText: { color: '#536579', fontSize: 13 },
  errorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14, backgroundColor: '#fff2f0', borderWidth: 1, borderColor: '#f4d1cd' },
  errorContent: { flex: 1, gap: 6 },
  error: { color: '#8f2922', fontSize: 14, lineHeight: 20 },
  retryButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  retryText: { color: '#a52e25', fontSize: 14, fontWeight: '700' },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 17, backgroundColor: '#eaf4ec', borderWidth: 1, borderColor: '#dceade' },
  sessionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  sessionCopy: { flex: 1, gap: 3 },
  sessionTitle: { color: '#254b34', fontSize: 14, fontWeight: '700' },
  sessionText: { color: '#61776a', fontSize: 12 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  activeDot: { backgroundColor: '#16803c' },
  inactiveDot: { backgroundColor: '#9aa69e' },
  logoutButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f0d9d7', padding: 14, borderRadius: 14 },
  logoutText: { color: '#a52e25', fontSize: 15, fontWeight: '700' },
});
