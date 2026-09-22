import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucidePlus,
  LucideSearch,
  LucideMapPin,
  LucidePencil,
  LucideTrash2,
  LucideGauge,
  LucideZap,
  LucideShieldCheck,
  LucideLoaderCircle,
  LucideChevronLeft,
  LucideChevronRight
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { CatalogService } from '../../../../services/catalog.service';
import { AdminService } from '../../services/admin.service';
import { toAdminVehicle, AdminVehicle } from '../../utils/vehicle.util';
import { VehicleFormModalComponent } from '../../vehicles/components/vehicle-form-modal/vehicle-form-modal';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-admin-bikes-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    VehicleFormModalComponent,
    LucidePlus,
    LucideSearch,
    LucideMapPin,
    LucidePencil,
    LucideTrash2,
    LucideGauge,
    LucideZap,
    LucideShieldCheck,
    LucideLoaderCircle,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './admin-bikes.page.html',
  styleUrl: './admin-bikes.page.scss'
})
export class AdminBikesPageComponent {
  private readonly bikesService = inject(BikesFilterService);
  private readonly catalog = inject(CatalogService);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  constructor() {
    this.catalog.load();
  }

  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly formOpen = signal(false);
  readonly formModel = signal<AdminVehicle | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly bikes = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const list = this.bikesService.bikes().map(toAdminVehicle);
    if (!kw) return list;
    return list.filter((b) =>
      `${b.brand} ${b.model} ${b.variant} ${b.district} ${b.fuel}`
        .toLowerCase()
        .includes(kw)
    );
  });

  readonly totalCount = computed(() => this.bikes().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedBikes = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.bikes().slice(start, start + this.pageSize);
  });
  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

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
    this.bikesService.refresh();
    this.toast.success(
      this.formModel() ? 'Bike updated' : 'Bike added',
      this.formModel()
        ? 'The listing was saved to the catalogue.'
        : 'Your new bike listing is now live on the marketplace.'
    );
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
        this.toast.success('Bike deleted', `${vehicle.brand} ${vehicle.model} was removed from the catalogue.`);
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Could not delete bike', 'Please try again in a moment.');
      }
    });
  }
}
