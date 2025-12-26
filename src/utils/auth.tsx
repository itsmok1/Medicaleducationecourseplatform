import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6119645`;

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function signupUser(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  return response.json();
}

export async function checkSession(accessToken: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

export function saveAuthToLocalStorage(user: AuthUser) {
  localStorage.setItem('authUser', JSON.stringify(user));
}

export function getAuthFromLocalStorage(): AuthUser | null {
  const stored = localStorage.getItem('authUser');
  return stored ? JSON.parse(stored) : null;
}

export function clearAuthFromLocalStorage() {
  localStorage.removeItem('authUser');
}