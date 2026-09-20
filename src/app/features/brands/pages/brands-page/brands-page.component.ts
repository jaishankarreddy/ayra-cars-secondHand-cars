import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideSearch,
  LucideX
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

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideSearch,
    LucideX
  ],
  templateUrl: './brands-page.component.html',
  styleUrl: './brands-page.component.scss'
})
export class BrandsPageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly type = signal<VehicleType>('All');
  readonly query = signal('');
  readonly failedLogos = signal<Set<string>>(new Set());

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
    const q = this.query().toLowerCase();
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
        result.push({
          name: displayName,
          key,
          type: 'Cars',
          count: val.cars,
          logo,
        });
      }

      if (isBike && (this.type() === 'All' || this.type() === 'Bikes')) {
        result.push({
          name: displayName,
          key,
          type: 'Bikes',
          count: val.bikes,
          logo,
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
}
