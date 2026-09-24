import { Component, signal } from '@angular/core';
import { LucidePlus, LucideMinus } from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface Faq {
  question: string;
  answer: string;
}

const FAQ_DATA: Faq[] = [
  {
    question: 'What is Ayra Cars?',
    answer: 'Ayra Cars is a trusted marketplace for buying and selling pre-owned cars and bikes in Karnataka. Every vehicle is inspected and certified for quality and transparency.'
  },
  {
    question: 'How are the vehicles inspected?',
    answer: 'Our team performs a comprehensive multi-point inspection covering engine, transmission, brakes, electrical systems, body condition, and more. Only vehicles that pass our quality standards are listed.'
  },
  {
    question: 'Can I negotiate the price?',
    answer: 'Yes! You can submit an offer on any vehicle listing. The seller will review your offer and can accept, counter, or decline it through our platform.'
  },
  {
    question: 'Do you offer financing options?',
    answer: 'We are working on partnering with leading financiers to bring you easy EMI options. Stay tuned for updates on financing support.'
  },
  {
    question: 'What documents do I need to buy a vehicle?',
    answer: 'You will need a valid ID proof (Aadhaar, PAN, or Passport), address proof, and a valid driving licence. Our team will guide you through the paperwork during the purchase.'
  },
  {
    question: 'Can I sell my vehicle on Ayra Cars?',
    answer: 'Absolutely! Click on "Sell your vehicle" in the navigation bar to get started. Our team will help you list your vehicle with the right pricing and photography.'
  },
  {
    question: 'How do I get support after purchase?',
    answer: 'Our team stays with you after delivery � for RC transfer, service history and any questions. Contact us in your language and we will resolve it promptly.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us through the Help page, call us at +91 98445 55308 or +91 98443 04116, or email us at aayracars@gmail.com. We are available 7 days a week.'
  }
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucidePlus, LucideMinus, SectionHeadingComponent, RevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  readonly faqs = signal<Faq[]>(FAQ_DATA);
  readonly openIndex = signal(-1);

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }
}
