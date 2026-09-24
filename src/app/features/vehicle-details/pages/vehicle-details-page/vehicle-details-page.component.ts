import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_BASE } from '@config/api';
import {
  LucideBadgeCheck,
  LucideCalendarDays,
  LucideCheck,
  LucideChevronRight,
  LucideCircleCheck,
  LucideArrowRight,
  LucideFuel,
  LucideGitCompare,
  LucideHeart,
  LucideInfo,
  LucideMapPin,
  LucideMessageCircle,
  LucidePhone,
  LucideRepeat,
  LucideRoute,
  LucideSend,
  LucideSettings,
  LucideShare2,
  LucideShieldCheck,
  LucideTag,
  LucideTimer,
  LucideUsers,
  LucideZap
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { StickyContactCardComponent } from '../../components/sticky-contact-card/sticky-contact-card.component';
import { ImageGalleryComponent } from '../../components/image-gallery/image-gallery.component';
import { SimilarVehiclesComponent } from '../../components/similar-vehicles/similar-vehicles.component';
import { VehicleDetailsService } from '../../services/vehicle-details.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-vehicle-details-page',
  standalone: true,
  imports: [
    FooterComponent,
    StickyContactCardComponent,
    ImageGalleryComponent,
    SimilarVehiclesComponent,
    RouterLink,
    LucideBadgeCheck,
    LucideCalendarDays,
    LucideCheck,
    LucideChevronRight,
    LucideCircleCheck,
    LucideArrowRight,
    LucideFuel,
    LucideGitCompare,
    LucideHeart,
    LucideInfo,
    LucideMapPin,
    LucideMessageCircle,
    LucidePhone,
    LucideRepeat,
    LucideRoute,
    LucideSend,
    LucideSettings,
    LucideShare2,
    LucideShieldCheck,
    LucideTag,
    LucideTimer,
    LucideUsers,
    LucideZap
  ],
  templateUrl: './vehicle-details-page.component.html',
  styleUrl: './vehicle-details-page.component.scss'
})
export class VehicleDetailsPageComponent {
  private readonly service = inject(VehicleDetailsService);
  private readonly wishlist = inject(WishlistService);
  private readonly compare = inject(CompareService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  /** Route param bound automatically via withComponentInputBinding. */
  readonly id = input.required<string>();

  readonly vehicle = this.service.detail;
  readonly loading = this.service.loading;

  readonly saved = signal(false);
  readonly showAllPhotos = signal(false);
  readonly offerSent = signal(false);
  readonly name = signal('');
  readonly phone = signal('');
  readonly offerPrice = signal('');
  readonly message = signal('');

  readonly tdName = signal('');
  readonly tdPhone = signal('');
  readonly tdDate = signal('');
  readonly tdTime = signal('');
  readonly testDriveSent = signal(false);

  readonly isBike = computed(() => this.vehicle()?.vehicleType === 'bike');
  readonly images = computed(() => {
    const images = this.vehicle()?.images ?? [];
    return images.length ? images : [this.vehicle()?.image ?? ''];
  });
  readonly photos = computed(() => this.images());
  readonly primaryImage = computed(() => this.images()[0] ?? '');

  readonly formatPrice = (price: number) =>
    `₹${Math.round(price).toLocaleString('en-IN')}`;
  readonly formatDistance = (km: number) => `${km.toLocaleString('en-IN')} km`;

  /** Real EMI estimate (85% loan, 11% p.a., 60 months) — never hardcoded. */
  readonly emiText = computed(() => {
    const price = this.vehicle()?.price ?? 0;
    if (!price) return '';
    const principal = price * 0.85;
    const r = 0.11 / 12;
    const n = 60;
    const pow = Math.pow(1 + r, n);
    const emi = (principal * r * pow) / (pow - 1);
    if (!Number.isFinite(emi)) return '';
    return `EMI from ₹${Math.round(emi).toLocaleString('en-IN')}/month onwards`;
  });

  readonly ownerLabel = computed(() => {
    const owners = this.vehicle()?.owners ?? 1;
    if (owners === 1) return '1st Owner';
    if (owners === 2) return '2nd Owner';
    if (owners === 3) return '3rd Owner';
    return `${owners} Owners`;
  });

  /** Today's date (YYYY-MM-DD) as min for the test-drive date picker. */
  readonly todayStr = computed(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  });

  /** Live offer-vs-asking feedback under the offer input. */
  readonly offerDiff = computed(() => {
    const asking = this.vehicle()?.price ?? 0;
    const offer = Number(this.offerPrice());
    if (!asking || !Number.isFinite(offer) || offer <= 0) return '';
    const pct = Math.round(((offer - asking) / asking) * 100);
    if (pct > 0) return `${pct}% above asking`;
    if (pct < 0) return `${Math.abs(pct)}% below asking`;
    return 'Matches the asking price';
  });

  readonly phoneLink = computed(() => this.vehicle()?.seller.phone ?? '+91 98445 55308');
  readonly whatsappLink = computed(() => this.vehicle()?.seller.whatsapp ?? '919844304116');
  readonly contactPhone = this.phoneLink;
  readonly contactWhatsapp = this.whatsappLink;
  readonly contactPrice = computed(() => this.vehicle()?.price ?? 0);

