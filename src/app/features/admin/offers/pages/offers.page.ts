import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import * as XLSX from 'xlsx';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideTrendingUp,
  LucideEye,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock3,
  LucideIndianRupee,
  LucideDownload
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminOffer, OfferStatus } from '../../data/admin.data';

export type OfferFilter = 'all' | OfferStatus;

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucidePhone,
    LucideTrendingUp,
    LucideEye,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock3,
    LucideIndianRupee,
    LucideDownload
  ],
  templateUrl: './offers.page.html',
  styleUrl: './offers.page.scss'
})
export class AdminOffersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly offers = signal<AdminOffer[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<OfferFilter>('all');
  readonly sortBy = signal<'newest' | 'oldest' | 'offer_desc' | 'offer_asc'>('newest');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly selectedOffer = signal<AdminOffer | null>(null);
  readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.http.get<AdminOffer[]>(`${API_BASE}/admin/offers`).subscribe({
      next: (list) => this.offers.set(list.map((o) => ({ ...o, rawDate: this.toISO(o.date), date: this.formatDate(o.date) }))),
      error: () => this.offers.set([])
    });
  }

  readonly counts = computed(() => {
    const list = this.offers();
    return {
      total: list.length,
      pending: list.filter((o) => o.status === 'Pending').length,
      accepted: list.filter((o) => o.status === 'Accepted').length,
      countered: list.filter((o) => o.status === 'Countered').length,
      rejected: list.filter((o) => o.status === 'Rejected').length
    };
  });

  readonly filteredOffers = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    const sort = this.sortBy();
    const from = this.dateFrom() ? new Date(this.dateFrom() + 'T00:00:00').getTime() : NaN;
    const to = this.dateTo() ? new Date(this.dateTo() + 'T23:59:59').getTime() : NaN;
    const timeOf = (o: AdminOffer): number => {
      const t = o.rawDate ? Date.parse(o.rawDate) : NaN;
      return Number.isNaN(t) ? 0 : t;
    };
    let list = this.offers().filter((o) => {
      if (st !== 'all' && o.status !== st) return false;
      if (
        kw &&
        !`${o.vehicle} ${o.customer} ${o.id} ${o.phone}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      const t = timeOf(o);
      if (!Number.isNaN(from) && t < from) return false;
      if (!Number.isNaN(to) && t > to) return false;
      return true;
    });
    if (sort === 'offer_desc') list = [...list].sort((a, b) => b.offerPrice - a.offerPrice);
    else if (sort === 'offer_asc') list = [...list].sort((a, b) => a.offerPrice - b.offerPrice);
    else if (sort === 'oldest') list = [...list].sort((a, b) => timeOf(a) - timeOf(b));
    else list = [...list].sort((a, b) => timeOf(b) - timeOf(a));
    return list;
  });
  readonly totalCount = computed(() => this.filteredOffers().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedOffers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredOffers().slice(start, start + this.pageSize);
  });

  readonly filterOptions: { value: OfferFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Countered', label: 'Countered' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  readonly sortOptions: { value: 'newest' | 'oldest' | 'offer_desc' | 'offer_asc'; label: string }[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'offer_desc', label: 'Offer: High to Low' },
    { value: 'offer_asc', label: 'Offer: Low to High' }
  ];

  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  setStatusFilter(v: OfferFilter): void { this.statusFilter.set(v); this.page.set(1); }
  setSort(v: 'newest' | 'oldest' | 'offer_desc' | 'offer_asc'): void { this.sortBy.set(v); this.page.set(1); }
  setDateFrom(v: string): void { this.dateFrom.set(v); this.page.set(1); }
  setDateTo(v: string): void { this.dateTo.set(v); this.page.set(1); }
  clearDates(): void { this.dateFrom.set(''); this.dateTo.set(''); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

  openOffer(offer: AdminOffer): void { this.selectedOffer.set(offer); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); }

  offerDiscount(offer: AdminOffer | null): number | null {
    if (!offer) return null;
    if (!offer.askingPrice) return null;
    return Math.round(((offer.offerPrice - offer.askingPrice) / offer.askingPrice) * 100);
  }

  setStatus(id: string, status: OfferStatus): void {
    this.offers.update((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o))
    );
    this.http.patch(`${API_BASE}/admin/offers/${id}`, { status }).subscribe({
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

  formatPrice(value: number): string {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  downloadExcel(): void {
    const rows = this.filteredOffers().map((o) => ({
      ID: o.id,
      Vehicle: o.vehicle,
      Customer: o.customer,
      Phone: o.phone,
      'Offer Price': o.offerPrice,
      'Asking Price': o.askingPrice,
      Status: o.status,
      Date: this.exportDate(o.rawDate || o.date)
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 26 }, { wch: 20 }, { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Offers');
    XLSX.writeFile(wb, `ayra-offers-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
    this.http.get<AdminOffer[]>(`${API_BASE}/admin/offers`).subscribe({
      next: (list) => this.offers.set(list.map((o) => ({ ...o, rawDate: this.toISO(o.date), date: this.formatDate(o.date) }))),
      error: () => this.offers.set([])
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
