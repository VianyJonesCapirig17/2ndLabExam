import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';

const backendDirectory = dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const examEmail = process.env.EXAM_EMAIL?.trim().toLowerCase();
const passwordHash = process.env.EXAM_PASSWORD_HASH;
const studentsFile = resolve(backendDirectory, process.env.STUDENTS_FILE || './data/students.json');
const sessions = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

function authenticate(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
  const session = match ? sessions.get(match[1]) : undefined;
  if (!session || session.expiresAt <= Date.now()) {
    if (match) sessions.delete(match[1]);
    return res.status(401).json({ message: 'Authentication is required.' });
  }
  req.authenticatedUser = session.user;
  next();
}

async function readStudents() {
  try {
    const contents = await readFile(studentsFile, 'utf8');
    const records = JSON.parse(contents);
    if (!Array.isArray(records)) throw new Error('Student data must be a JSON array.');
    return records;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeStudents(students) {
  await writeFile(studentsFile, `${JSON.stringify(students, null, 2)}\n`, 'utf8');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', async (req, res) => {
  if (!examEmail || !passwordHash) {
    return res.status(503).json({ message: 'Run npm run api:setup to configure login credentials.' });
  }

  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(422).json({ message: 'Email and password are required.' });
  }

  const emailMatches = email.trim().toLowerCase() === examEmail;
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const user = { name: 'Viany Jones Capirig', email: examEmail, role: 'Student' };
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { user, expiresAt: Date.now() + sessionLifetimeMs });
  res.json({ access_token: token, user });
});

app.get('/api/students', authenticate, async (_req, res) => {
  res.json(await readStudents());
});

app.get('/api/students/:id', authenticate, async (req, res) => {
  const students = await readStudents();
  const student = students.find((record) => String(record?.id) === req.params.id);
  if (!student) return res.status(404).json({ message: 'Student record not found.' });
  res.json(student);
});

app.delete('/api/students/:id', authenticate, async (req, res) => {
  const students = await readStudents();
  const studentIndex = students.findIndex((record) => String(record?.id) === req.params.id);
  if (studentIndex === -1) return res.status(404).json({ message: 'Student record not found.' });
  students.splice(studentIndex, 1);
  await writeStudents(students);
  res.status(204).end();
});

app.get('/api/profile', authenticate, (req, res) => {
  res.json(req.authenticatedUser);
});

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = Number.isInteger(error.status) && error.status < 500 ? error.status : 500;
  res.status(status).json({ message: status === 500 ? 'The API encountered an internal error.' : error.message });
});

app.listen(port, host, () => {
  console.log(`Student Service API listening at http://${host}:${port}`);
});