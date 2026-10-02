import type { Student } from '@/components/StudentCard';
import { API_BASE_URL } from '@/constants/api';
import type { User } from '@/context/AuthContext';

type ApiRecord = Record<string, unknown>;

type LoginResponse = ApiRecord & {
  access_token?: unknown;
  accessToken?: unknown;
  token?: unknown;
  user?: unknown;
  profile?: unknown;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function apiUrl(path: string) {
  const configuredBaseUrl: string = API_BASE_URL;
  if (!configuredBaseUrl || configuredBaseUrl === 'REPLACE_WITH_EXAM_API') {
    throw new Error('Set the instructor-provided API base URL in constants/api.ts.');
  }
  const baseUrl = configuredBaseUrl.replace(/\/$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function responseError(response: Response) {
  let message = `Request failed (${response.status}).`;
  try {
    const text = await response.text();
    const body: unknown = JSON.parse(text);
    if (isRecord(body)) {
      if (typeof body.message === 'string') message = body.message;
      else if (typeof body.error === 'string') message = body.error;
    }
  } catch {
    // Keep the status-based message for empty or non-JSON error responses.
  }
  return new ApiError(message, response.status);
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown; parseJson?: boolean } = {},
): Promise<T> {
  const { method = 'GET', token, body, parseJson = true } = options;
  if (token !== undefined && !token.trim()) throw new Error('Authentication is required for this request.');

  const url = apiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new Error('The API request timed out. Check that the API is online and reachable from this device.');
    }
    throw new Error('Could not reach the API. Check the base URL and network connection.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) throw await responseError(response);
  if (!parseJson || response.status === 204) return undefined as T;

  try {
    return await response.json() as T;
  } catch {
    throw new Error('The API returned an invalid JSON response.');
  }
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const payload = await request<LoginResponse>('/login', {
    method: 'POST',
    body: { email, password },
  });
  const token = payload.access_token ?? payload.accessToken ?? payload.token;
  if (typeof token !== 'string' || !token) {
    throw new Error('The login response did not include an access token.');
  }

  const user = payload.user ?? payload.profile;
  return { token, user: isRecord(user) ? user as User : {} };
}

export async function getStudents(token: string): Promise<Student[]> {
  const payload: unknown = await request('/students', { token });
  const list = Array.isArray(payload)
    ? payload
    : isRecord(payload) ? payload.students ?? payload.data : undefined;
  if (!Array.isArray(list)) {
    throw new Error('The students endpoint returned an unexpected response.');
  }
  return list as Student[];
}

export async function getStudentById(id: string, token: string): Promise<Student> {
  const payload: unknown = await request(`/students/${encodeURIComponent(id)}`, { token });
  const student = isRecord(payload) ? payload.student ?? payload.data ?? payload : payload;
  if (!isRecord(student)) throw new Error('The student endpoint returned an unexpected response.');
  return student as Student;
}

export async function getProfile(token: string): Promise<User> {
  const payload: unknown = await request('/profile', { token });
  const profile = isRecord(payload) ? payload.user ?? payload.profile ?? payload : payload;
  if (!isRecord(profile)) throw new Error('The profile endpoint returned an unexpected response.');
  return profile as User;
}

export async function deleteStudent(id: string, token: string): Promise<void> {
  await request(`/students/${encodeURIComponent(id)}`, { method: 'DELETE', token, parseJson: false });
}
