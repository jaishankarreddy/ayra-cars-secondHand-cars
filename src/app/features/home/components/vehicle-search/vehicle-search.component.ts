import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideSearch,
  LucideChevronDown,
  LucideCar,
  LucideBike,
  LucideMapPin,
  LucideIndianRupee,
  LucideFuel,
  LucideSlidersHorizontal
} from '@lucide/angular';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { CatalogService } from '../../../../services/catalog.service';

interface SearchOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-vehicle-search',
  standalone: true,
  imports: [
    LucideSearch,
    LucideChevronDown,
    LucideCar,
    LucideBike,
    LucideMapPin,
    LucideIndianRupee,
    LucideFuel,
    LucideSlidersHorizontal,
    MagneticDirective
  ],
  templateUrl: './vehicle-search.component.html',
  styleUrl: './vehicle-search.component.scss'
})
export class VehicleSearchComponent {
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);

  readonly vehicleType = signal('car');
  readonly brand = signal('');
  readonly model = signal('');
  readonly budget = signal('');
  readonly fuel = signal('');
  readonly location = signal('');

  readonly vehicleTypes: SearchOption[] = [
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike' }
  ];

  constructor() {
    this.catalog.loadMasterBrands();
  }

  /** Admin-managed master brands, filtered by the selected vehicle type. */
  readonly brands = computed<SearchOption[]>(() => {
    const names = this.vehicleType() === 'bike' ? this.catalog.bikeBrandNames() : this.catalog.carBrandNames();
    return [{ value: '', label: 'Any brand' }, ...names.map((n) => ({ value: n, label: n }))];
  });

  setType(value: string): void {
    this.vehicleType.set(value);
    if (this.brand() && !this.brands().some((b) => b.value === this.brand())) {
      this.brand.set('');
    }
  }

  readonly budgets: SearchOption[] = [
    { value: '', label: 'Any budget' },
    { value: '0-5', label: 'Under ₹5,00,000' },
    { value: '5-10', label: '₹5,00,000 – ₹10,00,000' },
    { value: '10-15', label: '₹10,00,000 – ₹15,00,000' },
    { value: '15-25', label: '₹15,00,000 – ₹25,00,000' },
    { value: '25+', label: '₹25,00,000+ (Cars only)' }
  ];

  readonly fuels: SearchOption[] = [
    { value: '', label: 'Any fuel' },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' }
  ];

  readonly locations: SearchOption[] = [
    { value: '', label: 'All locations' },
    { value: 'Bengaluru', label: 'Bengaluru' },
    { value: 'Mysuru', label: 'Mysuru' },
    { value: 'Hubballi', label: 'Hubballi' },
    { value: 'Mangaluru', label: 'Mangaluru' },
    { value: 'Belagavi', label: 'Belagavi' },
    { value: 'Kalaburagi', label: 'Kalaburagi' }
  ];

  search(): void {
    const params: Record<string, string> = {};
    if (this.brand()) params['brand'] = this.brand();
    if (this.model().trim()) params['q'] = this.model().trim();
    if (this.fuel()) params['fuel'] = this.fuel();
    if (this.location()) params['district'] = this.location();
    const range = this.budgetToPriceRange(this.budget());
    if (range.min > 0) params['priceMin'] = String(range.min);
    if (range.max < Number.POSITIVE_INFINITY) params['priceMax'] = String(range.max);
    this.router.navigate([this.vehicleType() === 'bike' ? '/bikes' : '/cars'], { queryParams: params });
  }

  private budgetToPriceRange(budget: string): { min: number; max: number } {
    switch (budget) {
      case '0-5': return { min: 0, max: 500000 };
      case '5-10': return { min: 500000, max: 1000000 };
      case '10-15': return { min: 1000000, max: 1500000 };
      case '15-25': return { min: 1500000, max: 2500000 };
      case '25+': return { min: 2500000, max: Number.POSITIVE_INFINITY };
      default: return { min: 0, max: Number.POSITIVE_INFINITY };
    }
  }
}
