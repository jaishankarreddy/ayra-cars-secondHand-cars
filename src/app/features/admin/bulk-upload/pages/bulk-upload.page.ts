import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  LucidePlus,
  LucideX,
  LucideCheck,
  LucideImagePlus,
  LucideLoaderCircle,
  LucideCar,
  LucideBike
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminService, VehicleFormPayload } from '../../services/admin.service';
import { CatalogService } from '../../../../services/catalog.service';
import { ToastService } from '../../../../services/toast.service';
import { compressImage } from '../../utils/image-compress.util';
import { ExcelImportComponent } from '../components/excel-import/excel-import.component';

export type BulkStatus = 'draft' | 'uploading' | 'done' | 'error';

export interface BulkPhoto {
  file: File;
  preview: string;
}

export interface BulkDraft {
  uid: number;
  vehicleType: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  district: string;
  kilometers: string;
  owners: string;
  mileage: string;
  engineCC: string;
  abs: boolean;
  registration: string;
  description: string;
  photos: BulkPhoto[];
  compressing: number;
  collapsed: boolean;
  status: BulkStatus;
  error: string;
}

const DISTRICTS = [
  'Bengaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Mangaluru', 'Udupi',
  'Davanagere', 'Tumakuru', 'Kalaburagi', 'Shivamogga', 'Ballari', 'Dakshina Kannada'
];
const CAR_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY_TYPES = [
  'Commuter', 'Scooter', 'Sport', 'Street', 'Cruiser',
  'Adventure', 'Streetfighter', 'Tourer', 'Electric Scooter'
];
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'Electric'];
const MAX_DRAFTS = 10;
const MAX_IMAGES = 10;

let draftUid = 0;

function emptyDraft(): BulkDraft {
  return {
    uid: ++draftUid,
    vehicleType: 'car',
    brand: '',
    model: '',
    variant: '',
    year: '',
    price: '',
    fuel: 'Petrol',
    transmission: 'Manual',
    bodyType: '',
    color: 'White',
    district: 'Bengaluru',
    kilometers: '',
    owners: '1',
    mileage: '',
    engineCC: '',
    abs: false,
    registration: '',
    description: '',
    photos: [],
    compressing: 0,
    collapsed: false,
    status: 'draft',
    error: ''
  };
}

