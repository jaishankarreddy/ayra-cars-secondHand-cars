import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { RouterLink } from '@angular/router';
import {
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucideSend,
  LucideClock,
  LucideLock,
  LucideCar,
  LucideCircleDot,
  LucideTag,
  LucideChevronRight,
  LucideArrowRight
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucidePhone,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucideSend,
    LucideClock,
    LucideLock,
    LucideCar,
    LucideCircleDot,
    LucideTag,
    LucideChevronRight,
    LucideArrowRight
  ],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss'
})
export class ContactPageComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly enquiryType = signal('');
  readonly message = signal('');
  readonly submitted = signal(false);
  readonly expandedFaq = signal<number | null>(null);

  readonly faqs = [
    {
      icon: 'car' as const,
      question: 'How can I enquire\nabout a vehicle?',
      answer: 'You can fill out the enquiry form on the vehicle details page or contact us directly by phone or WhatsApp.'
    },
    {
      icon: 'steering' as const,
      question: 'Can I schedule a\ntest drive?',
      answer: 'Yes, absolutely. Contact us and we\'ll help you schedule a test drive at a convenient time.'
    },
    {
      icon: 'whatsapp' as const,
      question: 'Can I contact you\nthrough WhatsApp?',
      answer: 'Yes, you can reach us on WhatsApp for quick assistance, vehicle details and more.'
    },
    {
      icon: 'tag' as const,
      question: 'How can I sell\nmy vehicle?',
      answer: 'You can use our Sell Your Vehicle page or get in touch with our team for a free evaluation.'
    }
  ];

  toggleFaq(index: number): void {
    this.expandedFaq.set(this.expandedFaq() === index ? null : index);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (!this.name().trim() || !this.phone().trim() || !this.message().trim()) {
      this.toast.error('Please complete the form', 'Name, phone and message are required.');
      return;
    }
    this.http
      .post(`${API_BASE}/contacts`, {
        name: this.name().trim(),
        email,
        phone: this.phone().trim(),
        subject: this.enquiryType().trim(),
        message: this.message().trim()
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.toast.success('Message sent!', 'Thanks for reaching out — we typically reply within 24 hours.');
        },
        error: () => {
          this.submitted.set(false);
          this.toast.error('Something went wrong', 'We could not send your message. Please try again shortly.');
        }
      });
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.enquiryType.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}
