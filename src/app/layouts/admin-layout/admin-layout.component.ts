import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { filter } from 'rxjs';
import {
  LucideCar,
  LucideLayoutDashboard,
  LucideWarehouse,
  LucideBike,
  LucideHandCoins,
  LucideMail,
  LucideCalendarDays,
  LucideSettings,
  LucideExternalLink,
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideSun,
  LucideMoon,
  LucideBell,
  LucideChevronsLeft,
  LucideChevronsRight,
  LucideSearch,
  LucideCheckCheck,
  LucideBadgeIndianRupee,
  LucideUsers,
  LucideImagePlus,
  LucideTags
} from '@lucide/angular';
import { AdminAuthService } from '../../features/admin/services/admin-auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: 'dashboard' | 'warehouse' | 'car' | 'bike' | 'offers' | 'mail' | 'calendar' | 'sell' | 'admins' | 'bulk' | 'brands' | 'settings';
  badgeKey?: 'vehicles' | 'offers' | 'contacts' | 'testDrives' | 'sellRequests';
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  cars: 'Cars',
  bikes: 'Bikes',
  offers: 'Offers',
  contacts: 'Contact Enquiries',
  'test-drives': 'Test Drives',
  'sell-requests': 'Sell Requests',
  admins: 'Admins',
  brands: 'Brands',
  'bulk-upload': 'Bulk Upload',
  settings: 'Settings',
  login: 'Sign in'
};

interface DashboardSummary {
  totalCars: number;
  totalBikes: number;
  totalVehicles: number;
  pendingOffers: number;
  newContacts: number;
  pendingTestDrives: number;
  newSellRequests: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideCar,
    LucideLayoutDashboard,
    LucideWarehouse,
    LucideBike,
    LucideHandCoins,
    LucideMail,
    LucideCalendarDays,
    LucideSettings,
    LucideExternalLink,
    LucideLogOut,
    LucideMenu,
    LucideX,
    LucideSun,
    LucideMoon,
    LucideBell,
    LucideChevronsLeft,
    LucideChevronsRight,
    LucideSearch,
    LucideCheckCheck,
    LucideBadgeIndianRupee,
    LucideUsers,
    LucideImagePlus,
    LucideTags
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly currentYear = new Date().getFullYear();
  readonly dark = signal(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  readonly search = signal('');
  readonly notifyOpen = signal(false);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly unreadCount = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return s.pendingOffers + s.newContacts + s.pendingTestDrives + s.newSellRequests;
  });

  readonly vehiclesBadge = computed(() => this.summary()?.totalVehicles ?? 0);
  readonly offersBadge = computed(() => this.summary()?.pendingOffers ?? 0);
  readonly contactsBadge = computed(() => this.summary()?.newContacts ?? 0);
  readonly testDrivesBadge = computed(() => this.summary()?.pendingTestDrives ?? 0);
  readonly sellRequestsBadge = computed(() => this.summary()?.newSellRequests ?? 0);

  readonly adminName = computed(() => this.auth.admin()?.name ?? 'Admin User');
  readonly adminInitials = computed(() =>
    this.adminName()
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  );

  readonly navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/vehicles', label: 'Vehicles', icon: 'warehouse', badgeKey: 'vehicles' },
    { path: '/admin/brands', label: 'Brands', icon: 'brands' },
    { path: '/admin/bulk-upload', label: 'Bulk Upload', icon: 'bulk' },
    { path: '/admin/cars', label: 'Cars', icon: 'car' },
    { path: '/admin/bikes', label: 'Bikes', icon: 'bike' },
    { path: '/admin/offers', label: 'Offers', icon: 'offers', badgeKey: 'offers' },
    { path: '/admin/contacts', label: 'Contacts', icon: 'mail', badgeKey: 'contacts' },
    { path: '/admin/test-drives', label: 'Test Drives', icon: 'calendar', badgeKey: 'testDrives' },
    { path: '/admin/sell-requests', label: 'Sell Requests', icon: 'sell', badgeKey: 'sellRequests' },
    { path: '/admin/admins', label: 'Admins', icon: 'admins' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' }
  ];

  readonly notifications = computed<{ id: number; title: string; detail: string }[]>(() => {
    const s = this.summary();
    if (!s) return [];
    const list: { id: number; title: string; detail: string }[] = [];
    if (s.pendingOffers) list.push({ id: 1, title: `${s.pendingOffers} pending offers`, detail: 'Review buyer offers waiting for response.' });
    if (s.newContacts) list.push({ id: 2, title: `${s.newContacts} new enquiries`, detail: 'Messages from the contact page need a reply.' });
    if (s.pendingTestDrives) list.push({ id: 3, title: `${s.pendingTestDrives} test drives pending`, detail: 'Confirm office test drives booked by buyers.' });
    if (s.newSellRequests) list.push({ id: 4, title: `${s.newSellRequests} sell requests`, detail: 'Sellers want Ayra to buy or list their vehicles.' });
    return list;
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const segment = this.router.url.split('?')[0].split('/').filter(Boolean).pop() ?? 'dashboard';
        this.pageTitle.set(PAGE_TITLES[segment] ?? 'Admin');
        this.mobileOpen.set(false);
        this.notifyOpen.set(false);
      });
  }

  ngOnInit(): void {
    this.http.get<DashboardSummary>(`${API_BASE}/admin/dashboard`).subscribe({
      next: (s) => this.summary.set(s),
      error: () => undefined
    });
    this.destroyRef.onDestroy(() => undefined);
  }

  badgeFor(item: NavItem): number {
    switch (item.badgeKey) {
      case 'vehicles': return this.vehiclesBadge();
      case 'offers': return this.offersBadge();
      case 'contacts': return this.contactsBadge();
      case 'testDrives': return this.testDrivesBadge();
      case 'sellRequests': return this.sellRequestsBadge();
      default: return 0;
    }
  }

  markAllRead(): void {
    this.notifyOpen.set(false);
  }

  searchSubmit(): void {
    const kw = this.search().trim();
    if (kw) {
      this.router.navigate(['/admin/vehicles'], { queryParams: { q: kw } });
    }
  }

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  toggleTheme(): void {
    const next = !this.dark();
    this.dark.set(next);
    document.documentElement.classList.toggle('dark', next);
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
