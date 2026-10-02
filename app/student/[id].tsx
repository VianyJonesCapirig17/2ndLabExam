import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Student } from '@/components/StudentCard';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, getStudentById } from '@/services/api';

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, logout } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudent = useCallback(async () => {
    if (!id || !/^[\w-]+$/.test(id)) {
      setError('Invalid student ID.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('Please sign in to load student details.');
      setStudent(await getStudentById(id, token));
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
        await logout();
        setError('Your session expired. Please sign in again.');
      } else if (cause instanceof ApiError && cause.status === 404) {
        setError('Student record not found.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not load this student.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, token, logout]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Details</Text>
      {loading ? <View style={styles.state}><ActivityIndicator color="#16803c" /><Text style={styles.text}>Loading student…</Text></View>
        : error ? <View style={styles.state} accessibilityLiveRegion="polite"><Text style={styles.error}>{error}</Text><Pressable accessibilityRole="button" onPress={loadStudent}><Text style={styles.link}>Try Again</Text></Pressable></View>
        : !student ? <Text style={styles.text}>No student record available.</Text> : null}
      <View style={styles.card}>
        <Text style={styles.text}>ID: {id || 'Not available'}</Text>
        <Text style={styles.text}>Name: {student?.name || '—'}</Text>
        <Text style={styles.text}>Email: {student?.email || '—'}</Text>
        <Text style={styles.text}>Course: {student?.course || '—'}</Text>
        <Text style={styles.text}>Section: {student?.section || '—'}</Text>
        <Text style={styles.text}>Date: {student?.date || '—'}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Back</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20, backgroundColor: '#f1f7f2' },
  title: { color: '#173b2d', fontSize: 28, fontWeight: '700' },
  state: { gap: 12, alignItems: 'center' },
  card: { backgroundColor: '#ffffff', padding: 20, gap: 16, borderRadius: 12 },
  text: { color: '#536579', fontSize: 16 },
  error: { color: '#b42318' },
  link: { color: '#16803c', padding: 12 },
  button: { backgroundColor: '#16803c', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