@Component({
  selector: 'app-bulk-upload-page',
  standalone: true,
  imports: [
    RippleDirective,
    ExcelImportComponent,
    LucidePlus,
    LucideX,
    LucideCheck,
    LucideImagePlus,
    LucideLoaderCircle,
    LucideCar,
    LucideBike
  ],
  templateUrl: './bulk-upload.page.html',
  styleUrl: './bulk-upload.page.scss'
})
export class AdminBulkUploadPageComponent {
  private readonly service = inject(AdminService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly drafts = signal<BulkDraft[]>([emptyDraft()]);
  readonly mode = signal<'manual' | 'excel'>('manual');
  readonly uploading = signal(false);
  readonly uploadedCount = signal(0);
  readonly carBrands = signal<string[]>([]);
  readonly bikeBrands = signal<string[]>([]);

  readonly districts = DISTRICTS;
  readonly fuels = FUELS;
  readonly transmissions = TRANSMISSIONS;
  readonly maxDrafts = MAX_DRAFTS;
  readonly maxImages = MAX_IMAGES;

  readonly doneCount = computed(() => this.drafts().filter((d) => d.status === 'done').length);
  readonly failedCount = computed(() => this.drafts().filter((d) => d.status === 'error').length);
  readonly readyCount = computed(() => this.drafts().filter((d) => this.isValid(d)).length);

  constructor() {
    this.service.listBrands().subscribe({
      next: (res) => {
        this.carBrands.set(res.filter((b) => b.type === 'car' || b.type === 'both').map((b) => b.name).sort());
        this.bikeBrands.set(res.filter((b) => b.type === 'bike' || b.type === 'both').map((b) => b.name).sort());
      },
      error: () => {
        this.carBrands.set([]);
        this.bikeBrands.set([]);
      }
    });
  }

  brandsFor(d: BulkDraft): string[] {
    return d.vehicleType === 'car' ? this.carBrands() : this.bikeBrands();
  }

  bodyTypesFor(d: BulkDraft): string[] {
    return d.vehicleType === 'car' ? CAR_BODY_TYPES : BIKE_BODY_TYPES;
  }

  addDraft(): void {
    if (this.drafts().length >= MAX_DRAFTS) return;
    this.drafts.update((list) => [...list, emptyDraft()]);
  }

  removeDraft(uid: number): void {
    this.drafts.update((list) => {
      const target = list.find((d) => d.uid === uid);
      target?.photos.forEach((p) => URL.revokeObjectURL(p.preview));
      return list.filter((d) => d.uid !== uid);
    });
  }

  duplicateDraft(uid: number): void {
    if (this.drafts().length >= MAX_DRAFTS) return;
    this.drafts.update((list) => {
      const src = list.find((d) => d.uid === uid);
      if (!src) return list;
      const copy: BulkDraft = {
        ...emptyDraft(),
        vehicleType: src.vehicleType,
        brand: src.brand,
        model: src.model,
        fuel: src.fuel,
        transmission: src.transmission,
        bodyType: src.bodyType,
        color: src.color,
        district: src.district,
        owners: src.owners,
        abs: src.abs
      };
      return [...list, copy];
    });
  }

  patch(uid: number, patch: Partial<BulkDraft>): void {
    this.drafts.update((list) =>
      list.map((d) => (d.uid === uid ? { ...d, ...patch, status: 'draft' as BulkStatus, error: '' } : d))
    );
  }

  switchType(uid: number, type: 'car' | 'bike'): void {
    this.drafts.update((list) =>
      list.map((d) =>
        d.uid === uid
          ? { ...d, vehicleType: type, bodyType: '', status: 'draft' as BulkStatus, error: '' }
          : d
      )
    );
  }

  toggleCollapse(uid: number): void {
    this.drafts.update((list) => list.map((d) => (d.uid === uid ? { ...d, collapsed: !d.collapsed } : d)));
  }

  onPhotosPicked(uid: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    const draft = this.drafts().find((d) => d.uid === uid);
    if (!draft || draft.status === 'uploading' || draft.status === 'done') return;
    const room = MAX_IMAGES - draft.photos.length - draft.compressing;
    if (room <= 0) {
      this.patch(uid, { error: `Maximum ${MAX_IMAGES} images per vehicle.` });
      return;
    }
    const picked = files.slice(0, room);
    this.drafts.update((list) =>
      list.map((d) => (d.uid === uid ? { ...d, compressing: d.compressing + picked.length, error: '' } : d))
    );
    Promise.all(picked.map((f) => compressImage(f)))
      .then((compressed) => {
        this.drafts.update((list) =>
          list.map((d) =>
            d.uid === uid
              ? {
                  ...d,
                  photos: [
                    ...d.photos,
                    ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))
                  ].slice(0, MAX_IMAGES),
                  compressing: 0,
                  status: 'draft' as BulkStatus
                }
              : d
          )
        );
      })
      .catch(() => {
        this.drafts.update((list) =>
          list.map((d) => (d.uid === uid ? { ...d, compressing: 0, error: 'Could not process those images.' } : d))
        );
      });
  }

  removePhoto(uid: number, index: number): void {
    this.drafts.update((list) =>
      list.map((d) => {
        if (d.uid !== uid) return d;
        const removed = d.photos[index];
        if (removed) URL.revokeObjectURL(removed.preview);
        return { ...d, photos: d.photos.filter((_, i) => i !== index), status: 'draft' as BulkStatus, error: '' };
      })
    );
  }

  isValid(d: BulkDraft): boolean {
    return !!(d.brand.trim() && d.model.trim() && d.year && d.price);
  }

  draftTitle(d: BulkDraft, index: number): string {
    const label = `${d.brand} ${d.model}`.trim();
    return label || `Vehicle ${index + 1}`;
  }

  private toPayload(d: BulkDraft): VehicleFormPayload {
    return {
      vehicleType: d.vehicleType,
      brand: d.brand.trim(),
      model: d.model.trim(),
      variant: d.variant.trim(),
      year: parseInt(d.year, 10) || 0,
      price: parseFloat(d.price) || 0,
      fuel: d.fuel,
      transmission: d.transmission,
      mileage: parseFloat(d.mileage) || 0,
      kilometers: parseInt(d.kilometers, 10) || 0,
      district: d.district.trim(),
      location: '',
      owners: parseInt(d.owners, 10) || 1,
      bodyType: d.bodyType,
      color: d.color.trim(),
      engineCC: parseInt(d.engineCC, 10) || 0,
      abs: d.abs,
      engine: '',
      power: '',
      registration: d.registration.trim(),
      insurance: '',
      featured: false,
      availability: 'available',
      rating: 4,
      description: d.description,
      images: d.photos.map((p) => p.file)
    };
  }

  async uploadAll(): Promise<void> {
    if (this.uploading()) return;
    const queue = this.drafts().filter((d) => d.status !== 'done' && d.compressing === 0);
    if (!queue.length) return;
    const invalid = queue.filter((d) => !this.isValid(d));
    if (invalid.length) {
      this.toast.error('Missing details', `${invalid.length} vehicle(s) need Brand, Model, Year and Price.`);
      invalid.forEach((d) => this.patch(d.uid, { collapsed: false }));
      return;
    }
    this.uploading.set(true);
    this.uploadedCount.set(this.doneCount());
    let ok = 0;
    let failed = 0;
    for (const d of queue) {
      this.drafts.update((list) => list.map((x) => (x.uid === d.uid ? { ...x, status: 'uploading' as BulkStatus, error: '' } : x)));
      try {
        await firstValueFrom(this.service.create(this.toPayload(d)));
        ok++;
        this.uploadedCount.update((n) => n + 1);
        this.drafts.update((list) =>
          list.map((x) => (x.uid === d.uid ? { ...x, status: 'done' as BulkStatus, collapsed: true } : x))
        );
      } catch (err: unknown) {
        failed++;
        const message = err instanceof HttpErrorResponse
          ? (err.error?.message || err.message)
          : 'Upload failed.';
        this.drafts.update((list) =>
          list.map((x) => (x.uid === d.uid ? { ...x, status: 'error' as BulkStatus, error: message, collapsed: false } : x))
        );
      }
    }
    this.uploading.set(false);
    this.catalog.refresh();
    if (failed === 0) {
      this.toast.success('Bulk upload complete', `${ok} vehicle(s) are now live.`);
    } else {
      this.toast.error('Upload finished with errors', `${ok} live, ${failed} failed — retry them below.`);
    }
  }

  retryFailed(): void {
    this.drafts.update((list) =>
      list.map((d) => (d.status === 'error' ? { ...d, status: 'draft' as BulkStatus } : d))
    );
    void this.uploadAll();
  }

  clearDone(): void {
    this.drafts.update((list) => {
      const remaining = list.filter((d) => d.status !== 'done');
      list.filter((d) => d.status === 'done').forEach((d) => d.photos.forEach((p) => URL.revokeObjectURL(p.preview)));
      return remaining.length ? remaining : [emptyDraft()];
    });
    this.uploadedCount.set(0);
  }
}
