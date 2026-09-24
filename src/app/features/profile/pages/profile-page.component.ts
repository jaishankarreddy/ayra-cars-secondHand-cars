import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideUser,
  LucideMail,
  LucidePhone,
  LucideShieldCheck,
  LucideHeart,
  LucideLogOut,
  LucidePencil,
  LucideSave,
  LucideX,
  LucideBadgeCheck,
  LucideMapPin,
  LucideArrowRight,
  LucideHandCoins,
  LucideScale,
  LucideBell,
  LucideChevronRight
} from '@lucide/angular';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { MyOffersService, MyOffer } from '../services/my-offers.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CatalogService } from '../../../services/catalog.service';
import { CompareService } from '../../compare/services/compare.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent,
    LucideUser,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideHeart,
    LucideLogOut,
    LucidePencil,
    LucideSave,
    LucideX,
    LucideBadgeCheck,
    LucideMapPin,
    LucideArrowRight,
    LucideHandCoins,
    LucideScale,
    LucideBell,
    LucideChevronRight
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly offersApi = inject(MyOffersService);
  private readonly wishlistApi = inject(WishlistService);
  private readonly catalog = inject(CatalogService);
  private readonly compareApi = inject(CompareService);
  private readonly route = inject(ActivatedRoute);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');

  // editable fields
  readonly editName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');
  readonly editNotifyOffers = signal(true);
  readonly editNotifyNewsletter = signal(false);

  // expandable account rows: null | 'personal' | 'contact' | 'prefs'
  readonly expandedRow = signal<'personal' | 'contact' | 'prefs' | null>(null);

  readonly activeSection = signal<string>('top');

  readonly compareCount = () => this.compareApi.count();

  // my offers (status tracking)
  readonly offers = signal<MyOffer[]>([]);
  readonly offersLoading = signal(false);

  readonly hasOfferUpdates = computed(() => {
    const seen = this.seenAt();
    if (!seen) return this.offers().some((o) => o.status !== 'Pending');
    return this.offers().some((o) => o.status !== 'Pending' && Date.parse(o.updatedAt) > seen);
  });

  readonly offerSummary = computed(() => {
    const list = this.offers();
    return {
      pending: list.filter((o) => o.status === 'Pending').length,
      accepted: list.filter((o) => o.status === 'Accepted').length,
      countered: list.filter((o) => o.status === 'Countered').length
    };
  });

  // notifications feed (offer status changes, newest first)
  readonly notifications = computed(() =>
    this.offers()
      .filter((o) => o.status !== 'Pending')
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  );

  toggleRow(row: 'personal' | 'contact' | 'prefs'): void {
    this.expandedRow.update((cur) => (cur === row ? null : row));
  }

  scrollTo(id: string): void {
    this.activeSection.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // wishlist section (same data as /wishlist, embedded in profile)
  readonly wishlistIds = this.wishlistApi.wishlist;
  readonly wishlistVehicles = computed(() => {
    const byId = new Map(this.catalog.vehicles().map((v) => [v.id, v]));
    return this.wishlistIds()
      .map((id) => byId.get(id))
      .filter((v) => !!v);
  });

  removeFromWishlist(id: string): void {
    this.wishlistApi.toggle(id);
  }

  wishlistPrice(value: number): string {
    return value >= 100000
      ? `₹${(value / 100000).toFixed(2)} Lakh`
      : `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  readonly initials = computed(() => {
    const name = this.user()?.name || this.user()?.email || 'U';
    return name.split(' ').map(p=>p.charAt(0)).slice(0,2).join('').toUpperCase();
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigateByUrl('/auth/login?returnUrl=/profile');
      return;
    }
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'offers' || tab === 'wishlist' || tab === 'notifications') {
      setTimeout(() => {
        document.getElementById(`profile-${tab}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
    this.catalog.load();
    this.auth.fetchProfile().subscribe({
      next: () => {
        this.loading.set(false);
        this.resetEdit();
        this.loadOffers();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load profile. Please try again.');
      }
    });
  }

  private seenKey(): string {
    return `ayracars-offers-seen-${this.user()?.id || this.user()?.email || 'guest'}`;
  }

  private seenAt(): number {
    if (typeof window === 'undefined') return 0;
    return Number(window.localStorage.getItem(this.seenKey()) || 0);
  }

  private loadOffers(): void {
    this.offersLoading.set(true);
    this.offersApi.list().subscribe({
      next: (list) => {
        this.offers.set(list ?? []);
        this.offersLoading.set(false);
        // Mark as seen shortly after viewing so "Updated" badges clear.
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(this.seenKey(), String(Date.now()));
          }
        }, 2500);
      },
      error: () => {
        this.offers.set([]);
        this.offersLoading.set(false);
      }
    });
  }

  isOfferUpdated(o: MyOffer): boolean {
    if (o.status === 'Pending') return false;
    const seen = this.seenAt();
    if (!seen) return true;
    return Date.parse(o.updatedAt) > seen;
  }

  offerDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  }

  offerPrice(value: number): string {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  resetEdit(): void {
    const u = this.user();
    if (u) {
      this.editName.set(u.name || '');
      this.editEmail.set(u.email || '');
      this.editPhone.set(u.phone || '');
      this.editNotifyOffers.set(u.preferences?.notifyOffers ?? true);
      this.editNotifyNewsletter.set(u.preferences?.notifyNewsletter ?? false);
    }
    this.editMode.set(false);
    this.error.set('');
    this.success.set('');
  }

  startEdit(): void {
    this.resetEdit();
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.resetEdit();
  }

  save(): void {
    const name = this.editName().trim();
    const email = this.editEmail().trim().toLowerCase();
    const phone = this.editPhone().trim().replace(/\s+/g,'');
    if (!name) { this.error.set('Name cannot be empty.'); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { this.error.set('Please enter a valid email.'); return; }
    if (phone && !/^\d{10,15}$/.test(phone)) { this.error.set('Please enter a valid 10-digit mobile number.'); return; }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.updateProfile({
      name,
      email: email || undefined,
      phone: phone || undefined,
      preferences: {
        notifyOffers: this.editNotifyOffers(),
        notifyNewsletter: this.editNotifyNewsletter()
      }
    }).subscribe({
      next: ({ user }) => {
        this.saving.set(false);
        this.editMode.set(false);
        this.success.set('Profile updated successfully.');
        this.toast.success('Profile updated', 'Your details have been saved.');
      },
      error: (err: any) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to update profile. Please try again.';
        this.error.set(msg);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.toast.info('Logged out', 'You have been signed out.');
    this.router.navigateByUrl('/');
  }
}
