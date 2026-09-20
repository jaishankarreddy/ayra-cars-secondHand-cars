import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCarFront, LucideMapPin, LucidePhoneCall, LucideMail, LucideMessageCircle } from '@lucide/angular';
import { NAV_LINKS, FOOTER_QUICK_LINKS, FOOTER_LEGAL_LINKS } from '../../data/home.data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    LucideCarFront,
    LucideMapPin,
    LucidePhoneCall,
    LucideMail,
    LucideMessageCircle
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly navLinks = NAV_LINKS;
  readonly quickLinks = FOOTER_QUICK_LINKS;
  readonly legalLinks = FOOTER_LEGAL_LINKS;

  readonly year = new Date().getFullYear();

  readonly socials: { label: string; href: string; icon: string }[] = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z"/></svg>`
    },
    {
      label: 'X (Twitter)',
      href: 'https://x.com',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-[18px] w-[18px]"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>`
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/919844555308',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34zM12.05 21.79h-.01a9.75 9.75 0 0 1-4.97-1.36l-.36-.21-3.69.97.99-3.6-.24-.37a9.76 9.76 0 0 1-1.5-5.22c0-5.38 4.38-9.76 9.78-9.76a9.7 9.7 0 0 1 6.91 2.86 9.72 9.72 0 0 1 2.86 6.92c0 5.39-4.39 9.77-9.77 9.77zm8.37-18.14A11.7 11.7 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L.09 24l6.28-1.65a11.9 11.9 0 0 0 5.68 1.44h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.54-8.24z"/></svg>`
    }
  ];
}
