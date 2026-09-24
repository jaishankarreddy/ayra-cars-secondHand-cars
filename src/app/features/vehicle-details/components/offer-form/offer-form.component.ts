import { Component, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { LucideSend, LucideCheckCircle2, LucideShieldCheck, LucideX, LucideUser } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { VehicleDetail } from '../../models/vehicle-detail.model';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [LucideSend, LucideCheckCircle2, LucideShieldCheck, LucideX, LucideUser, RippleDirective],
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.scss'
})
export class OfferFormComponent {
  readonly vehicle = input.required<VehicleDetail>();

  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly phone = signal('');
  readonly offerPrice = signal('');
  readonly message = signal('');
  readonly submitted = signal(false);
  readonly showLoginNudge = signal(false);

  submit(): void {
    if (!this.name().trim() || !this.phone().trim() || !this.offerPrice().trim()) {
      this.toast.error('Please complete the form', 'Your name, phone number and offer price are required.');
      return;
    }
    // Nudge guests to log in so the offer status can be tracked in their profile.
    if (!this.auth.isAuthenticated()) {
      this.showLoginNudge.set(true);
      return;
    }
    this.sendOffer();
  }

  goLogin(): void {
    this.showLoginNudge.set(false);
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
  }

  continueAsGuest(): void {
    this.showLoginNudge.set(false);
    this.sendOffer();
  }

  private sendOffer(): void {
    // Prefill from profile when logged in and fields left blank.
    const user = this.auth.user();
    const name = this.name().trim() || user?.name || '';
    const phone = this.phone().trim() || user?.phone || '';
    if (!name || !phone || !this.offerPrice().trim()) {
      this.toast.error('Please complete the form', 'Your name, phone number and offer price are required.');
      return;
    }
    this.http
      .post(`${API_BASE}/offers`, {
        vehicleId: this.vehicle().id,
        name,
        phone,
        offerPrice: Number(this.offerPrice()),
        message: this.message().trim()
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.toast.success(
            'Offer submitted!',
            `Our experts will contact you within 30 minutes for the ${this.vehicle().brand} ${this.vehicle().model}.`
          );
        },
        error: () => {
          this.submitted.set(false);
          this.toast.error('Something went wrong', 'We could not submit your offer. Please try again in a moment.');
        }
      });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  reset(): void {
    this.name.set('');
    this.phone.set('');
    this.offerPrice.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}