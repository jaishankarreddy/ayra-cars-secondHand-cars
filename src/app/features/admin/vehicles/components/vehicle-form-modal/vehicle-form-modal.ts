import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideX,
  LucideImagePlus,
  LucideSparkles,
  LucideLoaderCircle,
  LucideCar,
  LucideBike
} from '@lucide/angular';
import { RippleDirective } from '@features/cars/directives/ripple.directive';
import { CatalogService } from '../../../../../services/catalog.service';
import { AdminService, VehicleFormPayload } from '../../../services/admin.service';
import { VehicleDraftService } from '../../../services/vehicle-draft.service';
import { compressImage } from '../../../utils/image-compress.util';
import { AdminVehicle } from '../../../utils/vehicle.util';
import { ToastService } from '../../../../../services/toast.service';

export interface VehicleFormModel {
  brand: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  emiFrom: string;
  emiNote: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  location: string;
  mileage: string;
  kilometers: string;
  owners: string;
  engineCC: string;
  abs: string;
  engine: string;
  registration: string;
  insurance: string;
  featured: string;
  availability: string;
  description: string;
}

const EMPTY_FORM: VehicleFormModel = {
  brand: '', model: '', variant: '', year: '', price: '', emiFrom: '', emiNote: '', fuel: '',
  transmission: '', bodyType: '', color: '', location: '',
  mileage: '', kilometers: '', owners: '', engineCC: '', abs: '', engine: '',
  registration: '', insurance: '', featured: '',
  availability: '', description: ''
};

const CAR_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY_TYPES = [
  'Commuter', 'Scooter', 'Sport', 'Street', 'Cruiser',
  'Adventure', 'Streetfighter', 'Tourer', 'Electric Scooter'
];
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

