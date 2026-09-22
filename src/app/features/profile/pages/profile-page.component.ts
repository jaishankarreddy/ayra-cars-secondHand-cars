import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideUser,
  LucideMail,
  LucidePhone,
  LucideShieldCheck,
  LucideHeart,
  LucideLogOut,
  LucidePencil,
  LucideSave,
  LucideX,
  LucideBadgeCheck,
  LucideMapPin,
  LucideArrowRight
} from '@lucide/angular';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { FooterComponent } from '../../home/components/footer/footer.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent,
    LucideUser,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideHeart,
    LucideLogOut,
    LucidePencil,
    LucideSave,
    LucideX,
    LucideBadgeCheck,
    LucideMapPin,
    LucideArrowRight
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');

  // editable fields
  readonly editName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');

  readonly initials = computed(() => {
    const name = this.user()?.name || this.user()?.email || 'U';
    return name.split(' ').map(p=>p.charAt(0)).slice(0,2).join('').toUpperCase();
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigateByUrl('/auth/login?returnUrl=/profile');
      return;
    }
    this.auth.fetchProfile().subscribe({
      next: () => {
        this.loading.set(false);
        this.resetEdit();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load profile. Please try again.');
      }
    });
  }

  resetEdit(): void {
    const u = this.user();
    if (u) {
      this.editName.set(u.name || '');
      this.editEmail.set(u.email || '');
      this.editPhone.set(u.phone || '');
    }
    this.editMode.set(false);
    this.error.set('');
    this.success.set('');
  }

  startEdit(): void {
    this.resetEdit();
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.resetEdit();
  }

  save(): void {
    const name = this.editName().trim();
    const email = this.editEmail().trim().toLowerCase();
    const phone = this.editPhone().trim().replace(/\s+/g,'');
    if (!name) { this.error.set('Name cannot be empty.'); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { this.error.set('Please enter a valid email.'); return; }
    if (phone && !/^\d{10,15}$/.test(phone)) { this.error.set('Please enter a valid 10-digit mobile number.'); return; }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.updateProfile({ name, email: email || undefined, phone: phone || undefined }).subscribe({
      next: ({ user }) => {
        this.saving.set(false);
        this.editMode.set(false);
        this.success.set('Profile updated successfully.');
        this.toast.success('Profile updated', 'Your details have been saved.');
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to update profile. Please try again.';
        this.error.set(msg);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.toast.info('Logged out', 'You have been signed out.');
    this.router.navigateByUrl('/');
  }
}
