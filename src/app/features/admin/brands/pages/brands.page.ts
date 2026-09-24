import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  LucideSearch,
  LucidePlus,
  LucideX,
  LucideChevronLeft,
  LucideChevronRight
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminService, AdminBrand } from '../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';

export type BrandFilter = 'all' | 'car' | 'bike';

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucidePlus,
    LucideX,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './brands.page.html',
  styleUrl: './brands.page.scss'
})
export class AdminBrandsPageComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly brands = signal<AdminBrand[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly typeFilter = signal<BrandFilter>('all');
  readonly page = signal(1);
  readonly pageSize = 15;

  readonly modalOpen = signal(false);
  readonly editing = signal<AdminBrand | null>(null);
  readonly formName = signal('');
  readonly formType = signal<'car' | 'bike'>('car');
  readonly formError = signal('');
  readonly saving = signal(false);

  readonly deleteTarget = signal<AdminBrand | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.load();
  }

  readonly counts = computed(() => {
    const list = this.brands();
    return {
      total: list.length,
      car: list.filter((b) => b.type === 'car' || b.type === 'both').length,
      bike: list.filter((b) => b.type === 'bike' || b.type === 'both').length
    };
  });

  readonly filteredBrands = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const tf = this.typeFilter();
    return this.brands().filter((b) => {
      const isCar = b.type === 'car' || b.type === 'both';
      const isBike = b.type === 'bike' || b.type === 'both';
      if (tf === 'car' && !isCar) return false;
      if (tf === 'bike' && !isBike) return false;
      if (kw && !b.name.toLowerCase().includes(kw)) return false;
      return true;
    });
  });

  readonly filterOptions: { value: BrandFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'car', label: 'Cars' },
    { value: 'bike', label: 'Bikes' }
  ];

  readonly totalCount = computed(() => this.filteredBrands().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly paginatedBrands = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredBrands().slice(start, start + this.pageSize);
  });

  setSearch(v: string): void { this.search.set(v); this.page.set(1); }
  setFilter(v: BrandFilter): void { this.typeFilter.set(v); this.page.set(1); }
  goToPage(n: number): void { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
  nextPage(): void { if (this.page() < this.totalPages()) this.page.update((p) => p + 1); }
  prevPage(): void { if (this.page() > 1) this.page.update((p) => p - 1); }

  typeLabel(b: AdminBrand): string {
    if (b.type === 'both') return 'Car + Bike';
    return b.type === 'car' ? 'Car' : 'Bike';
  }

  openAdd(): void {
    this.editing.set(null);
    this.formName.set('');
    this.formType.set(this.typeFilter() === 'bike' ? 'bike' : 'car');
    this.formError.set('');
    this.modalOpen.set(true);
  }

  openEdit(b: AdminBrand): void {
    this.editing.set(b);
    this.formName.set(b.name);
    this.formType.set(b.type === 'bike' ? 'bike' : 'car');
    this.formError.set('');
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
    if (!name) { this.formError.set('Please enter a brand name.'); return; }
    this.formError.set('');
    this.saving.set(true);
    const payload = { name, type: this.formType() };
    const editing = this.editing();
    const request = editing
      ? this.service.updateBrand(editing.id, payload)
      : this.service.createBrand(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
        this.toast.success(editing ? 'Brand updated' : 'Brand added', `${name} now appears in dropdowns and filters.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err?.error?.message || 'Failed to save brand.');
      }
    });
  }

  askDelete(b: AdminBrand): void {
    this.deleteTarget.set(b);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleting.set(false);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.service.removeBrand(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.load();
        this.toast.success('Brand removed', target.name);
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error('Cannot remove', err?.error?.message || 'Could not remove brand.');
        this.deleteTarget.set(null);
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.listBrands().subscribe({
      next: (list) => {
        this.brands.set(list ?? []);
        this.loading.set(false);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      },
      error: () => {
        this.brands.set([]);
        this.loading.set(false);
      }
    });
  }
}
