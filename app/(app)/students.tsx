import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StudentCard, { type Student } from '@/components/StudentCard';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, deleteStudent, getStudents } from '@/services/api';

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const { token, logout } = useAuth();

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('Please sign in to load students.');
      setStudents(await getStudents(token));
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
        await logout();
        setError('Your session expired. Please sign in again.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not load students.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const performDelete = useCallback(async (student: Student) => {
    if (student.id === undefined || student.id === null) return;
    const studentId = String(student.id);
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in before deleting a student.');
      return;
    }

    setDeletingStudentId(studentId);
    try {
      await deleteStudent(studentId, token);
      setStudents((current) => current.filter((record) => String(record.id) !== studentId));
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
        await logout();
        Alert.alert('Session expired', 'Please sign in again before deleting a student.');
      } else {
        Alert.alert('Could not delete student', cause instanceof Error ? cause.message : 'Please try again.');
      }
    } finally {
      setDeletingStudentId(null);
    }
  }, [token, logout]);

  const confirmDelete = useCallback((student: Student) => {
    Alert.alert('Delete student?', `Delete ${student.name || 'this student'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void performDelete(student); } },
    ]);
  }, [performDelete]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const query = search.trim().toLocaleLowerCase();
  const filteredStudents = students.filter((student) =>
    [student.name, student.email, student.course, student.section, student.date].some((value) => value?.toLocaleLowerCase().includes(query)),
  );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.headingTop}>
          <View style={styles.headingIcon}><Ionicons name="people-outline" size={23} color="#16803c" /></View>
          <Text style={styles.eyebrow}>STUDENT PORTAL</Text>
        </View>
        <Text style={styles.title}>Student Records</Text>
        <Text style={styles.subtitle}>Browse and manage student information.</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#819087" />
        <TextInput style={styles.input} accessibilityLabel="Search students" placeholder="Search name, email, or course" placeholderTextColor="#85938a" value={search} onChangeText={setSearch} returnKeyType="search" />
        {search ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={19} color="#819087" />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.resultsRow}>
        <Text style={styles.resultsLabel}>{query ? 'Search results' : 'All students'}</Text>
        {!loading && !error ? <Text style={styles.resultsCount}>{filteredStudents.length} {filteredStudents.length === 1 ? 'record' : 'records'}</Text> : null}
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color="#16803c" />
          <Text style={styles.stateTitle}>Loading records</Text>
          <Text style={styles.text}>Please wait while student information is loaded.</Text>
        </View>
      ) : error ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <View style={styles.emptyIcon}><Ionicons name="cloud-offline-outline" size={25} color="#a52e25" /></View>
          <Text style={styles.stateTitle}>Couldn’t load students</Text>
          <Text style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" style={styles.retryButton} onPress={loadStudents}>
            <Ionicons name="refresh-outline" size={17} color="#ffffff" />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          data={filteredStudents}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={({ item }) => <StudentCard student={item} onDelete={confirmDelete} deleting={deletingStudentId === String(item.id)} />}
          ListEmptyComponent={
            <View style={styles.state}>
              <View style={styles.emptyIcon}><Ionicons name={query ? 'search-outline' : 'people-outline'} size={25} color="#16803c" /></View>
              <Text style={styles.stateTitle}>{query ? 'No matching students' : 'No student records yet'}</Text>
              <Text style={styles.text}>{query ? 'Try another name, email, or course.' : 'Student records will appear here when available.'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 26, backgroundColor: '#f3f7f3' },
  heading: { width: '100%', gap: 5, marginBottom: 20 },
  headingTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  headingIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#e4f2e7' },
  eyebrow: { color: '#16803c', fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  title: { fontSize: 27, fontWeight: '800', color: '#173b2d' },
  subtitle: { color: '#718078', fontSize: 14, lineHeight: 20 },
  searchBox: { width: '100%', minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e0e9e1', borderRadius: 15, backgroundColor: '#ffffff', elevation: 1, shadowColor: '#173b2d', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  input: { flex: 1, minHeight: 50, paddingVertical: 10, color: '#173b2d', fontSize: 14 },
  clearButton: { width: 34, height: 42, alignItems: 'center', justifyContent: 'center' },
  resultsRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  resultsLabel: { color: '#173b2d', fontSize: 16, fontWeight: '700' },
  resultsCount: { color: '#587061', fontSize: 12, fontWeight: '700', backgroundColor: '#e6f1e8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  list: { width: '100%' },
  listContent: { paddingBottom: 22 },
  state: { width: '100%', padding: 24, gap: 11, alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4ece5', borderRadius: 18, marginTop: 4 },
  emptyIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#edf7ef', marginBottom: 2 },
  stateTitle: { color: '#173b2d', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  text: { color: '#718078', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  error: { color: '#8f2922', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 11, backgroundColor: '#16803c', marginTop: 3 },
  retryText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
