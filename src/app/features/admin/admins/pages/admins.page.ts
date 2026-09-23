import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideSearch,
  LucidePlus,
  LucideX,
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideShieldCheck,
  LucideChevronLeft,
  LucideChevronRight
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminAuthService, AdminProfile } from '../../services/admin-auth.service';
import { ToastService } from '../../../../services/toast.service';

export interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export type AdminFilter = 'all' | 'active' | 'inactive';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

@Component({
  selector: 'app-admins-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucidePlus,
    LucideX,
    LucideCheck,
    LucideEye,
    LucideEyeOff,
    LucideMail,
    LucideShieldCheck,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './admins.page.html',
  styleUrl: './admins.page.scss'
})
export class AdminAdminsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly toast = inject(ToastService);

  readonly admins = signal<AdminManagedUser[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly statusFilter = signal<AdminFilter>('all');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly modalOpen = signal(false);
  readonly editing = signal<AdminManagedUser | null>(null);
  readonly formName = signal('');
  readonly formEmail = signal('');
  readonly formPassword = signal('');
  readonly formActive = signal(true);
  readonly showPassword = signal(false);
  readonly formError = signal('');
  readonly saving = signal(false);

  readonly deleteTarget = signal<AdminManagedUser | null>(null);
  readonly deleting = signal(false);

  readonly currentAdminId = computed(() => {
    const a = this.auth.admin() as (AdminProfile & { _id?: string }) | null;
    return a?.id ?? a?._id ?? '';
  });

  ngOnInit(): void {
    this.load();
  }

  readonly counts = computed(() => {
    const list = this.admins();
    return {
      total: list.length,
      active: list.filter((a) => a.isActive).length,
      inactive: list.filter((a) => !a.isActive).length
    };
  });

  readonly filteredAdmins = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.admins().filter((a) => {
      if (st === 'active' && !a.isActive) return false;
      if (st === 'inactive' && a.isActive) return false;
      if (kw && !`${a.name} ${a.email}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  });

  readonly filterOptions: { value: AdminFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  readonly totalCount = computed(() => this.filteredAdmins().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedAdmins = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredAdmins().slice(start, start + this.pageSize);
  });

  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  setFilter(v: AdminFilter): void { this.statusFilter.set(v); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

  isSelf(a: AdminManagedUser): boolean {
    return !!this.currentAdminId() && a.id === this.currentAdminId();
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatDate(value: unknown): string {
    if (!value) return '—';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatLogin(value: unknown): string {
    if (!value) return 'Never';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return 'Never';
    return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  openAdd(): void {
    this.editing.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formPassword.set('');
    this.formActive.set(true);
    this.formError.set('');
    this.showPassword.set(false);
    this.modalOpen.set(true);
  }

  openEdit(a: AdminManagedUser): void {
    this.editing.set(a);
    this.formName.set(a.name);
    this.formEmail.set(a.email);
    this.formPassword.set('');
    this.formActive.set(a.isActive);
    this.formError.set('');
    this.showPassword.set(false);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
    this.formError.set('');
    this.saving.set(false);
  }

  save(): void {
    const name = this.formName().trim();
    const email = this.formEmail().trim().toLowerCase();
    const password = this.formPassword();
    const editing = this.editing();

    if (!name) { this.formError.set('Please enter a name.'); return; }
    if (!EMAIL_RE.test(email)) { this.formError.set('Please enter a valid email address.'); return; }
    if (!editing && password.length < 6) { this.formError.set('Password must be at least 6 characters.'); return; }
    if (editing && password && password.length < 6) { this.formError.set('Password must be at least 6 characters.'); return; }
    if (editing && this.isSelf(editing) && !this.formActive()) {
      this.formError.set('You cannot deactivate your own account.');
      return;
    }

    this.formError.set('');
    this.saving.set(true);

    if (!editing) {
      this.http.post<AdminManagedUser>(`${API_BASE}/admin/admins`, {
        name, email, password, isActive: this.formActive()
      }).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.load();
          this.toast.success('Admin added', `${name} can now sign in to the admin panel.`);
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(err?.error?.message || 'Failed to add admin. Please try again.');
        }
      });
      return;
    }

    const body: Record<string, unknown> = { name, email, isActive: this.formActive() };
    if (password) body['password'] = password;
    this.http.patch<AdminManagedUser>(`${API_BASE}/admin/admins/${editing.id}`, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
        this.toast.success('Admin updated', `${name} saved successfully.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err?.error?.message || 'Failed to update admin. Please try again.');
      }
    });
  }

  toggleActive(a: AdminManagedUser): void {
    if (this.isSelf(a)) {
      this.toast.error('Not allowed', 'You cannot deactivate your own account.');
      return;
    }
    this.http.patch<AdminManagedUser>(`${API_BASE}/admin/admins/${a.id}`, { isActive: !a.isActive }).subscribe({
      next: () => {
        this.load();
        this.toast.success(a.isActive ? 'Admin deactivated' : 'Admin activated', a.name);
      },
      error: (err) => {
        this.toast.error('Failed', err?.error?.message || 'Could not update status.');
      }
    });
  }

  askDelete(a: AdminManagedUser): void {
    this.deleteTarget.set(a);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleting.set(false);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    if (this.isSelf(target)) {
      this.toast.error('Not allowed', 'You cannot remove your own account.');
      this.cancelDelete();
      return;
    }
    this.deleting.set(true);
    this.http.delete(`${API_BASE}/admin/admins/${target.id}`).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.load();
        this.toast.success('Admin removed', target.name);
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error('Failed', err?.error?.message || 'Could not remove admin.');
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.http.get<AdminManagedUser[]>(`${API_BASE}/admin/admins`).subscribe({
      next: (list) => {
        this.admins.set(list ?? []);
        this.loading.set(false);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      },
      error: () => {
        this.admins.set([]);
        this.loading.set(false);
      }
    });
  }
}
