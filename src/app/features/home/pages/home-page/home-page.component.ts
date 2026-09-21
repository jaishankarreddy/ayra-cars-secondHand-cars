import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBadgeCheck, LucideBike, LucideBookOpen, LucideCalendarCheck, LucideCalendarDays, LucideCarFront, LucideCheck, LucideCheckCheck, LucideCircleHelp, LucideFuel, LucideGauge, LucideHeart, LucideLanguages, LucideMapPin, LucidePhone, LucideShieldCheck, LucideUsers, LucideWrench } from '@lucide/angular';
import { LandingComponent } from '../../components/landing/landing.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BudgetSectionComponent } from '../../components/budget-section/budget-section.component';
import { VehicleCategorySectionComponent } from '../../components/vehicle-category-section/vehicle-category-section.component';
import { CatalogService, CatalogVehicle } from '../../../../services/catalog.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { BLOG_POSTS } from '../../../blog/data/blog.data';

interface VehicleCard {
  id: string;
  name: string;
  mileage: string;
  fuel: string;
  transmission: string;
  price: string;
  emi: string;
  image: string;
  location: string;
}

interface HomeBrand {
  name: string;
  logo: string;
  key: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [LandingComponent, FooterComponent, BudgetSectionComponent, VehicleCategorySectionComponent, RouterLink, LucideArrowRight, LucideBadgeCheck, LucideBike, LucideBookOpen, LucideCalendarCheck, LucideCalendarDays, LucideCarFront, LucideCheck, LucideCheckCheck, LucideCircleHelp, LucideFuel, LucideGauge, LucideHeart, LucideLanguages, LucideMapPin, LucidePhone, LucideShieldCheck, LucideUsers, LucideWrench],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly wishlistService = inject(WishlistService);

  readonly loading = this.catalog.loading;
  readonly featuredTab = signal<'best' | 'new'>('best');
  readonly wishlistCount = computed(() => this.wishlistService.count());
  readonly latestPosts = BLOG_POSTS.slice(0, 3);

  readonly bestVehicles = computed<VehicleCard[]>(() => {
    const featured = [...this.catalog.featuredCars(), ...this.catalog.featuredBikes()];
    return featured.slice(0, 4).map((v) => this.mapVehicle(v));
  });

  readonly newVehicles = computed<VehicleCard[]>(() => {
    const all = [...this.catalog.vehicles()];
    return all.slice(-4).reverse().map((v) => this.mapVehicle(v));
  });

  readonly vehicles = computed<VehicleCard[]>(() =>
    this.featuredTab() === 'best' ? this.bestVehicles() : this.newVehicles()
  );

  setFeaturedTab(tab: 'best' | 'new'): void {
    this.featuredTab.set(tab);
  }

  readonly brands: HomeBrand[] = [
    { name: 'Maruti Suzuki', logo: '/vehicle_logos/suzuki-logo.png', key: 'maruti suzuki' },
    { name: 'Hyundai', logo: '/vehicle_logos/hyundai-logo.png', key: 'hyundai' },
    { name: 'Tata', logo: '/vehicle_logos/tata-logo.png', key: 'tata' },
    { name: 'Mahindra', logo: '/vehicle_logos/mahindra-logo.png', key: 'mahindra' },
    { name: 'Toyota', logo: '/vehicle_logos/toyota-logo.png', key: 'toyota' },
    { name: 'Honda', logo: '/vehicle_logos/honda-logo.png', key: 'honda' },
    { name: 'Kia', logo: '/vehicle_logos/kia-logo.png', key: 'kia' },
    { name: 'Volkswagen', logo: '/vehicle_logos/volkswagen-logo.png', key: 'volkswagen' }
  ];
  readonly locations = [
    { name: 'Bengaluru', image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=700' },
    { name: 'Mysuru', image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=700' },
    { name: 'Mangaluru', image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=700' },
    { name: 'Hubballi', image: 'https://images.pexels.com/photos/358229/pexels-photo-358229.jpeg?auto=compress&cs=tinysrgb&w=700' }
  ];

  ngOnInit(): void {
    this.catalog.load();
  }

  private mapVehicle(v: CatalogVehicle): VehicleCard {
    return {
      id: v.id,
      name: `${v.year} ${v.brand} ${v.model}`,
      mileage: `${(v.kilometers ?? v.mileage ?? 0).toLocaleString('en-IN')} km`,
      fuel: v.fuel,
      transmission: v.transmission,
      price: this.formatPrice(v.price),
      emi: this.formatEmi(v.price),
      image: v.image,
      location: v.district || v.location || 'Bengaluru',
    };
  }

  private formatEmi(price: number): string {
    const principal = price * 0.85;
    const r = 0.11 / 12;
    const n = 60;
    const pow = Math.pow(1 + r, n);
    const emi = (principal * r * pow) / (pow - 1);
    if (!Number.isFinite(emi)) return '';
    return `₹${Math.round(emi).toLocaleString('en-IN')}/m`;
  }

  private formatPrice(price: number): string {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
  }
}