@Component({
  selector: 'app-vehicle-form-modal',
  standalone: true,
  imports: [
    RippleDirective,
    LucideX,
    LucideImagePlus,
    LucideSparkles,
    LucideLoaderCircle,
    LucideCar,
    LucideBike
  ],
  templateUrl: './vehicle-form-modal.html',
  styleUrl: './vehicle-form-modal.scss'
})
export class VehicleFormModalComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly drafts = inject(VehicleDraftService);

  readonly model = input<AdminVehicle | null>(null);
  readonly initialType = input<'car' | 'bike'>('car');
  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly form = signal<VehicleFormModel>({ ...EMPTY_FORM });
  readonly type = signal<'car' | 'bike'>('car');
  readonly photos = signal<{ file: File; preview: string }[]>([]);
  readonly existingImages = signal<string[]>([]);
  readonly maxImages = 10;
  readonly totalImages = computed(() => this.photos().length + this.existingImages().length);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly brandList = signal<string[]>([]);
  readonly dragNewIndex = signal<number | null>(null);
  readonly dragExistingIndex = signal<number | null>(null);
  readonly restoredDraft = signal(false);

  readonly isEdit = computed(() => !!this.model());
  readonly bodyTypes = computed(() =>
    this.type() === 'car' ? CAR_BODY_TYPES : BIKE_BODY_TYPES
  );
  readonly fuels = FUELS;
  readonly transmissions = ['Manual', 'Automatic', 'Electric'];
  readonly availabilityOptions = ['available', 'reserved', 'sold'];
  readonly yesNo = ['false', 'true'];

  ngOnInit(): void {
    const m = this.model();
    if (m) {
      this.drafts.clear(); // edit mode never retains drafts
      this.type.set(m.type);
      this.loadBrands(m.type);
      const allImages = m.images?.length ? m.images : [m.image];
      const existing = [...new Set(allImages.filter((img): img is string => !!img))];
      this.existingImages.set(existing);
      const f = this.form();
      this.form.set({
        ...f,
        brand: m.brand,
        model: m.model,
        variant: m.variant,
        year: String(m.year),
        price: String(m.price),
        emiFrom: m.emiFrom ? String(m.emiFrom) : '',
        emiNote: m.emiNote || '',
        fuel: m.fuel,
        transmission: m.transmission.replace(/ km\/l.*/, ''),
        bodyType: m.bodyType,
        color: m.color,
        mileage: String(parseFloat(String(m.mileage)) || 0),
        kilometers: String(m.kilometers),
        owners: String(m.owners),
        abs: m.abs === 'Yes' ? 'true' : 'false',
        availability: m.status === 'Sold' ? 'sold' : 'available'
      });
    } else {
      // Add mode — restore accidental-close draft, else start fresh.
      const saved = this.drafts.restore();
      const type = saved?.type ?? this.initialType();
      this.type.set(type);
      this.loadBrands(type);
      if (saved) {
        this.form.set({ ...saved.form });
        this.photos.set([...saved.photos]);
        this.restoredDraft.set(true);
      } else {
        this.form.set({ ...EMPTY_FORM });
      }
    }
  }

  loadBrands(type: 'car' | 'bike'): void {
    this.service.listBrands().subscribe({
      next: (res) => {
        const names = res
          .filter((b) => b.type === type || b.type === 'both')
          .map((b) => b.name)
          .sort();
        this.brandList.set(names);
        // Vehicles store lowercase brands — align the form to master casing
        // so the edit dropdown shows the saved brand as selected.
        const cur = this.form().brand;
        if (cur) {
          const hit = names.find((n) => n.toLowerCase() === cur.toLowerCase());
          if (hit && hit !== cur) this.form.update((f) => ({ ...f, brand: hit }));
        }
      },
      error: () => this.brandList.set([])
    });
  }

  readonly set = (key: keyof VehicleFormModel, value: string) => {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.persistDraft();
  };

  /** Keeps the in-progress Add form across accidental closes (same page session). */
  private persistDraft(): void {
    if (this.model()) return;
    this.drafts.save(this.form(), this.type(), this.photos());
  }

  resetForm(): void {
    this.photos().forEach((p) => URL.revokeObjectURL(p.preview));
    this.photos.set([]);
    this.existingImages.set([]);
    if (this.model()) {
      this.ngOnInit();
      return;
    }
    this.form.set({ ...EMPTY_FORM });
    this.type.set(this.initialType());
    this.loadBrands(this.initialType());
    this.drafts.clear();
    this.restoredDraft.set(false);
    this.error.set('');
  }

  switchType(type: 'car' | 'bike'): void {
    this.type.set(type);
    this.loadBrands(type);
    this.form.update((f) => ({
      ...f,
      brand: '',
      bodyType: ''
    }));
    this.persistDraft();
  }

  onPhotosPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    const room = this.maxImages - this.totalImages();
    if (room <= 0) {
      this.error.set(`You can upload a maximum of ${this.maxImages} images.`);
      return;
    }
    if (files.length > room) {
      this.error.set(`Only ${this.maxImages} images allowed — keeping the first ${room}.`);
    }
    Promise.all(files.slice(0, room).map((f) => compressImage(f)))
      .then((compressed) => {
        this.photos.update((list) => [
          ...list,
          ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))
        ]);
        this.error.set('');
        this.persistDraft();
      })
      .catch(() => this.error.set('Could not process those images.'));
  }

  removePhoto(index: number): void {
    this.photos.update((list) => list.filter((_, i) => i !== index));
    this.persistDraft();
  }

  removeExistingImage(index: number): void {
    this.existingImages.update((list) => list.filter((_, i) => i !== index));
  }

  allowPhotoDrop(event: Event): void {
    event.preventDefault();
  }

  endPhotoDrag(): void {
    this.dragNewIndex.set(null);
    this.dragExistingIndex.set(null);
  }

  startNewDrag(index: number): void {
    this.dragNewIndex.set(index);
  }

  dropNewPhoto(index: number, event: Event): void {
    event.preventDefault();
    const from = this.dragNewIndex();
    this.dragNewIndex.set(null);
    if (from === null || from === index) return;
    this.photos.update((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    this.persistDraft();
  }

  startExistingDrag(index: number): void {
    this.dragExistingIndex.set(index);
  }

  dropExistingPhoto(index: number, event: Event): void {
    event.preventDefault();
    const from = this.dragExistingIndex();
    this.dragExistingIndex.set(null);
    if (from === null || from === index) return;
    this.existingImages.update((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  buildPayload(): VehicleFormPayload | null {
    const f = this.form();
    if (!f.brand.trim() || !f.model.trim() || !f.year || !f.price) {
      this.error.set('Brand, Model, Year and Price are required.');
      return null;
    }
    if (!f.bodyType) {
      this.error.set('Please select a body type.');
      return null;
    }
    return {
      vehicleType: this.type(),
      brand: f.brand.trim(),
      model: f.model.trim(),
      variant: f.variant.trim(),
      year: parseInt(f.year, 10) || 0,
      price: parseFloat(f.price) || 0,
      emiFrom: parseFloat(f.emiFrom) || 0,
      emiNote: f.emiNote.trim(),
      fuel: f.fuel || 'Petrol',
      transmission: f.transmission || 'Manual',
      mileage: parseFloat(f.mileage) || 0,
      kilometers: parseInt(f.kilometers, 10) || 0,
      location: f.location.trim(),
      owners: parseInt(f.owners, 10) || 1,
      bodyType: f.bodyType,
      color: f.color.trim(),
      engineCC: parseInt(f.engineCC, 10) || 0,
      abs: f.abs === 'true',
      engine: f.engine.trim(),
      registration: f.registration.trim(),
      insurance: f.insurance.trim(),
      featured: f.featured === 'true',
      availability: (f.availability as 'available' | 'reserved' | 'sold') || 'available',
      description: f.description,
      images: this.photos().map((p) => p.file),
      existingImages: this.existingImages()
    };
  }

  submit(): void {
    if (this.saving()) return;
    const payload = this.buildPayload();
    if (!payload) return;
    this.saving.set(true);
    this.error.set('');

    const m = this.model();
    const request = m && m.id
      ? this.service.update(m.id, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.catalog.refresh();
        this.saving.set(false);
        this.drafts.clear();
        this.saved.emit();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const message = err instanceof HttpErrorResponse
          ? (err.error?.message || err.message)
          : 'Failed to save vehicle.';
        this.error.set(message);
        this.toast.error('Save failed', message);
      }
    });
  }
}