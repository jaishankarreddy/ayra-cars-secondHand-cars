import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideSmartphone,
  LucideShieldCheck,
  LucideLoaderCircle,
  LucideArrowRight
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';
import { googleReady, promptGoogleOneTap } from '../utils/google-one-tap.util';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideEye,
    LucideEyeOff,
    LucideLock,
    LucideSmartphone,
    LucideShieldCheck,
    LucideLoaderCircle,
    LucideArrowRight
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly phone = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly error = signal('');

  ngAfterViewInit(): void {
    this.initGoogle();
  }

  private initGoogle(): void {
    const clientId = environment.googleClientId;
    if (!clientId || typeof (window as any).google === 'undefined') return;
    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: any) => this.handleGoogle(res.credential),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      const el = document.getElementById('google-btn-login');
      if (el) (window as any).google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'pill' });
    } catch {}
  }

  handleGoogle(idToken: string): void {
    if (!idToken) return;
    this.googleLoading.set(true);
    this.error.set('');
    this.auth.googleLogin(idToken).subscribe({
      next: () => {
        this.googleLoading.set(false);
        this.toast.success('Welcome back', 'Signed in with Google.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/');
      },
      error: (err: unknown) => {
        this.googleLoading.set(false);
        const message = (err as { error?: { message?: string } })?.error?.message || 'Google sign-in failed. Please try again.';
        this.error.set(message);
      }
    });
  }

  triggerGoogleOneTap(): void {
    if (!googleReady()) {
      this.error.set('Google sign-in is not ready. Please refresh or add Client ID in environment.ts');
      return;
    }
    promptGoogleOneTap((message) => this.error.set(message));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const phone = this.phone().trim().replace(/\s+/g, '');
    if (!phone) {
      this.error.set('Please enter your mobile number.');
      return;
    }
    if (!this.password()) {
      this.error.set('Please enter your password.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.login(phone, this.password()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Welcome back', 'You are now signed in.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/');
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ||
          'Invalid mobile number or password.';
        this.error.set(message);
      }
    });
  }
}
