import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '@config/api';

/** Brand master entry from the admin-managed `/api/brands` collection. */
export interface MasterBrand {
  name: string;
  code?: string;
  color?: string;
  logo?: string;
  type: 'car' | 'bike' | 'both';
  count?: number;
}

/** Shape returned by the Node backend `/api/vehicles` documents. */
export interface CatalogVehicle {
  id: string;
  vehicleType: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuel: string;
  transmission: string;
  mileage: number;
  kilometers: number;
  district: string;
  location?: string;
  owners: number;
  bodyType: string;
  color: string;
  image: string;
  images?: string[];
  engineCC?: number;
  abs?: boolean;
  engine?: string;
  power?: string;
  registration?: string;
  insurance?: string;
  availability?: 'available' | 'reserved' | 'sold';
  featured?: boolean;
  rating?: number;
  description?: string[];
  features?: { key: string; icon?: string; title: string; items: string[] }[];
  seller?: {
    name: string;
    verified: boolean;
    hours?: string;
    location?: string;
    phone?: string;
    whatsapp?: string;
    deals?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  private readonly data = signal<CatalogVehicle[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private startedLoad = false;

  readonly vehicles = this.data.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly cars = computed(() => this.data().filter((v) => v.vehicleType === 'car'));
  readonly bikes = computed(() => this.data().filter((v) => v.vehicleType === 'bike'));
  readonly featuredCars = computed(() => this.cars().filter((c) => c.featured));
  readonly featuredBikes = computed(() => this.bikes().filter((b) => b.featured));

  /** Brand list derived from live catalogue. */
  readonly brands = computed(() => {
    const set = new Set<string>();
    for (const v of this.data()) set.add(v.brand);
    return [...set].sort();
  });

  // ---- Admin-managed brand master (feeds every brand picker site-wide) ----
  private readonly master = signal<MasterBrand[]>([]);
  private startedMasterLoad = false;

  /** Proper-cased master brand names for a vehicle type (falls back to stock when offline). */
  readonly carBrandNames = computed(() => this.masterNames('car'));
  readonly bikeBrandNames = computed(() => this.masterNames('bike'));

  private masterNames(type: 'car' | 'bike'): string[] {
    const list = this.master().filter((b) => b.type === type || b.type === 'both').map((b) => b.name);
    if (list.length) return [...new Set(list)].sort();
    const fallback = new Set<string>();
    for (const v of this.data()) {
      if (v.vehicleType !== type) continue;
      const proper = v.brand.charAt(0).toUpperCase() + v.brand.slice(1);
      fallback.add(proper);
    }
    return [...fallback].sort();
  }

  /** Loads the brand master once (idempotent). Safe to call from any component. */
  loadMasterBrands(): void {
    if (this.startedMasterLoad) return;
    this.startedMasterLoad = true;
    this.http.get<MasterBrand[]>(`${API_BASE}/brands`).subscribe({
      next: (list) => this.master.set(list ?? []),
      error: () => this.master.set([])
    });
  }

  /** Loads the full catalogue once (idempotent, single in-flight request). */
  load(): void {
    if (this.startedLoad || this.loadingSignal()) return;
    this.startedLoad = true;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    Promise.all([this.fetchPage('car'), this.fetchPage('bike')])
      .then(([cars, bikes]) => {
        this.data.set([...cars, ...bikes]);
        this.loadingSignal.set(false);
      })
      .catch((err: unknown) => {
        this.errorSignal.set(
          err instanceof Error ? err.message : 'Failed to load catalogue from API'
        );
        this.loadingSignal.set(false);
      });
  }

  byId(id: string): CatalogVehicle | undefined {
    return this.data().find((v) => v.id === id);
  }

  private async fetchPage(type: string): Promise<CatalogVehicle[]> {
    const out: CatalogVehicle[] = [];
    const limit = 200;
    let page = 1;
    let total = Infinity;
    // Walk all pages so nothing beyond the first `limit` is ever dropped.
    while (out.length < total) {
      const res = await firstValueFrom(
        this.http.get<{ items: CatalogVehicle[]; total?: number }>(
          `${API_BASE}/vehicles?type=${type}&page=${page}&limit=${limit}`
        )
      );
      const items = res?.items ?? [];
      total = res?.total ?? items.length;
      out.push(...items);
      if (items.length < limit || items.length === 0) break;
      page += 1;
    }
    return out;
  }

  /** Re-fetch the catalogue (used by the admin after create/update/delete). */
  refresh(): void {
    this.startedLoad = false;
    this.data.set([]);
    this.load();
  }
}