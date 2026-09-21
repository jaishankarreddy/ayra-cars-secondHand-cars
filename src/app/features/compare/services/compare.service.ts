import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { ToastService } from '../../../services/toast.service';
import { API_BASE } from '@config/api';

const SESSION_KEY = 'ayracars-compare-session';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'cmp-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface ComparableVehicle {
  id: string;
  type: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  fuel: string;
  transmission: string;
  engine: string;
  mileage: number;
  mileageUnit: string;
  abs: string;
  bodyType: string;
  color: string;
  district: string;
  owners: number;
  kilometers: number;
  image: string;
  rating?: number;
  featured?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly http = inject(HttpClient);
  private readonly catalogService = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly sessionId = getOrCreateSessionId();

  constructor() {
    this.catalogService.load();
    this.loadFromServer();
  }

  readonly max = 4;

  readonly ids = signal<string[]>([]);

  readonly vehicles = computed<ComparableVehicle[]>(() =>
    this.ids()
      .map((id) => this.lookup(id))
      .filter((v): v is ComparableVehicle => !!v)
  );

  readonly count = computed(() => this.vehicles().length);
  readonly full = computed(() => this.count() >= this.max);

  readonly bestPrice = computed(() => {
    const list = this.vehicles();
    return list.length ? Math.min(...list.map((v) => v.price)) : null;
  });

  readonly catalog = computed(() => {
    const cars = this.catalogService.cars().map((c) => this.toComparable(c, 'car'));
    const bikes = this.catalogService.bikes().map((b) => this.toComparable(b, 'bike'));
    return [...cars, ...bikes];
  });

  toggle(id: string, opts?: { silent?: boolean }): void {
    const isRemoving = this.ids().includes(id);

    if (isRemoving) {
      this.remove(id, opts);
      return;
    }

    if (this.ids().length >= this.max) {
      this.toast.error('Compare list is full', `You can compare up to ${this.max} vehicles. Remove one first.`);
      return;
    }

    this.ids.update((ids) => [...ids, id]);
    this.http.post<{ vehicleIds: string[] }>(`${API_BASE}/compare`, { sessionId: this.sessionId, vehicleId: id }).subscribe({
      error: () => {
        this.ids.update((ids) => ids.filter((i) => i !== id));
        this.toast.error('Could not update comparison', 'Please try again.');
      }
    });

    if (!opts?.silent) {
      this.toast.success('Added to compare', 'Open the compare bar to view them side by side.');
    }
  }

  remove(id: string, opts?: { silent?: boolean }): void {
    this.ids.update((ids) => ids.filter((i) => i !== id));
    this.http.delete<{ vehicleIds: string[] }>(`${API_BASE}/compare/${id}`, { params: { sessionId: this.sessionId } }).subscribe({
      error: () => undefined
    });
    if (!opts?.silent) {
      this.toast.info('Removed from compare');
    }
  }

  clear(): void {
    this.ids.set([]);
    this.http.delete<{ vehicleIds: string[] }>(`${API_BASE}/compare`, { params: { sessionId: this.sessionId } }).subscribe({
      error: () => undefined
    });
  }

  /**
   * Real server search for the compare picker (cars + bikes via API).
   * The picker used to filter only the locally loaded catalogue.
   */
  async searchServer(keyword: string, limit = 8): Promise<ComparableVehicle[]> {
    const q = keyword.trim();
    if (!q) return [];
    const fetchType = async (type: 'car' | 'bike'): Promise<CatalogVehicle[]> => {
      try {
        const res = await firstValueFrom(
          this.http.get<{ items: CatalogVehicle[] }>(
            `${API_BASE}/vehicles?type=${type}&q=${encodeURIComponent(q)}&page=1&limit=${limit}`
          )
        );
        return res?.items ?? [];
      } catch {
        return [];
      }
    };
    const [cars, bikes] = await Promise.all([fetchType('car'), fetchType('bike')]);
    const seen = new Set<string>();
    const out: ComparableVehicle[] = [];
    for (const v of [...cars, ...bikes]) {
      if (!v || seen.has(v.id)) continue;
      seen.add(v.id);
      out.push(this.toComparable(v, v.vehicleType));
    }
    return out;
  }

  private loadFromServer(): void {
    this.http.get<{ vehicleIds: string[] }>(`${API_BASE}/compare`, { params: { sessionId: this.sessionId } }).subscribe({
      next: (res) => this.ids.set(res.vehicleIds ?? []),
      error: () => undefined
    });
  }

  private lookup(id: string): ComparableVehicle | null {
    const v = this.catalogService.byId(id);
    if (!v) return null;
    return this.toComparable(v, v.vehicleType);
  }

  private toComparable(v: CatalogVehicle, type: 'car' | 'bike'): ComparableVehicle {
    if (type === 'bike') {
      return {
        id: v.id,
        type,
        brand: v.brand,
        model: v.model,
        variant: v.variant,
        year: v.year,
        price: v.price,
        fuel: v.fuel,
        transmission: v.engineCC ? 'Manual' : 'Electric',
        engine: v.engineCC && v.engineCC > 0 ? `${v.engineCC} cc` : 'Electric',
        mileage: v.mileage,
        mileageUnit: v.fuel === 'Electric' ? 'km/charge' : 'km/l',
        abs: v.abs ? 'Yes' : 'No',
        bodyType: v.bodyType,
        color: v.color,
        district: v.district,
        owners: v.owners,
        kilometers: v.kilometers,
        image: v.image,
        rating: v.rating,
        featured: v.featured
      };
    }
    const c = v as unknown as Car;
    return {
      id: c.id,
      type,
      brand: c.brand,
      model: c.model,
      variant: c.variant,
      year: c.year,
      price: c.price,
      fuel: c.fuel,
      transmission: c.transmission,
      engine: '—',
      mileage: c.mileage,
      mileageUnit: 'km/l',
      abs: '—',
      bodyType: c.bodyType,
      color: c.color,
      district: c.district,
      owners: c.owners,
      kilometers: c.kilometers,
      image: c.image,
      rating: c.rating,
      featured: c.featured
    };
  }
}
