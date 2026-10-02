import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { token, user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Student Portal</Text>
        </View>
        <Link href="/(app)/profile" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Open my profile" style={styles.profileButton}>
            <Ionicons name="person-outline" size={21} color="#16803c" />
          </Pressable>
        </Link>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroDecoration} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}><Ionicons name="school-outline" size={25} color="#ffffff" /></View>
          <View style={styles.welcomePill}><View style={styles.welcomeDot} /><Text style={styles.welcomePillText}>YOUR STUDENT SPACE</Text></View>
        </View>
        <Text style={styles.heroTitle}>Welcome{firstName ? `, ${firstName}` : ''}!</Text>
        <Text style={styles.heroText}>Your student services and records, all in one place.</Text>
        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>LEARN · CONNECT · GROW</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Your portal</Text>
          <Text style={styles.sectionSubtitle}>Pick up where you need to be.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Link href="/(app)/students" asChild>
          <Pressable accessibilityRole="button" style={styles.actionCard}>
            <View style={[styles.actionIcon, styles.studentsIcon]}><Ionicons name="people-outline" size={23} color="#16803c" /></View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Browse students</Text>
              <Text style={styles.actionText}>Search student records</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#8a9a90" />
          </Pressable>
        </Link>
        <Link href="/(app)/profile" asChild>
          <Pressable accessibilityRole="button" style={styles.actionCard}>
            <View style={[styles.actionIcon, styles.profileIcon]}><Ionicons name="person-outline" size={22} color="#4c70a0" /></View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>My profile</Text>
              <Text style={styles.actionText}>View your account details</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#8a9a90" />
          </Pressable>
        </Link>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionIcon}><Ionicons name="shield-checkmark-outline" size={21} color={token ? '#16803c' : '#7b8780'} /></View>
        <View style={styles.sessionCopy}>
          <Text style={styles.sessionTitle}>Account security</Text>
          <Text style={styles.sessionText}>{token ? 'You are signed in securely.' : 'Your session is unavailable.'}</Text>
        </View>
        <View style={[styles.statusDot, token ? styles.activeDot : styles.inactiveDot]} />
      </View>

      <Text style={styles.footerText}>STUDENT SERVICE PORTAL</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 25, paddingBottom: 30, gap: 21, backgroundColor: '#f3f7f3' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#16803c', fontSize: 10, fontWeight: '800', letterSpacing: 1.15, marginBottom: 4 },
  pageTitle: { color: '#173b2d', fontSize: 27, fontWeight: '800' },
  profileButton: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4ece5', alignItems: 'center', justifyContent: 'center' },
  hero: { overflow: 'hidden', width: '100%', minHeight: 224, justifyContent: 'center', padding: 23, borderRadius: 25, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4ece5', elevation: 2, shadowColor: '#173b2d', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  heroDecoration: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: '#eaf5ed', opacity: 0.8, right: -62, top: -80 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  heroIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaf5ed', marginBottom: 0 },
  welcomePill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f8f4', borderWidth: 1, borderColor: '#e1ece3' },
  welcomeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16803c' },
  welcomePillText: { color: '#3b6849', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  heroEyebrow: { color: '#cce8d3', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  heroTitle: { color: '#173b2d', fontSize: 27, lineHeight: 34, fontWeight: '800' },
  heroText: { maxWidth: 280, color: '#64756b', fontSize: 14, lineHeight: 21, marginTop: 5 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18 },
  heroFooterText: { color: '#718078', fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -9 },
  sectionTitle: { color: '#173b2d', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#7a8980', fontSize: 13, marginTop: 3 },
  actions: { gap: 12 },
  actionCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, backgroundColor: '#ffffff', borderRadius: 17, borderWidth: 1, borderColor: '#e4ece5', elevation: 1, shadowColor: '#173b2d', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  actionIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  studentsIcon: { backgroundColor: '#eaf5ed' },
  profileIcon: { backgroundColor: '#edf2f9' },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { color: '#173b2d', fontSize: 15, fontWeight: '700' },
  actionText: { color: '#7a8980', fontSize: 12 },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 17, backgroundColor: '#eaf4ec', borderWidth: 1, borderColor: '#dceade' },
  sessionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  sessionCopy: { flex: 1, gap: 3 },
  sessionTitle: { color: '#254b34', fontSize: 14, fontWeight: '700' },
  sessionText: { color: '#61776a', fontSize: 12 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  activeDot: { backgroundColor: '#16803c' },
  inactiveDot: { backgroundColor: '#9aa69e' },
  footerText: { color: '#a0aca4', fontSize: 9, fontWeight: '700', letterSpacing: 1.3, textAlign: 'center', marginTop: -5 },
});
