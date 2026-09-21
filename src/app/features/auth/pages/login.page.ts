import { Component, inject, signal } from '@angular/core';
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
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly phone = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

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
