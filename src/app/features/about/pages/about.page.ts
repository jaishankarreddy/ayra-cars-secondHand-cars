import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCarFront,
  LucideCheck,
  LucideChevronDown,
  LucideLeaf,
  LucideShieldCheck,
  LucideUsers,
  LucideStar
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideCarFront,
    LucideCheck,
    LucideChevronDown,
    LucideLeaf,
    LucideShieldCheck,
    LucideUsers,
    LucideStar
  ],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss'
})
export class AboutPageComponent {
  readonly faqs = [
    {
      question: 'Are the cars verified?',
      answer: 'Yes. Every vehicle on Ayra Cars goes through a rigorous 200-point inspection covering engine health, body condition, electronics, tyres and more. You receive a detailed report before making any decision.',
      open: false
    },
    {
      question: 'Do you help with RC transfer?',
      answer: 'Absolutely. We handle the complete RC transfer process including documentation, RTO submissions and follow-ups, so you don\'t have to worry about the paperwork.',
      open: false
    },
    {
      question: 'Can I sell my car through Ayra Cars?',
      answer: 'Yes! You can list your car on Ayra Cars in just a few steps. We help with inspection, pricing, listing and connecting you with genuine buyers across Karnataka.',
      open: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
