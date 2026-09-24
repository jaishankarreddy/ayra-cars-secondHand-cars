import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import * as XLSX from 'xlsx';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDownload
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
    LucideChevronRight,
    LucideDownload
  ],
  templateUrl: './test-drives.page.html',
  styleUrl: './test-drives.page.scss'
})
export class AdminTestDrivesPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly testDrives = signal<AdminTestDrive[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<TestDriveFilter>('all');
  readonly dateOrder = signal<'newest' | 'oldest'>('newest');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
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
    const from = this.dateFrom() ? new Date(this.dateFrom() + 'T00:00:00').getTime() : NaN;
    const to = this.dateTo() ? new Date(this.dateTo() + 'T23:59:59').getTime() : NaN;
    const timeOf = (t: AdminTestDrive): number => {
      const ms = t.rawDate ? Date.parse(t.rawDate) : NaN;
      return Number.isNaN(ms) ? 0 : ms;
    };
    const list = this.testDrives().filter((t) => {
      if (st !== 'all' && t.status !== st) return false;
      if (
        kw &&
        !`${t.vehicleLabel} ${t.name} ${t.id} ${t.phone}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      const ms = timeOf(t);
      if (!Number.isNaN(from) && ms < from) return false;
      if (!Number.isNaN(to) && ms > to) return false;
      return true;
    });
    return [...list].sort((a, b) =>
      this.dateOrder() === 'oldest' ? timeOf(a) - timeOf(b) : timeOf(b) - timeOf(a)
    );
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
  setDateOrder(v: 'newest' | 'oldest'): void { this.dateOrder.set(v); this.page.set(1); }
  setDateFrom(v: string): void { this.dateFrom.set(v); this.page.set(1); }
  setDateTo(v: string): void { this.dateTo.set(v); this.page.set(1); }
  clearDates(): void { this.dateFrom.set(''); this.dateTo.set(''); this.page.set(1); }
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

  downloadExcel(): void {
    const rows = this.filteredTestDrives().map((t) => ({
      ID: t.id,
      Vehicle: t.vehicleLabel,
      'Vehicle ID': t.vehicleId,
      Name: t.name,
      Phone: t.phone,
      'Preferred Date': t.preferredDate,
      'Preferred Time': t.preferredTime,
      Status: t.status,
      Note: t.note,
      Requested: this.exportDate(t.rawDate || t.date)
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 26 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TestDrives');
    XLSX.writeFile(wb, `ayra-test-drives-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private exportDate(value: unknown): string {
    if (!value) return '';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  private toISO(value: unknown): string {
    if (!value) return '';
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
  }

  private load(): void {
    this.http.get<AdminTestDrive[]>(`${API_BASE}/admin/test-drives`).subscribe({
      next: (list) => this.testDrives.set(list.map((t) => ({ ...t, rawDate: this.toISO(t.date), date: this.formatDate(t.date) }))),
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
