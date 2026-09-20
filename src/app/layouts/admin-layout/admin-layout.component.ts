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
  LucideCheckCheck
} from '@lucide/angular';
import { AdminAuthService } from '../../features/admin/services/admin-auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: 'dashboard' | 'warehouse' | 'car' | 'bike' | 'offers' | 'mail' | 'calendar' | 'settings';
  badgeKey?: 'vehicles' | 'offers' | 'contacts' | 'testDrives';
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  cars: 'Cars',
  bikes: 'Bikes',
  offers: 'Offers',
  contacts: 'Contact Enquiries',
  'test-drives': 'Test Drives',
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
    LucideCheckCheck
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
  readonly unreadCount = signal(3);

  readonly vehiclesBadge = computed(() => this.summary()?.totalVehicles ?? 0);
  readonly offersBadge = computed(() => this.summary()?.pendingOffers ?? 0);
  readonly contactsBadge = computed(() => this.summary()?.newContacts ?? 0);
  readonly testDrivesBadge = computed(() => this.summary()?.pendingTestDrives ?? 0);

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
    { path: '/admin/cars', label: 'Cars', icon: 'car' },
    { path: '/admin/bikes', label: 'Bikes', icon: 'bike' },
    { path: '/admin/offers', label: 'Offers', icon: 'offers', badgeKey: 'offers' },
    { path: '/admin/contacts', label: 'Contacts', icon: 'mail', badgeKey: 'contacts' },
    { path: '/admin/test-drives', label: 'Test Drives', icon: 'calendar', badgeKey: 'testDrives' }
  ];

  readonly notifications = signal<{ id: number; title: string; detail: string }[]>([]);

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
      default: return 0;
    }
  }

  markAllRead(): void {
    this.unreadCount.set(0);
    this.notifyOpen.set(false);
  }

  searchSubmit(): void {
    const kw = this.search().trim();
    if (kw) {
      this.router.navigate(['/search'], { queryParams: { q: kw } });
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
