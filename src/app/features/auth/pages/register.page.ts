import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideShieldCheck,
  LucideLoaderCircle,
  LucideArrowRight
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideEye,
    LucideEyeOff,
    LucideLock,
    LucideShieldCheck,
    LucideLoaderCircle,
    LucideArrowRight
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPageComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
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
    if (!/^\d{10,15}$/.test(phone)) {
      this.error.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!this.password()) {
      this.error.set('Please create a password.');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.register(phone, this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Account created', 'Welcome to Ayra Cars!');
        this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ||
          'Registration failed. Please try again.';
        this.error.set(message);
      }
    });
  }
}
