import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  readonly highlights = [
    {
      icon: 'shieldCheck',
      title: 'RTO-verified stock',
      detail: 'RC, challan & insurance checked.'
    },
    {
      icon: 'handCoins',
      title: 'Negotiable fair prices',
      detail: 'Talk to us, no hidden charges.'
    },
    {
      icon: 'mapPin',
      title: 'Free test drives',
      detail: 'Office · Doorstep within 5 km.'
    },
    {
      icon: 'badgeCheck',
      title: 'All languages',
      detail: 'Talk to us in your language.'
    }
  ] as const;
}
