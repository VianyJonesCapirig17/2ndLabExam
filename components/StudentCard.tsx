import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// TODO EXAM: Match these fields to the authorized student records used by the API.
export type Student = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  course?: string | null;
  section?: string | null;
  date?: string | null;
};

export default function StudentCard({ student, onDelete, deleting = false }: { student: Student; onDelete?: (student: Student) => void; deleting?: boolean }) {
  const router = useRouter();
  const initials = (student.name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const handleViewDetails = () => {
    if (student.id === undefined || student.id === null || String(student.id).trim() === '') return;
    router.push({ pathname: '/student/[id]', params: { id: String(student.id) } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>{student.name || 'Name not available'}</Text>
          {student.email ? (
            <View style={styles.emailRow}>
              <Ionicons name="mail-outline" size={14} color="#819087" />
              <Text style={styles.email} numberOfLines={1}>{student.email}</Text>
            </View>
          ) : null}
        </View>
        {onDelete ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${student.name || 'student'}`} disabled={deleting} style={styles.deleteButton} onPress={() => onDelete(student)}>
            {deleting ? <ActivityIndicator size="small" color="#b42318" /> : <Ionicons name="trash-outline" size={19} color="#b42318" />}
          </Pressable>
        ) : null}
      </View>
      {student.course || student.section || student.date ? (
        <View style={styles.metadata}>
          {student.course ? (
            <View style={styles.courseBadge}>
              <Ionicons name="book-outline" size={14} color="#16803c" />
              <Text style={styles.courseText} numberOfLines={1}>{student.course}</Text>
            </View>
          ) : null}
          {student.section ? <Text style={styles.metadataText}>Section {student.section}</Text> : null}
          {student.date ? <Text style={styles.metadataText}>{student.date}</Text> : null}
        </View>
      ) : null}
      <View style={styles.footer}>
        {student.id !== undefined && student.id !== null ? <Text style={styles.studentId}>ID: {student.id}</Text> : <View />}
        <Pressable accessibilityRole="button" style={styles.button} onPress={handleViewDetails}>
          <Text style={styles.buttonText}>View profile</Text>
          <Ionicons name="arrow-forward" size={16} color="#16803c" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: '#ffffff', marginBottom: 13, gap: 14, borderWidth: 1, borderColor: '#e4ece5', elevation: 2, shadowColor: '#173b2d', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#eaf5ed', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#16803c', fontSize: 16, fontWeight: '800' },
  identity: { flex: 1, gap: 5 },
  name: { color: '#173b2d', fontSize: 16, fontWeight: '700' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  email: { flexShrink: 1, color: '#819087', fontSize: 12 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  courseBadge: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#edf7ef', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  courseText: { flexShrink: 1, color: '#315c40', fontSize: 12, fontWeight: '700' },
  metadataText: { color: '#718078', fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#edf1ed', paddingTop: 12 },
  studentId: { color: '#819087', fontSize: 12, fontWeight: '600' },
  button: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: '#edf7ef' },
  buttonText: { color: '#16803c', fontWeight: '700' },
  deleteButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#fff1f0' },
});
