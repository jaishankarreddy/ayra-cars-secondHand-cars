import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideChevronRight,
  LucideMail,
  LucidePhone,
  LucideShieldCheck
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
  selector: 'app-privacy-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideChevronRight,
    LucideMail,
    LucidePhone,
    LucideShieldCheck
  ],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  readonly lastUpdated = 'September 20, 2026';

  readonly sections: LegalSection[] = [
    {
      id: 'about-this-policy',
      number: '01',
      title: 'About this policy',
      paragraphs: [
        'Ayra Cars is a pre-owned vehicle marketplace based in Bengaluru, Karnataka. We help people buy and sell inspected second-hand cars and bikes across the state.',
        'This Privacy Policy explains what personal information we collect when you use our website or contact us, why we collect it, how we protect it, and the choices you have. It applies to ayracars.in and to enquiries, test drives, offers and sell requests made through it.'
      ],
      bullets: [],
      callout: 'In short: we collect only what we need to respond to you, arrange a test drive or complete a sale — and we never sell your personal information.'
    },
    {
      id: 'information-we-collect',
      number: '02',
      title: 'Information we collect',
      paragraphs: [
        'We collect information directly from you and automatically as you use the site. We do not knowingly collect more than we need.'
      ],
      bullets: [
        'Contact details you share — name, phone number, email address and city, for example when you enquire about a vehicle, book a test drive, make an offer or submit a sell request.',
        'Vehicle details for sellers — registration number, make, model, year, kilometres driven, fuel type, ownership and service history.',
        'Communications — messages, call notes and WhatsApp conversations with our team.',
        'Usage data — pages viewed, vehicles saved, search filters, approximate location, device and browser type collected through cookies and analytics.'
      ]
    },
    {
      id: 'how-we-use',
      number: '03',
      title: 'How we use your information',
      paragraphs: [],
      bullets: [
        'Respond to enquiries and arrange test drives at our office or at the vehicle location.',
        'Verify vehicle records such as RC, insurance and challan history through RTO and verification partners.',
        'Share sell requests with our team and connect genuine buyers.',
        'Improve our listings, search experience and website performance.',
        'Send you service updates; marketing messages only when you have opted in.',
        'Meet legal, tax and RTO compliance obligations.'
      ]
    },
    {
      id: 'when-we-share',
      number: '04',
      title: 'When we share information',
      paragraphs: [
        'We do not sell your personal information. We share it only as needed to run our services:'
      ],
      bullets: [
        'With the Ayra Cars team to answer your enquiry, arrange a viewing or process a sale.',
        'With buyers, for sell requests, once you agree to proceed.',
        'With verification, RTO, insurance and finance partners strictly for paperwork and checks.',
        'With trusted service providers such as hosting and analytics partners bound by contract.'
      ]
    },
    {
      id: 'cookies',
      number: '05',
      title: 'Cookies and tracking',
      paragraphs: [
        'Cookies are small text files stored on your device. They help the site remember your preferences and understand which pages are useful to visitors.',
        'You can block or delete cookies in your browser settings. Some features may not work as expected without them.'
      ],
      bullets: []
    },
    {
      id: 'data-security',
      number: '06',
      title: 'How we protect your data',
      paragraphs: [
        'We use reasonable technical and organisational safeguards — encrypted connections, restricted staff access and secure hosting.',
        'No method of transmission or storage is completely secure, so please avoid sharing sensitive documents over unverified channels.'
      ],
      bullets: [],
      callout: 'We will never ask for your OTP, bank password or card PIN. If someone does in our name, report it to us immediately.'
    },
    {
      id: 'data-retention',
      number: '07',
      title: 'How long we keep data',
      paragraphs: [],
      bullets: [
        'Enquiries and test drive requests: up to 24 months after the last interaction.',
        'Sell, purchase and RC transfer records: as required by tax and motor vehicle rules, typically up to 8 years.',
        'After these periods, data is deleted or anonymised.'
      ]
    },
    {
      id: 'your-rights',
      number: '08',
      title: 'Your rights and choices',
      paragraphs: [],
      bullets: [
        'Ask for a copy of the personal information we hold about you.',
        'Ask us to correct or delete information, subject to legal record-keeping duties.',
        'Withdraw consent for marketing messages at any time.',
        'Raise a concern with our grievance officer (details below).'
      ]
    },
    {
      id: 'third-party',
      number: '09',
      title: 'Third-party links and services',
      paragraphs: [
        'Our site may link to partner or social media websites. Their privacy policies apply to them, and we encourage you to read them before sharing information.'
      ],
      bullets: []
    },
    {
      id: 'children',
      number: '10',
      title: "Children's privacy",
      paragraphs: [
        'Our services are meant for people aged 18 and above. We do not knowingly collect personal information from children.'
      ],
      bullets: []
    },
    {
      id: 'changes',
      number: '11',
      title: 'Changes to this policy',
      paragraphs: [
        "We may update this policy as our services evolve. The latest version will always be posted here with a new 'last updated' date."
      ],
      bullets: []
    },
    {
      id: 'contact',
      number: '12',
      title: 'Contact us and grievance officer',
      paragraphs: ['For any privacy request or concern, contact us:'],
      bullets: [
        'Ayra Cars, Bengaluru, Karnataka',
        'Email: aayracars@gmail.com',
        'Phone: +91 98445 55308 / +91 98443 04116',
        'We respond within 7 working days.'
      ]
    }
  ];
}