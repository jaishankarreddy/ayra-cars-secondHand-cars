import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {
  LucideArrowRight,
  LucideCircleUser,
  LucideHeart,
  LucideLogOut,
  LucideMenu,
  LucideScale,
  LucideSearch,
  LucideX
} from '@lucide/angular';
import { WishlistService } from '../../services/wishlist.service';
import { CompareService } from '../../features/compare/services/compare.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-site-navbar',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideCircleUser,
    LucideHeart,
    LucideLogOut,
    LucideMenu,
    LucideScale,
    LucideSearch,
    LucideX
  ],
  templateUrl: './site-navbar.component.html',
  styleUrl: './site-navbar.component.scss'
})
export class SiteNavbarComponent {
  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly mobileSearchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  readonly navActive = computed(() => {
    const url = this.currentUrl();
    return {
      cars: url.startsWith('/cars') || url.startsWith('/bikes'),
      brands: url.startsWith('/brands'),
      about: url.startsWith('/about'),
      contact: url.startsWith('/contact'),
      sell: url.startsWith('/sell'),
      home: url === '/'
    };
  });

  readonly wishlistCount = () => this.wishlistService.count();
  readonly compareCount = () => this.compareService.count();
  readonly isLoggedIn = () => this.auth.isAuthenticated();
  readonly userName = computed(() => this.auth.user()?.name ?? '');
  readonly userInitials = computed(() =>
    this.userName()
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  );

  logout(): void {
    this.auth.logout();
    this.menuOpen.set(false);
    this.toast.info('Logged out', 'You have been signed out. See you soon!');
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const trimmed = this.searchQuery().trim();
    if (!trimmed) return;
    this.router.navigate(['/cars'], { queryParams: { q: trimmed } });
    this.searchQuery.set('');
    this.searchFocused.set(false);
  }

  onMobileSearchInput(event: Event): void {
    this.mobileSearchQuery.set((event.target as HTMLInputElement).value);
  }

  onMobileSearch(event: Event): void {
    event.preventDefault();
    const trimmed = this.mobileSearchQuery().trim();
    if (!trimmed) return;
    this.router.navigate(['/cars'], { queryParams: { q: trimmed } });
    this.mobileSearchQuery.set('');
    this.menuOpen.set(false);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
