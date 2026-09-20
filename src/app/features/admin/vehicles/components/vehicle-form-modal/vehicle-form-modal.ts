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
import { compressImage } from '../../../utils/image-compress.util';
import { AdminVehicle } from '../../../utils/vehicle.util';
import { ToastService } from '../../../../../services/toast.service';

export interface VehicleFormModel {
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
  location: string;
  mileage: string;
  kilometers: string;
  owners: string;
  engineCC: string;
  abs: string;
  engine: string;
  power: string;
  registration: string;
  insurance: string;
  rating: string;
  featured: string;
  availability: string;
  description: string;
}

const EMPTY_FORM: VehicleFormModel = {
  brand: '', model: '', variant: '', year: '', price: '', fuel: 'Petrol',
  transmission: 'Manual', bodyType: '', color: 'White', district: 'Bengaluru', location: '',
  mileage: '', kilometers: '', owners: '1', engineCC: '', abs: 'false', engine: '',
  power: '', registration: '', insurance: '', rating: '4', featured: 'false',
  availability: 'available', description: ''
};

const CAR_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY_TYPES = [
  'Commuter', 'Scooter', 'Sport', 'Street', 'Cruiser',
  'Adventure', 'Streetfighter', 'Tourer', 'Electric Scooter'
];
const DISTRICTS = [
  'Bengaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Mangaluru', 'Udupi',
  'Davanagere', 'Tumakuru', 'Kalaburagi', 'Shivamogga', 'Ballari', 'Dakshina Kannada'
];
const COLORS = ['White', 'Black', 'Grey', 'Silver', 'Red', 'Blue', 'Green', 'Orange', 'Yellow'];
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

  readonly isEdit = computed(() => !!this.model());
  readonly bodyTypes = computed(() =>
    this.type() === 'car' ? CAR_BODY_TYPES : BIKE_BODY_TYPES
  );
  readonly districts = DISTRICTS;
  readonly colors = COLORS;
  readonly fuels = FUELS;
  readonly transmissions = ['Manual', 'Automatic', 'Electric'];
  readonly availabilityOptions = ['available', 'reserved', 'sold'];
  readonly yesNo = ['false', 'true'];

  ngOnInit(): void {
    const m = this.model();
    if (m) {
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
        fuel: m.fuel,
        transmission: m.transmission.replace(/ km\/l.*/, ''),
        bodyType: m.bodyType,
        color: m.color,
        district: m.district,
        mileage: String(parseFloat(String(m.mileage)) || 0),
        kilometers: String(m.kilometers),
        owners: String(m.owners),
        abs: m.abs === 'Yes' ? 'true' : 'false',
        rating: m.rating ? String(m.rating) : '4',
        availability: m.status === 'Sold' ? 'sold' : 'available'
      });
    } else {
      this.type.set(this.initialType());
      this.loadBrands(this.initialType());
      this.switchType(this.initialType());
    }
  }

  loadBrands(type: 'car' | 'bike'): void {
    this.service.fetchFacets(type).subscribe({
      next: (res) => this.brandList.set(res.brands.map((b) => b.charAt(0).toUpperCase() + b.slice(1)).sort()),
      error: () => this.brandList.set([])
    });
  }

  readonly set = (key: keyof VehicleFormModel, value: string) =>
    this.form.update((f) => ({ ...f, [key]: value }));

  switchType(type: 'car' | 'bike'): void {
    this.type.set(type);
    this.loadBrands(type);
    this.form.update((f) => ({
      ...f,
      brand: '',
      bodyType: '',
      fuel: type === 'bike' ? 'Petrol' : 'Petrol',
      abs: 'false'
    }));
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
      })
      .catch(() => this.error.set('Could not process those images.'));
  }

  removePhoto(index: number): void {
    this.photos.update((list) => list.filter((_, i) => i !== index));
  }

  removeExistingImage(index: number): void {
    this.existingImages.update((list) => list.filter((_, i) => i !== index));
  }

  buildPayload(): VehicleFormPayload | null {
    const f = this.form();
    if (!f.brand.trim() || !f.model.trim() || !f.year || !f.price) {
      this.error.set('Brand, Model, Year and Price are required.');
      return null;
    }
    return {
      vehicleType: this.type(),
      brand: f.brand.trim(),
      model: f.model.trim(),
      variant: f.variant.trim(),
      year: parseInt(f.year, 10) || 0,
      price: parseFloat(f.price) || 0,
      fuel: f.fuel,
      transmission: f.transmission,
      mileage: parseFloat(f.mileage) || 0,
      kilometers: parseInt(f.kilometers, 10) || 0,
      district: f.district.trim(),
      location: f.location.trim(),
      owners: parseInt(f.owners, 10) || 1,
      bodyType: f.bodyType,
      color: f.color.trim(),
      engineCC: parseInt(f.engineCC, 10) || 0,
      abs: f.abs === 'true',
      engine: f.engine.trim(),
      power: f.power.trim(),
      registration: f.registration.trim(),
      insurance: f.insurance.trim(),
      featured: f.featured === 'true',
      availability: f.availability as 'available' | 'reserved' | 'sold',
      rating: parseFloat(f.rating) || 0,
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