import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBike,
  LucideCarFront,
  LucideCheck,
  LucideChevronDown,
  LucideLeaf,
  LucideShieldCheck,
  LucideUsers,
  LucideStar,
  LucideMapPin,
  LucideBadgeCheck,
  LucideWrench,
  LucideCalendarCheck,
  LucideLanguages,
  LucideSearchCheck
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideBike,
    LucideCarFront,
    LucideCheck,
    LucideChevronDown,
    LucideLeaf,
    LucideShieldCheck,
    LucideUsers,
    LucideStar,
    LucideMapPin,
    LucideBadgeCheck,
    LucideWrench,
    LucideCalendarCheck,
    LucideLanguages,
    LucideSearchCheck
  ],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss'
})
export class AboutPageComponent {
  readonly faqs = [
    {
      question: 'Are cars and bikes verified?',
      answer: 'Yes. Every car and bike goes through a 200-point inspection — engine, body, tyres, electronics, service history — plus KA RTO check for RC, challan and insurance. You get the full report before you decide.',
      open: false
    },
    {
      question: 'Do you help with KA RC transfer?',
      answer: 'Absolutely. We handle the complete Karnataka RC transfer — documentation, RTO submission, challan clearance and follow-ups — so ownership moves to you without running around.',
      open: false
    },
    {
      question: 'How do I schedule a test drive?',
      answer: 'Just contact us or visit our office — test drives are free for any vehicle, and doorstep test drives are available within 5 km of our office, in your language.',
      open: false
    },
    {
      question: 'Can I sell my car or bike through Ayra Cars?',
      answer: 'Yes. List in minutes — we help with inspection, fair pricing, photos, listing and genuine buyers across Karnataka, with RC transfer support included.',
      open: false
    },
    {
      question: 'Do you support loans and all languages?',
      answer: 'We guide you on used-vehicle loans and EMI options, and our team supports you in your language — Kannada, Hindi, English and more.',
      open: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
