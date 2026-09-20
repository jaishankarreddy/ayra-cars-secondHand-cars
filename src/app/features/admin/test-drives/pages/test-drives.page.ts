import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideCalendarDays
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
    LucideCalendarDays
  ],
  templateUrl: './test-drives.page.html',
  styleUrl: './test-drives.page.scss'
})
export class AdminTestDrivesPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly testDrives = signal<AdminTestDrive[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<TestDriveFilter>('all');

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
