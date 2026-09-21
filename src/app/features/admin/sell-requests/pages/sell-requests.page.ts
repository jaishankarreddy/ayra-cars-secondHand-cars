import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideCar,
  LucideBike
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminSellRequest, SellRequestStatus } from '../../data/admin.data';

export type SellRequestFilter = 'all' | SellRequestStatus;

@Component({
  selector: 'app-sell-requests-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucidePhone,
    LucideCar,
    LucideBike
  ],
  templateUrl: './sell-requests.page.html',
  styleUrl: './sell-requests.page.scss'
})
export class AdminSellRequestsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly requests = signal<AdminSellRequest[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<SellRequestFilter>('all');

  ngOnInit(): void {
    this.load();
  }

  readonly counts = computed(() => {
    const list = this.requests();
    return {
      total: list.length,
      new: list.filter((r) => r.status === 'New').length,
      contacted: list.filter((r) => r.status === 'Contacted').length,
      closed: list.filter((r) => r.status === 'Closed').length
    };
  });

  readonly filteredRequests = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.requests().filter((r) => {
      if (st !== 'all' && r.status !== st) return false;
      if (
        kw &&
        !`${r.brand} ${r.model} ${r.name} ${r.phone} ${r.district} ${r.id}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });

  readonly filterOptions: { value: SellRequestFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Closed', label: 'Closed' }
  ];

  setStatus(id: string, status: SellRequestStatus): void {
    this.requests.update((list) =>
      list.map((r) => (r.id === id ? { ...r, status } : r))
    );
    this.http.patch(`${API_BASE}/admin/sell-requests/${id}`, { status }).subscribe({
      error: () => {
        this.load();
      }
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

  vehicleLabel(r: AdminSellRequest): string {
    return `${r.brand} ${r.model}${r.year ? ` ${r.year}` : ''}`;
  }

  formatPrice(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  private load(): void {
    this.http.get<AdminSellRequest[]>(`${API_BASE}/admin/sell-requests`).subscribe({
      next: (list) => this.requests.set(list.map((r) => ({ ...r, date: this.formatDate(r.date) }))),
      error: () => this.requests.set([])
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
