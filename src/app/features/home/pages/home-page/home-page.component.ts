import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCalendarDays, LucideCarFront, LucideCheck, LucideCheckCheck, LucideFuel, LucideGauge, LucideHeart, LucideMapPin, LucideShieldCheck, LucideUsers } from '@lucide/angular';
import { LandingComponent } from '../../components/landing/landing.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BudgetSectionComponent } from '../../components/budget-section/budget-section.component';
import { VehicleCategorySectionComponent } from '../../components/vehicle-category-section/vehicle-category-section.component';
import { CatalogService, CatalogVehicle } from '../../../../services/catalog.service';

interface VehicleCard {
  id: string;
  name: string;
  mileage: string;
  fuel: string;
  transmission: string;
  price: string;
  image: string;
  location: string;
}

interface HomeBrand {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [LandingComponent, FooterComponent, BudgetSectionComponent, VehicleCategorySectionComponent, RouterLink, LucideArrowRight, LucideCalendarDays, LucideCarFront, LucideCheck, LucideCheckCheck, LucideFuel, LucideGauge, LucideHeart, LucideMapPin, LucideShieldCheck, LucideUsers],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly loading = this.catalog.loading;

  readonly vehicles = computed<VehicleCard[]>(() => {
    const featured = [...this.catalog.featuredCars(), ...this.catalog.featuredBikes()];
    return featured.slice(0, 4).map((v) => this.mapVehicle(v));
  });

  readonly brands: HomeBrand[] = [
    { name: 'Maruti Suzuki', logo: '/vehicle_logos/suzuki-logo.png' },
    { name: 'Hyundai', logo: '/vehicle_logos/hyundai-logo.png' },
    { name: 'Tata', logo: '/vehicle_logos/tata-logo.png' },
    { name: 'Mahindra', logo: '/vehicle_logos/mahindra-logo.png' },
    { name: 'Toyota', logo: '/vehicle_logos/toyota-logo.png' },
    { name: 'Honda', logo: '/vehicle_logos/honda-logo.png' },
    { name: 'Kia', logo: '/vehicle_logos/kia-logo.png' },
    { name: 'Volkswagen', logo: '/vehicle_logos/volkswagen-logo.png' }
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
      image: v.image,
      location: v.district || v.location || 'Bengaluru',
    };
  }

  private formatPrice(price: number): string {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
  }
}
