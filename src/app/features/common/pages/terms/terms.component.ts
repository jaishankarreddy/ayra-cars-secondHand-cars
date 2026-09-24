import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideChevronRight,
  LucideMail,
  LucidePhone,
  LucideFileText
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';

interface LegalSection {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  callout?: string;
}

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideChevronRight,
    LucideMail,
    LucidePhone,
    LucideFileText
  ],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
  readonly lastUpdated = 'September 20, 2026';

  readonly sections: LegalSection[] = [
    {
      id: 'acceptance',
      number: '01',
      title: 'Acceptance of these terms',
      paragraphs: [
        'By accessing ayracars.in or using our services — browsing listings, booking a test drive, making an offer or submitting a sell request — you agree to these Terms & Conditions.',
        'If you do not agree with any part of these terms, please do not use the site.'
      ],
      bullets: []
    },
    {
      id: 'about',
      number: '02',
      title: 'About Ayra Cars',
      paragraphs: [
        'Ayra Cars is a pre-owned vehicle marketplace based in Bengaluru, Karnataka. We connect buyers and sellers of inspected second-hand cars and bikes across the state.'
      ],
      bullets: [
        'We are not the manufacturer, insurer or original owner of the vehicles listed.',
        'Vehicle information is provided by sellers and verified to the extent described in each listing.',
        'Prices displayed are fixed and transparent — no hidden charges at the showroom.'
      ],
      callout: 'We list seller vehicles on the platform and complete the transaction with you directly, with RC transfer support included.'
    },
    {
      id: 'eligibility',
      number: '03',
      title: 'Eligibility',
      paragraphs: [
        'You must be at least 18 years old and legally capable of entering a contract under the Indian Contract Act, 1872. A valid driving licence is required to take a test drive.'
      ],
      bullets: []
    },
    {
      id: 'accounts',
      number: '04',
      title: 'Accounts and communications',
      paragraphs: [
        'You agree to provide accurate and current information whenever you enquire, sell or buy. You are responsible for activity carried out using the contact details you share with us.'
      ],
      bullets: []
    },
    {
      id: 'listings',
      number: '05',
      title: 'Vehicle listings and information',
      paragraphs: [],
      bullets: [
        'Listings are created and maintained by Ayra Cars on behalf of vehicle owners.',
        'Photographs are indicative; minor differences in condition or accessories may exist.',
        'Where stated, vehicles undergo a 200-point inspection and KA RTO record checks.',
        'We correct errors in listings as soon as they are discovered.'
      ]
    },
    {
      id: 'sellers',
      number: '06',
      title: 'Selling your vehicle',
      paragraphs: [
        'If you choose to sell through Ayra Cars, you authorise us to list, market, photograph and show your vehicle to prospective buyers.'
      ],
      bullets: [
        'Two payout options: if your vehicle passes our inspection we may buy it directly with same-day payment — otherwise it is listed on consignment and you are paid after the sale is completed with the buyer, along with the transfer paperwork.',
        'The final sale price is mutually agreed before transfer.',
        'You remain the owner until the transfer process is completed.',
        'You must disclose accident history, loans or hypothecation, challans and pending dues.'
      ],
      callout: 'Pass inspection = same-day payment. Otherwise we list it and pay after the sale — transparently, with the paperwork handled.'
    },
    {
      id: 'buyers',
      number: '07',
      title: 'Buying a vehicle',
      paragraphs: [],
      bullets: [
        'Browse listings, shortlist vehicles and contact us to arrange a visit.',
        'Prices are as displayed and fixed — we do not negotiate against listings.',
        'A vehicle is reserved only after the agreed booking amount is paid.'
      ]
    },
    {
      id: 'test-drives',
      number: '08',
      title: 'Test drives and inspections',
      paragraphs: [
        'Test drives are free and by appointment at our Bengaluru office (Vasanthapura Main Road, Konanakunte Cross). Doorstep test drives are available within 5 km of our office.'
      ],
      bullets: [
        'Bring a valid driving licence; our team may accompany the drive.',
        'Vehicles are shown in their current condition with the inspection report.',
        'Please arrive on time — slots are held for a limited window.'
      ]
    },
    {
      id: 'payments',
      number: '09',
      title: 'Payments, fees and RC transfer',
      paragraphs: [],
      bullets: [
        'Booking amount, full payment and loan options are communicated in writing before you pay.',
        'We assist with RC transfer at the Karnataka RTO; timelines depend on RTO processing.',
        'Challan, insurance and hypothecation status are checked before delivery.'
      ]
    },
    {
      id: 'prohibited',
      number: '10',
      title: 'Prohibited conduct',
      paragraphs: [],
      bullets: [
        'Providing false information or tampering with odometer or vehicle records.',
        'Circumventing platform fees or contacting sellers or buyers to evade agreed terms.',
        'Scraping, copying or misusing site content or data.',
        'Any use that is unlawful under Indian law.'
      ]
    },
    {
      id: 'ip',
      number: '11',
      title: 'Intellectual property',
      paragraphs: [
        'All content on ayracars.in — logos, text, photographs and design — belongs to Ayra Cars or its licensors. You may view and share links, but not copy or reuse content for commercial purposes without written permission.'
      ],
      bullets: []
    },
    {
      id: 'liability',
      number: '12',
      title: 'Disclaimers and limitation of liability',
      paragraphs: [
        'Vehicles are sold in the condition described in their inspection report. To the maximum extent permitted by law, Ayra Cars is not liable for indirect or consequential loss arising from the use of the site or a vehicle purchase.',
        'Our total liability for any claim is limited to the service fees actually paid to us for the transaction concerned.'
      ],
      bullets: []
    },
    {
      id: 'law',
      number: '13',
      title: 'Governing law and disputes',
      paragraphs: [
        'These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.'
      ],
      bullets: []
    },
    {
      id: 'changes',
      number: '14',
      title: 'Changes to these terms',
      paragraphs: [
        'We may update these terms as our services evolve. Continued use of the site after changes are posted means you accept the updated terms.'
      ],
      bullets: []
    },
    {
      id: 'contact',
      number: '15',
      title: 'Contact us',
      paragraphs: ['For questions about these terms, reach us at:'],
      bullets: [
        'Ayra Cars, Bengaluru, Karnataka',
        'Email: aayracars@gmail.com',
        'Phone: +91 98445 55308 / +91 98443 04116'
      ]
    }
  ];
}