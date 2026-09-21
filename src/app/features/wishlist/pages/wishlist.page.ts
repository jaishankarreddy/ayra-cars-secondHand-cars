import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideArrowRight,
  LucideGrid2X2,
  LucideList,
  LucideMapPin,
  LucideFuel,
  LucideGauge,
  LucideSettings2,
  LucideBookmark,
  LucideBell,
  LucideScale,
  LucideBadgeCheck,
  LucideChevronDown
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { WishlistService } from '../../../services/wishlist.service';

interface DisplayVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  priceDisplay: string;
  fuel: string;
  transmission: string;
  kilometers: number;
  mileage: number;
  district: string;
  image: string;
  name: string;
}

type SortBy = 'recent' | 'price_asc' | 'price_desc' | 'year_desc';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideHeart,
    LucideArrowRight,
    LucideGrid2X2,
    LucideList,
    LucideMapPin,
    LucideFuel,
    LucideGauge,
    LucideSettings2,
    LucideBookmark,
    LucideBell,
    LucideScale,
    LucideBadgeCheck,
    LucideChevronDown
  ],
  templateUrl: './wishlist.page.html',
  styleUrl: './wishlist.page.scss'
})
export class WishlistPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly wishlistService = inject(WishlistService);

  readonly sortBy = signal<SortBy>('recent');
  readonly viewMode = signal<ViewMode>('grid');

  constructor() {
    this.catalog.load();
  }

  private toDisplay(v: CatalogVehicle): DisplayVehicle {
    const priceDisplay = v.price >= 100000
      ? `₹ ${(v.price / 100000).toFixed(2)} Lakh`
      : `₹${Math.round(v.price).toLocaleString('en-IN')}`;
    return {
      id: v.id,
      brand: v.brand,
      model: v.model,
      year: v.year,
      price: v.price,
      priceDisplay,
      fuel: v.fuel,
      transmission: v.transmission || (v.fuel === 'Electric' ? 'Automatic' : 'Manual'),
      kilometers: v.kilometers ?? 0,
      mileage: v.mileage ?? 0,
      district: v.district,
      image: v.image,
      name: `${v.brand} ${v.model} ${v.variant ? v.variant : ''}`.trim()
    };
  }

  readonly wishlistedVehiclesRaw = computed<DisplayVehicle[]>(() =>
    this.catalog.vehicles()
      .filter((v) => this.wishlistService.has(v.id))
      .map((v) => this.toDisplay(v))
  );

  readonly wishlistedVehicles = computed<DisplayVehicle[]>(() => {
    const list = [...this.wishlistedVehiclesRaw()];
    const sort = this.sortBy();
    if (sort === 'price_asc') return list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') return list.sort((a, b) => b.price - a.price);
    if (sort === 'year_desc') return list.sort((a, b) => b.year - a.year);
    return list;
  });

  readonly totalCount = computed(() => this.wishlistService.count());

  setSort(value: string): void {
    this.sortBy.set(value as SortBy);
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  wishlisted(id: string): boolean {
    return this.wishlistService.has(id);
  }

  toggleWishlist(id: string): void {
    this.wishlistService.toggle(id);
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as SortBy;
    this.sortBy.set(val);
  }
}
