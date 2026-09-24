import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_BASE } from '@config/api';

const TOKEN_KEY = 'ayracars-admin-token';
const ADMIN_KEY = 'ayracars-admin';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminProfile;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(this.hasToken());
  readonly admin = signal<AdminProfile | null>(this.readAdmin());
  private sessionChecked = false;

  login(email: string, password: string): Observable<AdminLoginResponse> {
    return this.http
      .post<AdminLoginResponse>(`${API_BASE}/admin/login`, { email, password })
      .pipe(
        tap((res) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, res.token);
            window.localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
          }
          this.admin.set(res.admin);
          this.isAuthenticated.set(true);
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_KEY);
    }
    this.admin.set(null);
    this.isAuthenticated.set(false);
    this.sessionChecked = true;
  }

  /**
   * Persistent login: a stored token keeps the admin signed in across visits
   * (30-day server expiry). Validated once per page load against /admin/me so
   * expired, revoked or deactivated sessions fall back to the login page.
   */
  validateSession(): Observable<boolean> {
    if (!this.hasToken()) {
      this.sessionChecked = true;
      return of(false);
    }
    if (this.sessionChecked) {
      return of(this.isAuthenticated());
    }
    return this.http.get<{ admin: AdminProfile }>(`${API_BASE}/admin/me`).pipe(
      tap((res) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
        }
        this.admin.set(res.admin);
        this.isAuthenticated.set(true);
        this.sessionChecked = true;
      }),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);
  }

  private readAdmin(): AdminProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(ADMIN_KEY);
      return raw ? (JSON.parse(raw) as AdminProfile) : null;
    } catch {
      return null;
    }
  }
}
