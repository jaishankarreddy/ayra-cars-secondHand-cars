import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  LucideShieldCheck,
  LucideBadgeCheck,
  LucideHandCoins,
  LucideTruck,
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    LucideShieldCheck,
    LucideBadgeCheck,
    LucideHandCoins,
    LucideTruck,
    LucideArrowRight
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  readonly highlights = [
    {
      icon: 'shieldCheck',
      title: 'Certified vehicles',
      detail: 'Every listing passes a 200-point inspection.'
    },
    {
      icon: 'handCoins',
      title: 'Transparent pricing',
      detail: 'No hidden charges, no haggling surprises.'
    },
    {
      icon: 'truck',
      title: 'Doorstep delivery',
      detail: 'Get your vehicle delivered across Karnataka.'
    },
    {
      icon: 'badgeCheck',
      title: 'Paperwork handled',
      detail: 'RC transfer and insurance done for you.'
    }
  ] as const;
}
