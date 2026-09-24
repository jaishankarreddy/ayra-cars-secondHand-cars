import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_BASE } from '@config/api';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBadgeCheck,
  LucideBike,
  LucideCarFront,
  LucideCheck,
  LucideCircleCheck,
  LucideImagePlus,
  LucideMapPin,
  LucidePhone,
  LucideShieldCheck,
  LucideX
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { ToastService } from '../../../../services/toast.service';
import { compressImage } from '../../../admin/utils/image-compress.util';

type SellType = 'car' | 'bike';

@Component({
  selector: 'app-sell-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowLeft,
    LucideArrowRight,
    LucideBadgeCheck,
    LucideBike,
    LucideCarFront,
    LucideCheck,
    LucideCircleCheck,
    LucideImagePlus,
    LucideMapPin,
    LucidePhone,
    LucideShieldCheck,
    LucideX
  ],
  templateUrl: './sell-page.component.html',
  styleUrl: './sell-page.component.scss'
})
export class SellPageComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly step = signal(1);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly referenceId = signal('');

  // Step 1 — vehicle
  readonly vehicleType = signal<SellType>('car');
  readonly brand = signal('');
  readonly model = signal('');
  readonly year = signal('');
  readonly kilometers = signal('');
  readonly fuel = signal('');
  readonly transmission = signal('');

  // Step 2 — owner & contact
  readonly name = signal('');
  readonly phone = signal('');
  readonly district = signal('');
  readonly expectedPrice = signal('');
  readonly notes = signal('');

  readonly years: number[] = (() => {
    const current = new Date().getFullYear();
    const list: number[] = [];
    for (let y = current; y >= current - 20; y--) list.push(y);
    return list;
  })();

  readonly fuels = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
  readonly transmissions = ['Manual', 'Automatic'];

  // Vehicle photos (max 10, compressed in browser)
  readonly photos = signal<{ file: File; preview: string }[]>([]);
  readonly compressing = signal(0);
  readonly maxPhotos = 10;
  readonly districts = [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi',
    'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi', 'Other'
  ];

  readonly canGoStep2 = computed(() =>
    this.brand().trim().length > 0 && this.model().trim().length > 0
  );

  readonly reviewRows = computed(() => [
    { label: 'Vehicle', value: `${this.brand().trim()} ${this.model().trim()}${this.year() ? ` · ${this.year()}` : ''}` },
    { label: 'Type', value: this.vehicleType() === 'bike' ? 'Bike' : 'Car' },
    { label: 'Kilometres', value: this.kilometers() ? `${Number(this.kilometers()).toLocaleString('en-IN')} km` : '—' },
    { label: 'Fuel / Gearbox', value: [this.fuel() || '—', this.transmission() || '—'].join(' · ') },
    { label: 'Photos', value: this.photos().length ? `${this.photos().length} photo(s)` : '—' },
    { label: 'Seller', value: `${this.name().trim()} · +91 ${this.phone().trim()}` },
    { label: 'District', value: this.district() || '—' },
    { label: 'Expected price', value: this.expectedPrice() ? `₹${Number(this.expectedPrice()).toLocaleString('en-IN')}` : 'Best offer' }
  ]);

  onPhotosPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    const room = this.maxPhotos - this.photos().length - this.compressing();
    if (room <= 0) {
      this.toast.error('Photo limit', `You can add a maximum of ${this.maxPhotos} photos.`);
      return;
    }
    const picked = files.slice(0, room);
    this.compressing.update((n) => n + picked.length);
    Promise.all(picked.map((f) => compressImage(f)))
      .then((compressed) => {
        this.photos.update((list) => [
          ...list,
          ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))
        ].slice(0, this.maxPhotos));
        this.compressing.set(0);
      })
      .catch(() => {
        this.compressing.set(0);
        this.toast.error('Photos failed', 'Could not process those images. Please try again.');
      });
  }

  removePhoto(index: number): void {
    this.photos.update((list) => {
      const removed = list[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return list.filter((_, i) => i !== index);
    });
  }

  setType(type: SellType): void {
    this.vehicleType.set(type);
  }

  next(): void {
    if (this.step() === 1) {
      if (!this.canGoStep2()) {
        this.toast.error('Vehicle details needed', 'Please enter your vehicle brand and model.');
        return;
      }
      this.step.set(2);
    } else if (this.step() === 2) {
      if (!this.name().trim() || this.phone().replace(/\D/g, '').length < 10) {
        this.toast.error('Contact details needed', 'Please enter your name and a valid 10-digit mobile number.');
        return;
      }
      this.step.set(3);
    }
  }

  back(): void {
    if (this.step() > 1) this.step.set(this.step() - 1);
  }

  startOver(): void {
    this.photos().forEach((p) => URL.revokeObjectURL(p.preview));
    this.photos.set([]);
    this.compressing.set(0);
    this.step.set(1);
    this.submitted.set(false);
    this.referenceId.set('');
  }

  submit(): void {
    if (this.submitting() || this.submitted()) return;
    this.submitting.set(true);
    const fields: Record<string, string> = {
      vehicleType: this.vehicleType(),
      brand: this.brand().trim(),
      model: this.model().trim(),
      year: this.year() ? String(Number(this.year())) : '',
      kilometers: this.kilometers() ? String(Number(this.kilometers())) : '',
      fuel: this.fuel(),
      transmission: this.transmission(),
      name: this.name().trim(),
      phone: this.phone().replace(/\D/g, ''),
      district: this.district(),
      expectedPrice: this.expectedPrice() ? String(Number(this.expectedPrice())) : '',
      notes: this.notes().trim()
    };
    // Multipart when photos exist (backend also accepts plain JSON).
    let body: FormData | Record<string, string> = fields;
    if (this.photos().length) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.append(k, v);
      for (const p of this.photos()) fd.append('images', p.file, p.file.name);
      body = fd;
    }
    this.http
      .post<{ _id?: string; id?: string }>(`${API_BASE}/sell-requests`, body)
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.referenceId.set(res?.id || '');
          this.toast.success('Request received!', 'Our team will call you within 24 hours.');
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Something went wrong', 'We could not submit your request. Please try again.');
        }
      });
  }
}
