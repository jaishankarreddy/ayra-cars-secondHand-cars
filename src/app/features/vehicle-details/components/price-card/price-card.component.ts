import { Component, input } from '@angular/core';
import { LucideBadgeIndianRupee, LucidePhoneCall, LucideMessageCircle, LucideCalendarCheck, LucideShieldCheck } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-price-card',
  standalone: true,
  imports: [LucideBadgeIndianRupee, LucidePhoneCall, LucideMessageCircle, LucideCalendarCheck, LucideShieldCheck, RippleDirective],
  templateUrl: './price-card.component.html',
  styleUrl: './price-card.component.scss'
})
export class PriceCardComponent {
  readonly price = input.required<number>();
  readonly phone = input('+91 98445 55308');
  readonly whatsapp = input('919844304116');

  get priceInRupees(): string {
    return Math.round(this.price()).toLocaleString('en-IN');
  }

  scrollToOffer(): void {
    document.getElementById('offer-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
