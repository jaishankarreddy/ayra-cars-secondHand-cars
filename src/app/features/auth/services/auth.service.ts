import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '@config/api';

const TOKEN_KEY = 'ayracars-user-token';
const USER_KEY = 'ayracars-user';

export interface AuthUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(this.hasToken());
  readonly user = signal<AuthUser | null>(this.readUser());

  register(phone: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, { phone, password }).pipe(
      tap((res) => this.persist(res))
    );
  }

  login(phone: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, { phone, password }).pipe(
      tap((res) => this.persist(res))
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/google`, { idToken }).pipe(
      tap((res) => this.persist(res))
    );
  }

  fetchProfile(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${API_BASE}/auth/me`).pipe(
      tap(({ user }) => {
        if (typeof window !== 'undefined') window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  updateProfile(patch: Partial<Pick<AuthUser, 'name' | 'email' | 'phone' | 'avatar'>>): Observable<{ user: AuthUser }> {
    return this.http.patch<{ user: AuthUser }>(`${API_BASE}/auth/me`, patch).pipe(
      tap(({ user }) => {
        if (typeof window !== 'undefined') window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  token(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  }

  private persist(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, res.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    this.user.set(res.user);
    this.isAuthenticated.set(true);
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
