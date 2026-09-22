import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminTestDrive, TestDriveStatus } from '../../data/admin.data';

export type TestDriveFilter = 'all' | TestDriveStatus;

@Component({
  selector: 'app-test-drives-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucidePhone,
    LucideCalendarDays,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './test-drives.page.html',
  styleUrl: './test-drives.page.scss'
})
export class AdminTestDrivesPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly testDrives = signal<AdminTestDrive[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<TestDriveFilter>('all');
  readonly page = signal(1);
  readonly pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  readonly counts = computed(() => {
    const list = this.testDrives();
    return {
      total: list.length,
      pending: list.filter((t) => t.status === 'Pending').length,
      confirmed: list.filter((t) => t.status === 'Confirmed').length,
      completed: list.filter((t) => t.status === 'Completed').length,
      cancelled: list.filter((t) => t.status === 'Cancelled').length
    };
  });

  readonly filteredTestDrives = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.testDrives().filter((t) => {
      if (st !== 'all' && t.status !== st) return false;
      if (
        kw &&
        !`${t.vehicleLabel} ${t.name} ${t.id} ${t.phone}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });

  readonly filterOptions: { value: TestDriveFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];
  readonly totalCount = computed(() => this.filteredTestDrives().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedTestDrives = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredTestDrives().slice(start, start + this.pageSize);
  });
  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  setFilter(v: TestDriveFilter): void { this.statusFilter.set(v); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

  setStatus(id: string, status: TestDriveStatus): void {
    this.testDrives.update((list) =>
      list.map((t) => (t.id === id ? { ...t, status } : t))
    );
    this.http.patch(`${API_BASE}/admin/test-drives/${id}`, { status }).subscribe({
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
    this.http.get<AdminTestDrive[]>(`${API_BASE}/admin/test-drives`).subscribe({
      next: (list) => this.testDrives.set(list.map((t) => ({ ...t, date: this.formatDate(t.date) }))),
      error: () => this.testDrives.set([])
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
