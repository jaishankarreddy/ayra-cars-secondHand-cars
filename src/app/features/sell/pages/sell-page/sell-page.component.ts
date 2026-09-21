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
  LucideMapPin,
  LucidePhone,
  LucideShieldCheck
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { ToastService } from '../../../../services/toast.service';

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
    LucideMapPin,
    LucidePhone,
    LucideShieldCheck
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
    { label: 'Seller', value: `${this.name().trim()} · +91 ${this.phone().trim()}` },
    { label: 'District', value: this.district() || '—' },
    { label: 'Expected price', value: this.expectedPrice() ? `₹${Number(this.expectedPrice()).toLocaleString('en-IN')}` : 'Best offer' }
  ]);

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
    this.step.set(1);
    this.submitted.set(false);
    this.referenceId.set('');
  }

  submit(): void {
    if (this.submitting() || this.submitted()) return;
    this.submitting.set(true);
    this.http
      .post<{ _id?: string; id?: string }>(`${API_BASE}/sell-requests`, {
        vehicleType: this.vehicleType(),
        brand: this.brand().trim(),
        model: this.model().trim(),
        year: this.year() ? Number(this.year()) : null,
        kilometers: this.kilometers() ? Number(this.kilometers()) : null,
        fuel: this.fuel(),
        transmission: this.transmission(),
        name: this.name().trim(),
        phone: this.phone().replace(/\D/g, ''),
        district: this.district(),
        expectedPrice: this.expectedPrice() ? Number(this.expectedPrice()) : null,
        notes: this.notes().trim()
      })
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
