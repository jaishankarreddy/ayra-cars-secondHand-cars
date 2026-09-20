import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface BudgetCard {
  title: string;
  description: string;
  image: string;
  route: string;
}

@Component({
  selector: 'app-budget-section',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './budget-section.component.html'
})
export class BudgetSectionComponent {

  budgets: BudgetCard[] = [
    {
      title: 'Under ₹5 Lakh',
      description: 'Great value starts here',
      image: '/vehicle_by_budget/under_5lakh.png',
      route: '/cars?priceMax=500000'
    },
    {
      title: '₹5 – 8 Lakh',
      description: 'Popular choices',
      image: '/vehicle_by_budget/5-8lakh.png',
      route: '/cars?priceMin=500000&priceMax=800000'
    },
    {
      title: '₹8 – 12 Lakh',
      description: 'More options, more value',
      image: '/vehicle_by_budget/8-12lakh.png',
      route: '/cars?priceMin=800000&priceMax=1200000'
    },
    {
      title: '₹12 – 20 Lakh',
      description: 'Premium active value',
      image: '/vehicle_by_budget/12-20lakh.png',
      route: '/cars?priceMin=1200000&priceMax=2000000'
    },
    {
      title: '₹20 Lakh+',
      description: 'Premium without reach',
      image: '/vehicle_by_budget/20lakh+.png',
      route: '/cars?priceMin=2000000'
    }
  ];

  constructor(private router: Router) {}

  onBudgetClick(budget: BudgetCard): void {
    this.router.navigateByUrl(budget.route);
  }
}