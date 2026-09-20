import { Component, computed, input, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideChevronLeft, LucideChevronRight, LucideHeart } from '@lucide/angular';
import { CatalogService, CatalogVehicle } from '../../../../services/catalog.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { VehicleDetail } from '../../models/vehicle-detail.model';

interface SimilarVehicle {
  id: string;
  name: string;
  year: number;
  kilometers: number;
  fuel: string;
  price: number;
  image: string;
  brand: string;
  model: string;
  bodyType: string;
  vehicleType: string;
}

@Component({
  selector: 'app-similar-vehicles',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideChevronLeft, LucideChevronRight, LucideHeart],
  templateUrl: './similar-vehicles.component.html',
  styleUrl: './similar-vehicles.component.scss'
})
export class SimilarVehiclesComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly wishlist = inject(WishlistService);

  readonly vehicle = input.required<CatalogVehicle | VehicleDetail>();

  readonly scrollPosition = signal(0);
  readonly cardWidth = signal(270);

  readonly similarVehicles = computed(() => {
    const current = this.vehicle();
    if (!current) return [];

    const vehicleType = current.vehicleType || 'car';
    const allVehicles = this.catalog.vehicles();
    const priceTolerance = 0.25;
    const minPrice = current.price * (1 - priceTolerance);
    const maxPrice = current.price * (1 + priceTolerance);

    const candidates = allVehicles
      .filter(v => v.id !== current.id)
      .filter(v => v.vehicleType === vehicleType)
      .filter(v => v.bodyType?.toLowerCase() === current.bodyType?.toLowerCase())
      .filter(v => v.availability === 'available' || !v.availability);

    const scored = candidates.map(v => {
      let score = 0;

      // Price similarity (higher score for closer price)
      if (v.price >= minPrice && v.price <= maxPrice) {
        score += 30;
        const priceDiff = Math.abs(v.price - current.price) / current.price;
        score += (1 - priceDiff) * 20;
      }

      // Same fuel type
      if (v.fuel?.toLowerCase() === current.fuel?.toLowerCase()) {
        score += 15;
      }

      // Same transmission
      if (v.transmission?.toLowerCase() === current.transmission?.toLowerCase()) {
        score += 10;
      }

      // Similar year
      if (v.year === current.year) {
        score += 10;
      } else if (Math.abs(v.year - current.year) === 1) {
        score += 5;
      }

      // Same brand bonus
      if (v.brand?.toLowerCase() === current.brand?.toLowerCase()) {
        score += 5;
      }

      return { ...v, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(v => ({
        id: v.id,
        name: `${v.year} ${v.brand} ${v.model}`,
        year: v.year,
        kilometers: v.kilometers,
        fuel: v.fuel,
        price: v.price,
        image: v.image,
        brand: v.brand,
        model: v.model,
        bodyType: v.bodyType,
        vehicleType: v.vehicleType,
      }));
  });

  readonly viewAllLink = computed(() => {
    const current = this.vehicle();
    if (!current) return '/cars';

    const vehicleType = current.vehicleType || 'car';
    const base = vehicleType === 'bike' ? '/bikes' : '/cars';
    const params = new URLSearchParams();

    if (current.bodyType) params.set('bodyType', current.bodyType);

    const priceTolerance = 0.25;
    const minPrice = Math.round(current.price * (1 - priceTolerance));
    const maxPrice = Math.round(current.price * (1 + priceTolerance));
    params.set('minPrice', minPrice.toString());
    params.set('maxPrice', maxPrice.toString());

    return `${base}?${params.toString()}`;
  });

  readonly showArrows = computed(() => this.similarVehicles().length > 4);

  ngOnInit(): void {
    this.catalog.load();
  }

  scrollLeft(container: HTMLElement): void {
    const scrollAmount = this.cardWidth() * 2 + 14;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollRight(container: HTMLElement): void {
    const scrollAmount = this.cardWidth() * 2 + 14;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  formatPrice(price: number): string {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }

  formatKm(km: number): string {
    return `${(km / 1000).toFixed(1)}k km`;
  }

  toggleWishlist(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(id);
  }

  isWishlisted(id: string): boolean {
    return this.wishlist.has(id);
  }
}
