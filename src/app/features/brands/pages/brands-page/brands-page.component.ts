import { Component, signal, computed, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideSearch,
  LucideX,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCarFront,
  LucideBike,
  LucideHeadset,
  LucidePercent,
  LucideShieldCheck,
  LucideMapPin,
  LucideBadgeCheck,
  LucideTrendingUp,
  LucideWrench,
  LucideCalendarCheck,
  LucideSparkles
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { CatalogService, CatalogVehicle } from '../../../../services/catalog.service';

type VehicleType = 'All' | 'Cars' | 'Bikes';

interface BrandData {
  name: string;
  key: string;
  type: 'Cars' | 'Bikes';
  count: number;
  logo: string;
  priceFrom: string;
}

const LOGO_MAP: Record<string, string> = {
  'toyota': '/vehicle_logos/toyota-logo.png',
  'hyundai': '/vehicle_logos/hyundai-logo.png',
  'maruti suzuki': '/vehicle_logos/suzuki-logo.png',
  'suzuki': '/vehicle_logos/suzuki-logo.png',
  'kia': '/vehicle_logos/kia-logo.png',
  'honda': '/vehicle_logos/honda-logo.png',
  'tata': '/vehicle_logos/tata-logo.png',
  'mahindra': '/vehicle_logos/mahindra-logo.png',
  'bmw': '/vehicle_logos/bmw-logo.png',
  'mercedes': '/vehicle_logos/mercedes-benz-logo.png',
  'mercedes-benz': '/vehicle_logos/mercedes-benz-logo.png',
  'audi': '/vehicle_logos/audi-logo.png',
  'volkswagen': '/vehicle_logos/volkswagen-logo.png',
  'volkswagenswagen': '/vehicle_logos/volkswagen-logo.png',
  'renault': '/vehicle_logos/renault-logo.png',
  'ford': '/vehicle_logos/ford-logo.png',
  'chevrolet': '/vehicle_logos/chevrolet-logo.png',
  'nissan': '/vehicle_logos/nissan-logo.png',
  'skoda': '/vehicle_logos/skoda-logo.png',
  'mg': '/vehicle_logos/mg-logo.png',
  'jeep': '/vehicle_logos/jeep-logo.png',
  'lexus': '/vehicle_logos/lexus-logo.png',
  'subaru': '/vehicle_logos/subaru-logo.png',
  'tesla': '/vehicle_logos/tesla-logo.png',
  'mazda': '/vehicle_logos/mazda-logo.png',
  'fiat': '/vehicle_logos/fiat-logo.png',
  'volvo': '/vehicle_logos/volvo-logo.png',
  'royal enfield': '/vehicle_logos/Royal-Enfield-Logo.png',
  'ktm': '/vehicle_logos/ktm-logo.png',
  'yamaha': '/vehicle_logos/Yamaha_Motor_Company-Logo.wine.svg',
  'bajaj': '',
  'tvs': '/vehicle_logos/TVS_Motor_Company-Logo.wine.svg',
  'triumph': '',
  'ducati': '',
  'harley-davidson': '',
  'hero': '/vehicle_logos/Hero_Motors-Logo.wine.svg',
  'kawasaki': '/vehicle_logos/India_Kawasaki_Motors-Logo.wine.svg',
};

export interface MostSearchedBrand {
  name: string;
  key: string;
  logo: string;
  countLabel: string;
  count: number;
  image: string;
  priceFrom: string;
  type: 'Cars';
}

export interface MiniBrand {
  name: string;
  key: string;
  logo: string;
  count: number;
  priceFrom: string;
  type: 'Cars' | 'Bikes';
}

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideSearch,
    LucideX,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCarFront,
    LucideBike,
    LucideHeadset,
    LucidePercent,
    LucideShieldCheck,
    LucideMapPin,
    LucideBadgeCheck,
    LucideTrendingUp,
    LucideWrench,
    LucideCalendarCheck,
    LucideSparkles
  ],
  templateUrl: './brands-page.component.html',
  styleUrl: './brands-page.component.scss'
})
export class BrandsPageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly type = signal<VehicleType>('All');
  readonly query = signal('');
  readonly failedLogos = signal<Set<string>>(new Set());

  @ViewChild('mostSearchedTrack') mostSearchedTrack?: ElementRef<HTMLDivElement>;

  // Fallback images when DB has no representative image yet (keeps UI intact)
  private readonly fallbackImages: Record<string, string> = {
    'toyota': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    'hyundai': 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800',
    'maruti suzuki': 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
    'kia': 'https://images.pexels.com/photos/3311573/pexels-photo-3311573.jpeg?auto=compress&cs=tinysrgb&w=800',
  };

  readonly totalVehicles = computed(() => this.catalog.vehicles().length);
  readonly totalBrands = computed(() => this.brandCounts().size);
  readonly totalCars = computed(() => this.catalog.vehicles().filter(v => v.vehicleType === 'car').length);
  readonly totalBikes = computed(() => this.catalog.vehicles().filter(v => v.vehicleType !== 'car').length);

  readonly mostSearchedBrands = computed<MostSearchedBrand[]>(() => {
    const vehicles = this.catalog.vehicles();
    const counts = this.brandCounts();
    const carEntries = [...counts.entries()]
      .filter(([, v]) => v.cars > 0)
      .sort((a, b) => b[1].cars - a[1].cars)
      .slice(0, 4);

    return carEntries.map(([key, val]) => {
      const displayName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const logo = LOGO_MAP[key] ?? '';
      const count = val.cars;
      const countLabel = `${count} ${count === 1 ? 'Vehicle' : 'Vehicles'} in Karnataka`;
      const rep = vehicles.find(v => v.brand.toLowerCase() === key && v.vehicleType === 'car');
      const image = rep?.image || this.fallbackImages[key] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';
      const minPrice = vehicles
        .filter(v => v.brand.toLowerCase() === key && v.vehicleType === 'car')
        .reduce((min, v) => Math.min(min, v.price), Number.POSITIVE_INFINITY);
      return { name: displayName, key, logo, countLabel, count, image, priceFrom: this.formatPrice(minPrice), type: 'Cars' as const };
    });
  });

  readonly carPanelBrands = computed<MiniBrand[]>(() => {
    const counts = this.brandCounts();
    const vehicles = this.catalog.vehicles();
    return [...counts.entries()]
      .filter(([, v]) => v.cars > 0)
      .sort((a, b) => b[1].cars - a[1].cars)
      .slice(0, 6)
      .map(([key, val]) => {
        const displayName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const minPrice = vehicles
          .filter(v => v.brand.toLowerCase() === key && v.vehicleType === 'car')
          .reduce((min, v) => Math.min(min, v.price), Number.POSITIVE_INFINITY);
        return { name: displayName, key, logo: LOGO_MAP[key] ?? '', count: val.cars, priceFrom: this.formatPrice(minPrice), type: 'Cars' as const };
      });
  });

  readonly bikePanelBrands = computed<MiniBrand[]>(() => {
    const counts = this.brandCounts();
    const vehicles = this.catalog.vehicles();
    return [...counts.entries()]
      .filter(([, v]) => v.bikes > 0)
      .sort((a, b) => b[1].bikes - a[1].bikes)
      .slice(0, 6)
      .map(([key, val]) => {
        const displayName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const minPrice = vehicles
          .filter(v => v.brand.toLowerCase() === key && v.vehicleType !== 'car')
          .reduce((min, v) => Math.min(min, v.price), Number.POSITIVE_INFINITY);
        return { name: displayName, key, logo: LOGO_MAP[key] ?? '', count: val.bikes, priceFrom: this.formatPrice(minPrice), type: 'Bikes' as const };
      });
  });

  readonly brandCounts = computed(() => {
    const vehicles = this.catalog.vehicles();
    const map = new Map<string, { cars: number; bikes: number }>();

    for (const v of vehicles) {
      const key = v.brand.toLowerCase();
      if (!map.has(key)) map.set(key, { cars: 0, bikes: 0 });
      const entry = map.get(key)!;
      if (v.vehicleType === 'car') entry.cars++;
      else entry.bikes++;
    }

    return map;
  });

  readonly filtered = computed(() => {
    const counts = this.brandCounts();
    const vehicles = this.catalog.vehicles();
    const q = this.query().toLowerCase().trim();
    const result: BrandData[] = [];

    counts.forEach((val, key) => {
      const total = val.cars + val.bikes;
      if (total < 1) return;
      if (q && !key.includes(q)) return;

      const isCar = val.cars > 0;
      const isBike = val.bikes > 0;

      const displayName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const logo = LOGO_MAP[key] ?? '';

      if (isCar && (this.type() === 'All' || this.type() === 'Cars')) {
        const minPrice = vehicles
          .filter(v => v.brand.toLowerCase() === key && v.vehicleType === 'car')
          .reduce((min, v) => Math.min(min, v.price), Number.POSITIVE_INFINITY);
        result.push({
          name: displayName,
          key,
          type: 'Cars',
          count: val.cars,
          logo,
          priceFrom: this.formatPrice(minPrice),
        });
      }

      if (isBike && (this.type() === 'All' || this.type() === 'Bikes')) {
        const minPrice = vehicles
          .filter(v => v.brand.toLowerCase() === key && v.vehicleType !== 'car')
          .reduce((min, v) => Math.min(min, v.price), Number.POSITIVE_INFINITY);
        result.push({
          name: displayName,
          key,
          type: 'Bikes',
          count: val.bikes,
          logo,
          priceFrom: this.formatPrice(minPrice),
        });
      }
    });

    return result.sort((a, b) => b.count - a.count);
  });

  readonly popularBrands = computed(() => this.filtered().slice(0, 12));

  ngOnInit(): void {
    this.catalog.load();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
  }

  clearQuery(): void {
    this.query.set('');
  }

  setType(type: VehicleType): void {
    this.type.set(type);
    this.query.set('');
  }

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }

  getBrandRoute(brand: BrandData): string {
    return brand.type === 'Bikes' ? '/bikes' : '/cars';
  }

  getBrandQueryParams(brand: BrandData): Record<string, string> {
    return { brand: brand.key };
  }

  getMiniBrandRoute(brand: MiniBrand): string {
    return brand.type === 'Bikes' ? '/bikes' : '/cars';
  }

  getMiniBrandQueryParams(brand: MiniBrand): Record<string, string> {
    return { brand: brand.key };
  }

  getMostSearchedRoute(brand: MostSearchedBrand): string {
    return '/cars';
  }

  getMostSearchedQueryParams(brand: MostSearchedBrand): Record<string, string> {
    return { brand: brand.key };
  }

  scrollMostSearched(direction: 'prev' | 'next'): void {
    const el = this.mostSearchedTrack?.nativeElement;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 300;
    const amount = direction === 'next' ? cardWidth : -cardWidth;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  hasActiveFilters(): boolean {
    return this.query().trim().length > 0 || this.type() !== 'All';
  }

  clearAll(): void {
    this.query.set('');
    this.type.set('All');
  }

  formatPrice(price: number): string {
    if (!price || !Number.isFinite(price)) return 'Price on request';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  }
}
