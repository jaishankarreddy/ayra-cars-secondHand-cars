import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideSearch,
  LucideMail,
  LucidePhone,
  LucideCheck,
  LucideMailOpen,
  LucideEye,
  LucideChevronLeft,
  LucideChevronRight,
  LucideX,
  LucideCalendarDays
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminContact, ContactStatus } from '../../data/admin.data';

export type ContactFilter = 'all' | ContactStatus;

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideMail,
    LucidePhone,
    LucideCheck,
    LucideMailOpen,
    LucideEye,
    LucideChevronLeft,
    LucideChevronRight,
    LucideX,
    LucideCalendarDays
  ],
  templateUrl: './contacts.page.html',
  styleUrl: './contacts.page.scss'
})
export class AdminContactsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly contacts = signal<AdminContact[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<ContactFilter>('all');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly selectedContact = signal<AdminContact | null>(null);
  readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.load();
  }

  readonly counts = computed(() => {
    const list = this.contacts();
    return {
      total: list.length,
      new: list.filter((c) => c.status === 'New').length,
      replied: list.filter((c) => c.status === 'Replied').length
    };
  });

  readonly filteredContacts = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.contacts().filter((c) => {
      if (st !== 'all' && c.status !== st) return false;
      if (
        kw &&
        !`${c.name} ${c.email} ${c.subject} ${c.message} ${c.id}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });
  readonly totalCount = computed(() => this.filteredContacts().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedContacts = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredContacts().slice(start, start + this.pageSize);
  });

  readonly filterOptions: { value: ContactFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Replied', label: 'Replied' }
  ];

  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  setFilter(v: ContactFilter): void { this.statusFilter.set(v); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

  openContact(c: AdminContact): void { this.selectedContact.set(c); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); }

  markReplied(id: string): void {
    this.contacts.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'Replied' } : c))
    );
    this.http.patch(`${API_BASE}/admin/contacts/${id}`, { status: 'Replied' }).subscribe({
      error: () => this.load()
    });
  }

  markNew(id: string): void {
    this.contacts.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'New' } : c))
    );
    this.http.patch(`${API_BASE}/admin/contacts/${id}`, { status: 'New' }).subscribe({
      error: () => this.load()
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private load(): void {
    this.http.get<AdminContact[]>(`${API_BASE}/admin/contacts`).subscribe({
      next: (list) => this.contacts.set(list.map((c) => ({ ...c, date: this.formatDate(c.date) }))),
      error: () => this.contacts.set([])
    });
  }

  private formatDate(value: unknown): string {
    if (!value) return '';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
