import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideUser,
  LucideBell,
  LucideLock,
  LucideStore,
  LucideSave,
  LucideCheckCircle2,
  LucideMapPin,
  LucideLoaderCircle
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { ToastService } from '../../../../services/toast.service';

export type SettingsTab = 'profile' | 'notifications' | 'security' | 'marketplace';

interface ToggleItem {
  key: string;
  label: string;
  detail: string;
  on: boolean;
}

interface TabOption {
  value: SettingsTab;
  label: string;
  icon: 'user' | 'bell' | 'lock' | 'store';
}

interface SettingsResponse {
  profile: { name: string; email: string; phone: string };
  notifications: Record<string, boolean>;
  marketplace: Record<string, boolean>;
  region: { location: string; currency: string };
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideUser,
    LucideBell,
    LucideLock,
    LucideStore,
    LucideSave,
    LucideCheckCircle2,
    LucideMapPin,
    LucideLoaderCircle
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class AdminSettingsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly tab = signal<SettingsTab>('profile');
  readonly saved = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly tabs: TabOption[] = [
    { value: 'profile', label: 'Profile', icon: 'user' },
    { value: 'notifications', label: 'Notifications', icon: 'bell' },
    { value: 'security', label: 'Security', icon: 'lock' },
    { value: 'marketplace', label: 'Marketplace', icon: 'store' }
  ];

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly oldPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly securityError = signal('');

  readonly notifyToggles = signal<ToggleItem[]>([
    { key: 'offerAlerts', label: 'New offer alerts', detail: 'Get notified the moment a buyer submits an offer.', on: true },
    { key: 'contactAlerts', label: 'Contact enquiry alerts', detail: 'Get notified on new contact messages.', on: true },
    { key: 'weeklyDigest', label: 'Weekly digest', detail: 'A summary of marketplace activity every Monday.', on: false },
    { key: 'listingUpdates', label: 'Listing updates', detail: 'When listings are sold, updated or expire.', on: true }
  ]);

  readonly marketToggles = signal<ToggleItem[]>([
    { key: 'autoApprove', label: 'Auto-approve listings', detail: 'Publish new listings without manual review.', on: false },
    { key: 'showPrices', label: 'Show drive-away prices', detail: 'Display on-road price estimates to buyers.', on: true },
    { key: 'whatsappOffers', label: 'WhatsApp offer notifications', detail: 'Send offer updates to buyers on WhatsApp.', on: true }
  ]);

  readonly location = signal('Karnataka, India');
  readonly currency = signal('₹ INR');

  ngOnInit(): void {
    this.http.get<SettingsResponse>(`${API_BASE}/admin/settings`).subscribe({
      next: (res) => {
        this.name.set(res.profile?.name || '');
        this.email.set(res.profile?.email || '');
        this.phone.set(res.profile?.phone || '');
        if (res.notifications) {
          this.notifyToggles.update((items) =>
            items.map((it) => ({ ...it, on: res.notifications[it.key] ?? it.on }))
          );
        }
        if (res.marketplace) {
          this.marketToggles.update((items) =>
            items.map((it) => {
              const key = it.key === 'showPrices' ? 'showDriveAwayPrices' : it.key;
              const altKey = it.key;
              const val = res.marketplace[key] ?? res.marketplace[altKey];
              return { ...it, on: val ?? it.on };
            })
          );
        }
        if (res.region) {
          this.location.set(res.region.location || 'Karnataka, India');
          this.currency.set(res.region.currency || '₹ INR');
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setTab(value: SettingsTab): void {
    this.tab.set(value);
    this.saved.set(false);
    this.securityError.set('');
  }

  toggle(key: string, list: WritableSignal<ToggleItem[]>): void {
    list.update((items) =>
      items.map((t) => (t.key === key ? { ...t, on: !t.on } : t))
    );
  }

  toggleNotify(key: string): void {
    this.toggle(key, this.notifyToggles);
  }

  toggleMarket(key: string): void {
    this.toggle(key, this.marketToggles);
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.saved.set(false);

    const tab = this.tab();
    let body: Record<string, unknown> = {};

    if (tab === 'profile') {
      body = { profile: { name: this.name(), email: this.email(), phone: this.phone() } };
    } else if (tab === 'notifications') {
      const n: Record<string, boolean> = {};
      for (const t of this.notifyToggles()) n[t.key] = t.on;
      body = { notifications: n };
    } else if (tab === 'marketplace') {
      const m: Record<string, boolean> = {};
      for (const t of this.marketToggles()) m[t.key] = t.on;
      body = { marketplace: m, region: { location: this.location(), currency: this.currency() } };
    }

    this.http.patch(`${API_BASE}/admin/settings`, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.toast.success('Settings saved', 'Your preferences are now live.');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error('Save failed', err?.error?.message || 'Could not save settings.');
      }
    });
  }

  changePassword(event: Event): void {
    event.preventDefault();
    if (this.newPassword() !== this.confirmPassword()) {
      this.securityError.set('New passwords do not match.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.securityError.set('New password must be at least 6 characters.');
      return;
    }
    this.securityError.set('');
    this.saving.set(true);
    this.http.patch(`${API_BASE}/admin/password`, {
      currentPassword: this.oldPassword(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.oldPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.saved.set(true);
        this.toast.success('Password updated', 'Your admin password was changed.');
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Could not update password.';
        this.securityError.set(msg);
      }
    });
  }
}