  readonly specs = computed(() => {
    const v = this.vehicle();
    if (!v) return [];
    const isBike = v.vehicleType === 'bike';
    const array: { icon: string; label: string; value: string | number }[] = [
      { icon: 'calendar', label: 'Year', value: v.year },
      { icon: 'fuel', label: 'Fuel type', value: v.fuel },
      { icon: 'sliders', label: 'Transmission', value: v.transmission },
      { icon: 'route', label: 'Mileage', value: `${v.mileage} km/l` },
      { icon: 'users', label: 'Ownership', value: `${v.owners} owner${v.owners > 1 ? 's' : ''}` },
      { icon: isBike ? 'gauge' : 'zap', label: isBike ? 'Engine' : 'Powertrain', value: v.engine || 'Not provided' },
      { icon: 'palette', label: 'Color', value: v.color },
      { icon: 'shield', label: 'Safety', value: v.abs ? 'ABS equipped' : 'Standard safety' }
    ];
    return array;
  });

  readonly detailColumns = computed(() => {
    const v = this.vehicle();
    if (!v) return [[], []];
    return [
      [
        { label: 'Make', value: v.brand },
        { label: 'Model', value: v.model },
        { label: 'Variant', value: v.variant },
        { label: 'Year', value: v.year },
        { label: 'Fuel Type', value: v.fuel },
        { label: 'Transmission', value: v.transmission }
      ],
      [
        { label: 'Kilometres Driven', value: this.formatDistance(v.kilometers) },
        { label: 'Ownership', value: `${v.owners}st Owner`.replace('2st', '2nd').replace('3st', '3rd') },
        { label: 'Registration', value: v.registration || 'Not provided' },
        { label: 'Insurance Valid Till', value: v.insurance || 'Not provided' },
        { label: 'RTO', value: v.location },
        { label: 'Colour', value: v.color }
      ]
    ];
  });

  readonly features = computed(() => {
    const v = this.vehicle();
    if (!v || !Array.isArray(v.features)) return [];
    return v.features.flatMap((g) => g.items);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.service.load(id);
        this.saved.set(this.wishlist.has(id));
      }
    });
  }

  toggleSaved(): void {
    const v = this.vehicle();
    if (!v) return;
    this.wishlist.toggle(v.id);
    this.saved.set(this.wishlist.has(v.id));
  }

  isCompared(): boolean {
    const v = this.vehicle();
    return !!v && this.compare.ids().includes(v.id);
  }

  toggleCompare(): void {
    const v = this.vehicle();
    if (!v) return;
    this.compare.toggle(v.id);
  }

  share(): void {
    const v = this.vehicle();
    const data = { title: `${v?.brand} ${v?.model}`, text: `Check out this ${v?.brand} ${v?.model} on Ayra Cars`, url: window.location.href };
    if (navigator.share) {
      navigator.share(data).catch(() => undefined);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() =>
        this.toast.info('Link copied', 'The vehicle link has been copied to your clipboard.')
      );
    }
  }

  scrollToOffer(): void {
    document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  scrollToTestDrive(): void {
    document.getElementById('test-drive')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  submitOffer(event: Event): void {
    event.preventDefault();
    const v = this.vehicle();
    if (!v) return;
    if (!this.name().trim() || !this.phone().trim() || !this.offerPrice().trim()) {
      this.toast.error('Please complete the form', 'Your name, phone number and offer price are required.');
      return;
    }
    this.http
      .post(`${API_BASE}/offers`, {
        vehicleId: v.id,
        name: this.name().trim(),
        phone: this.phone().trim(),
        offerPrice: Number(this.offerPrice()),
        message: this.message().trim()
      })
      .subscribe({
        next: () => {
          this.offerSent.set(true);
          this.toast.success('Offer submitted!', `Our experts will contact you within 30 minutes for the ${v.brand} ${v.model}.`);
        },
        error: () => {
          this.offerSent.set(false);
          this.toast.error('Something went wrong', 'We could not submit your offer. Please try again in a moment.');
        }
      });
  }

  submitTestDrive(): void {
    const v = this.vehicle();
    if (!v) return;
    if (!this.tdName().trim() || !this.tdPhone().trim()) {
      this.toast.error('Please complete the form', 'Your name and phone number are required.');
      return;
    }
    this.http
      .post(`${API_BASE}/test-drives`, {
        vehicleId: v.id,
        name: this.tdName().trim(),
        phone: this.tdPhone().trim(),
        preferredDate: this.tdDate(),
        preferredTime: this.tdTime()
      })
      .subscribe({
        next: () => {
          this.testDriveSent.set(true);
          this.toast.success('Test drive requested!', `We'll confirm your test drive for the ${v.brand} ${v.model} shortly.`);
        },
        error: () => {
          this.toast.error('Something went wrong', 'We could not submit your request. Please try again.');
        }
      });
  }
}