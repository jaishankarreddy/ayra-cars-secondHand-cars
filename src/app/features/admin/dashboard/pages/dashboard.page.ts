import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { RouterLink } from '@angular/router';
import {
  LucideWarehouse,
  LucideCar,
  LucideBike,
  LucideHandCoins,
  LucideMail,
  LucidePlus,
  LucideArrowUpRight,
  LucideBadgeIndianRupee
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { CatalogService } from '../../../../services/catalog.service';
import { AdminOffer, AdminContact } from '../../data/admin.data';
import { VehicleFormModalComponent } from '../../vehicles/components/vehicle-form-modal/vehicle-form-modal';
import { AdminVehicle } from '../../utils/vehicle.util';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    VehicleFormModalComponent,
    LucideWarehouse,
    LucideCar,
    LucideBike,
    LucideHandCoins,
    LucideMail,
    LucidePlus,
    LucideArrowUpRight,
    LucideBadgeIndianRupee
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);
  private readonly catalog = inject(CatalogService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly formOpen = signal(false);
  readonly formModel = signal<AdminVehicle | null>(null);
  readonly formType = signal<'car' | 'bike'>('car');

  constructor() {
    this.catalog.load();
  }

  openAddVehicle(): void {
    this.formModel.set(null);
    this.formType.set('car');
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  onSaved(): void {
    this.formOpen.set(false);
    this.catalog.refresh();
    this.carsService.refresh();
    this.bikesService.refresh();
    this.toast.success('Vehicle added', 'Your new listing is now live on the marketplace.');
  }

  readonly totalCars = computed(() => this.carsService.cars().length);
  readonly totalBikes = computed(() => this.bikesService.bikes().length);
  readonly totalVehicles = computed(() => this.totalCars() + this.totalBikes());

  readonly offers = signal<AdminOffer[]>([]);
  readonly contacts = signal<AdminContact[]>([]);

  readonly pendingOffers = computed(() => this.offers().filter((o) => o.status === 'Pending').length);
  readonly newContacts = computed(() => this.contacts().filter((c) => c.status === 'New').length);
  readonly recentOffers = computed(() => this.offers().slice(0, 5));
  readonly latestContacts = computed(() => this.contacts().slice(0, 4));

  ngOnInit(): void {
    this.http.get<AdminOffer[]>(`${API_BASE}/admin/offers`).subscribe({
      next: (list) => this.offers.set(list.map((o) => ({ ...o, date: this.formatDate(o.date) }))),
      error: () => this.offers.set([])
    });
    this.http.get<AdminContact[]>(`${API_BASE}/admin/contacts`).subscribe({
      next: (list) => this.contacts.set(list.map((c) => ({ ...c, date: this.formatDate(c.date) }))),
      error: () => this.contacts.set([])
    });
  }

  readonly brandStats = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.carsService.cars()) {
      map.set(c.brand, (map.get(c.brand) ?? 0) + 1);
    }
    for (const b of this.bikesService.bikes()) {
      map.set(b.brand, (map.get(b.brand) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  readonly maxBrandCount = computed(() =>
    Math.max(1, ...this.brandStats().map((s) => s.count))
  );

  barHeight(count: number): number {
    return Math.max(8, Math.round((count / this.maxBrandCount()) * 100));
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
