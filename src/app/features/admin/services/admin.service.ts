import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '@config/api';

/** Payload for creating/updating a vehicle via the admin API (multipart/form-data). */
export interface VehicleFormPayload {
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
  location: string;
  owners: number;
  bodyType: string;
  color: string;
  engineCC: number;
  abs: boolean;
  engine: string;
  power: string;
  registration: string;
  insurance: string;
  featured: boolean;
  availability: 'available' | 'reserved' | 'sold';
  rating: number;
  description: string;
  oldImage?: string;
  images?: File[];
  existingImages?: string[];
}

export interface ApiVehicle {
  id: string;
  vehicleType: string;
  brand: string;
  model: string;
  image: string;
  [key: string]: unknown;
}

export interface AdminBrand {
  id: string;
  name: string;
  code: string;
  color: string;
  logo: string;
  type: 'car' | 'bike' | 'both';
  vehicleCount: number;
  createdAt: string;
}

const API = `${API_BASE}/admin/vehicles`;
const BRANDS_API = `${API_BASE}/admin/brands`;
const PUBLIC_BRANDS_API = `${API_BASE}/brands`;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  /** Build a multipart FormData body from the form payload (uploaded file is compressed client-side). */
  toFormData(payload: VehicleFormPayload): FormData {
    const fd = new FormData();
    const set = (key: string, value: unknown) => {
      if (value !== undefined && value !== null) fd.append(key, String(value));
    };
    set('vehicleType', payload.vehicleType);
    set('brand', payload.brand);
    set('model', payload.model);
    set('variant', payload.variant);
    set('year', payload.year);
    set('price', payload.price);
    set('fuel', payload.fuel);
    set('transmission', payload.transmission);
    set('mileage', payload.mileage);
    set('kilometers', payload.kilometers);
    set('district', payload.district);
    set('location', payload.location);
    set('owners', payload.owners);
    set('bodyType', payload.bodyType);
    set('color', payload.color);
    set('engineCC', payload.engineCC ?? 0);
    set('abs', payload.abs);
    set('engine', payload.engine);
    set('power', payload.power);
    set('registration', payload.registration);
    set('insurance', payload.insurance);
    set('featured', payload.featured);
    set('availability', payload.availability);
    set('rating', payload.rating ?? 0);
    set('description', payload.description);
    for (const file of payload.images ?? []) {
      fd.append('images', file, file.name);
    }
    if (payload.existingImages) {
      fd.append('existingImages', JSON.stringify(payload.existingImages));
    }
    return fd;
  }

  create(payload: VehicleFormPayload): Observable<VehicleApiResponse> {
    return this.http.post<VehicleApiResponse>(API, this.toFormData(payload));
  }

  update(id: string, payload: VehicleFormPayload): Observable<VehicleApiResponse> {
    return this.http.put<VehicleApiResponse>(`${API}/${id}`, this.toFormData(payload));
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/${id}`);
  }

  fetchFacets(type: 'car' | 'bike'): Observable<{ brands: string[] }> {
    return this.http.get<{ brands: string[] }>(`${API_BASE}/facets?type=${type}`);
  }

  /** Brand master (admin-managed) — feeds vehicle dropdowns. */
  listBrands(): Observable<AdminBrand[]> {
    return this.http.get<AdminBrand[]>(BRANDS_API);
  }

  createBrand(payload: { name: string; type: string; code?: string; color?: string; logo?: string }): Observable<AdminBrand> {
    return this.http.post<AdminBrand>(BRANDS_API, payload);
  }

  updateBrand(id: string, payload: { name?: string; type?: string; code?: string; color?: string; logo?: string }): Observable<AdminBrand> {
    return this.http.patch<AdminBrand>(`${BRANDS_API}/${id}`, payload);
  }

  removeBrand(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BRANDS_API}/${id}`);
  }

  /** Public brand master (no auth) — for Excel matcher etc. */
  publicBrands(): Observable<{ name: string; type: string }[]> {
    return this.http.get<{ name: string; type: string }[]>(PUBLIC_BRANDS_API);
  }
}

/** Minimal shape manager needs from the API response. */
export interface VehicleApiResponse {
  id: string;
  vehicleType: string;
  brand: string;
  model: string;
  image?: string;
}