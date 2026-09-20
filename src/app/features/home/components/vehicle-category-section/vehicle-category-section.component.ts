import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

interface VehicleCategory {
  title: string;
  description: string;
  image: string;
  route: string;
}

@Component({
  selector: 'app-vehicle-category-section',
  standalone: true,
  imports: [NgFor],
  templateUrl: './vehicle-category-section.component.html'
})
export class VehicleCategorySectionComponent {

  categories: VehicleCategory[] = [
    { title: 'Hatchback', description: 'Practical and efficient', image: '/looking_for/hatchback.png', route: '/cars?bodyType=Hatchback' },
    { title: 'Sedan',     description: 'Stylish and comfortable', image: '/looking_for/sedan.png',     route: '/cars?bodyType=Sedan' },
    { title: 'SUV',       description: 'Built for every journey', image: '/looking_for/SUV.png',       route: '/cars?bodyType=SUV' },
    { title: 'MUV',       description: 'Space for what matters',  image: '/looking_for/muv.png',       route: '/cars?bodyType=MUV' },
    { title: 'Luxury',    description: 'For a premium experience', image: '/looking_for/Luxury.png',    route: '/cars?bodyType=Luxury' },
    { title: 'Bikes',     description: 'For those who two wheels', image: '/looking_for/bike.png',      route: '/bikes' }
  ];

  constructor(private router: Router) {}

  onCategoryClick(category: VehicleCategory): void {
    this.router.navigateByUrl(category.route);
  }
}