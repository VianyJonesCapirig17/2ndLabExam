// TODO EXAM: Set this to the PC's LAN address running the JavaScript API.
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.254.5:3000/api').replace(/\/$/, '');
// TODO EXAM: Keep client request/response fields aligned with the JavaScript API.

export function apiUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("API is not configured. Set EXPO_PUBLIC_API_URL to your instructor's API base URL.");
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readApiError(response: Response) {
  let message = `Request failed (${response.status}).`;
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') message = body.message;
    else if (typeof body?.error === 'string') message = body.error;
  } catch {
    // Keep the status based message when the server does not return JSON.
  }
  return message;
}
