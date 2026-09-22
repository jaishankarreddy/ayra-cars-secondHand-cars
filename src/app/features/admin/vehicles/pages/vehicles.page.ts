import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucideCar,
  LucideBike,
  LucideMapPin,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucideLoaderCircle,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUpDown
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { CatalogService } from '../../../../services/catalog.service';
import { AdminService } from '../../services/admin.service';
import { toAdminVehicle, AdminVehicle } from '../../utils/vehicle.util';
import { VehicleFormModalComponent } from '../components/vehicle-form-modal/vehicle-form-modal';
import { ToastService } from '../../../../services/toast.service';

export type AdminTypeFilter = 'all' | 'car' | 'bike';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    VehicleFormModalComponent,
    LucidePlus,
    LucideSearch,
    LucideCar,
    LucideBike,
    LucideMapPin,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideLoaderCircle,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUpDown
  ],
  templateUrl: './vehicles.page.html',
  styleUrl: './vehicles.page.scss'
})
export class AdminVehiclesPageComponent {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);
  private readonly catalog = inject(CatalogService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly typeFilter = signal<AdminTypeFilter>('all');
  readonly sortBy = signal<'newest' | 'price_asc' | 'price_desc'>('newest');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly formOpen = signal(false);
  readonly formModel = signal<AdminVehicle | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly vehicles = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const sort = this.sortBy();
    const list = [
      ...this.carsService.cars().map(toAdminVehicle),
      ...this.bikesService.bikes().map(toAdminVehicle)
    ];
    let filtered = list.filter((v) => {
      if (type !== 'all' && v.type !== type) return false;
      if (
        kw &&
        !`${v.brand} ${v.model} ${v.variant} ${v.district} ${v.fuel}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
    if (sort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  });

  readonly totalCount = computed(() => this.vehicles().length);
  readonly availableCount = computed(
    () => this.vehicles().filter((v) => v.status === 'Available').length
  );
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedVehicles = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.vehicles().slice(start, start + this.pageSize);
  });
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const cur = this.page();
    const pages: number[] = [];
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (pages[0] > 1) pages.unshift(1);
    if (pages[pages.length - 1] < total) pages.push(total);
    return [...new Set(pages)].sort((a, b) => a - b);
  });

  readonly typeOptions: { value: AdminTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'car', label: 'Cars' },
    { value: 'bike', label: 'Bikes' }
  ];
  readonly sortOptions: { value: 'newest' | 'price_asc' | 'price_desc'; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' }
  ];

  setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }
  setType(value: AdminTypeFilter): void {
    this.typeFilter.set(value);
    this.page.set(1);
  }
  setSort(value: 'newest' | 'price_asc' | 'price_desc'): void {
    this.sortBy.set(value);
    this.page.set(1);
  }
  goToPage(n: number): void {
    if (n >= 1 && n <= this.totalPages()) this.page.set(n);
  }
  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((p) => p + 1);
  }
  prevPage(): void {
    if (this.page() > 1) this.page.update((p) => p - 1);
  }

  constructor() {
    this.catalog.load();
  }

  openAdd(): void {
    this.formModel.set(null);
    this.formOpen.set(true);
  }

  openEdit(vehicle: AdminVehicle): void {
    this.formModel.set(vehicle);
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
    this.toast.success(
      this.formModel() ? 'Vehicle updated' : 'Vehicle added',
      this.formModel()
        ? 'The listing was saved to the catalogue.'
        : 'Your new vehicle listing is now live on the marketplace.'
    );
  }

  viewVehicle(vehicle: AdminVehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
  }

  deleteVehicle(vehicle: AdminVehicle): void {
    const ok = window.confirm(
      `Delete "${vehicle.brand} ${vehicle.model} ${vehicle.variant}"?\nThis cannot be undone.`
    );
    if (!ok) return;
    this.deletingId.set(vehicle.id);
    this.adminService.remove(vehicle.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.catalog.refresh();
        this.toast.success('Vehicle deleted', `${vehicle.brand} ${vehicle.model} was removed from the catalogue.`);
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Could not delete vehicle', 'Please try again in a moment.');
      }
    });
  }
}