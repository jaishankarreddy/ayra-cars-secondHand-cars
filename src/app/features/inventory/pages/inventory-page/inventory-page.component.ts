import { Component, DestroyRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideArrowRight,
  LucideBadgeCheck,
  LucideBike,
  LucideBookmark,
  LucideCalendarDays,
  LucideCarFront,
  LucideCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucideCog,
  LucideFuel,
  LucideGauge,
  LucideGrid2X2,
  LucideHeart,
  LucideList,
  LucideLoaderCircle,
  LucideMapPin,
  LucideScale,
  LucideSearch,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideX
} from '@lucide/angular';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';
import { CatalogVehicle } from '../../../../services/catalog.service';
import { InventoryFacets, InventoryService } from '../../services/inventory.service';
import { FooterComponent } from '../../../home/components/footer/footer.component';

export type VehicleType = 'Car' | 'Bike';
export type AbsOption = 'all' | 'With ABS' | 'Without ABS';

export interface ListingVehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  trim: string;
  price: number;
  location: string;
  year: number;
  km: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  owners: number;
  mileage: number;
  engineCc?: number;
  abs?: boolean;
  image: string;
  featured?: boolean;
  rating: string;
  emiFrom?: number;
  emiNote?: string;
}

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideBadgeCheck,
    LucideBike,
    LucideBookmark,
    LucideCalendarDays,
    LucideCarFront,
    LucideCheck,
    LucideChevronDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronUp,
    LucideCog,
    LucideFuel,
    LucideGauge,
    LucideGrid2X2,
    LucideHeart,
    LucideList,
    LucideLoaderCircle,
    LucideMapPin,
    LucideScale,
    LucideSearch,
    LucideShieldCheck,
    LucideSlidersHorizontal,
    LucideX
  ],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss'
})
export class InventoryPageComponent {
  private readonly inventory = inject(InventoryService);
  private readonly wishlistService = inject(WishlistService);
  private readonly compareService = inject(CompareService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly type = signal<VehicleType>(this.route.snapshot.data['type'] === 'bike' ? 'Bike' : 'Car');
  readonly sort = signal('Relevance');
  readonly search = signal('');
  readonly selectedLocation = signal('');
  readonly filtersOpen = signal(false);
  readonly view = signal<'grid' | 'list'>('grid');
  readonly pageSize = signal(12);
  readonly currentPage = signal(1);
  readonly savedSearchActive = signal(false);

  // ---- Accordion toggle states --------------------------------------------
  readonly priceExpanded = signal(true);
  readonly brandExpanded = signal(true);
  readonly modelExpanded = signal(true);
  readonly yearExpanded = signal(true);
  readonly fuelExpanded = signal(true);
  readonly transmissionExpanded = signal(true);
  readonly bodyTypeExpanded = signal(true);
  readonly ownershipExpanded = signal(true);
  readonly ccExpanded = signal(true);
  readonly absExpanded = signal(true);

  // ---- Filter state -------------------------------------------------------
  readonly selectedBrand = signal('');
  readonly selectedModel = signal('');
  readonly minYear = signal<number | null>(null);
  readonly maxYear = signal<number | null>(null);
  readonly selectedFuels = signal<string[]>([]);
  readonly selectedTransmissions = signal<string[]>([]);
  readonly selectedBodyTypes = signal<string[]>([]);
  readonly selectedOwners = signal<number[]>([]);
  readonly absOption = signal<AbsOption>('all');
  readonly priceMin = signal(0);
  readonly priceMax = signal(5000000);
  readonly ccMin = signal(100);
  readonly ccMax = signal(650);

  /** Debounced copy of `search` so typing does not hammer the API. */
  readonly debouncedSearch = signal('');

  // ---- Server state -------------------------------------------------------
  private readonly carFacets = signal<InventoryFacets | null>(null);
  private readonly bikeFacets = signal<InventoryFacets | null>(null);
  readonly results = signal<ListingVehicle[]>([]);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly loadingResults = signal(false);
  readonly loadError = signal<string | null>(null);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private requestSeq = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.route.url.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.syncFromRoute());
    this.loadFacets('car');
    this.loadFacets('bike');
    this.syncFromRoute();

    effect(() => {
      void this.queryKey();
      void this.fetchResults();
    });
  }

  // ---- Facets helpers -----------------------------------------------------
  readonly facets = computed(() =>
    this.type() === 'Bike' ? this.bikeFacets() : this.carFacets()
  );
  readonly carCount = computed(() => this.carFacets()?.count ?? 0);
  readonly bikeCount = computed(() => this.bikeFacets()?.count ?? 0);

  readonly maxPriceOfType = computed(() => this.facets()?.priceMax ?? 5000000);
  readonly maxCcOfType = computed(() => this.facets()?.engineCcMax ?? 650);

  readonly brands = computed(() => [...(this.facets()?.brands ?? [])].sort());
  readonly models = computed(() => {
    const all = [...(this.facets()?.models ?? [])].sort();
    return all;
  });

  readonly availableYears = computed(() => {
    const fYears = this.facets()?.years ?? [];
    if (fYears.length > 0) {
      return [...fYears].sort((a, b) => b - a);
    }
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 15; y--) list.push(y);
    return list;
  });

  readonly fuels = computed(() => {
    const available = this.facets()?.fuels ?? [];
    const defaults = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
    const set = new Set([...defaults, ...available]);
    return [...set];
  });

  readonly transmissions = computed(() => {
    return ['Automatic', 'Manual'];
  });

  readonly bodyTypes = computed(() => {
    if (this.type() === 'Bike') {
      return ['Sports', 'Cruiser', 'Commuter', 'Scooter', 'Adventure'];
    }
    return ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'];
  });

  readonly locations = computed(() => {
    const defaultLocs = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'];
    const serverLocs = this.facets()?.districts ?? [];
    const set = new Set([...defaultLocs, ...serverLocs]);
    return [...set].sort();
  });

  readonly ownerOptions = computed(() => [
    { label: 'First Owner', value: 1 },
    { label: 'Second Owner', value: 2 },
    { label: 'Third Owner', value: 3 }
  ]);

  // ---- Query construction -------------------------------------------------
  readonly queryKey = computed(() => {
    const type = this.type();
    return [
      type,
      this.sort(),
      this.debouncedSearch().trim(),
      this.selectedLocation(),
      this.selectedBrand(),
      this.selectedModel(),
      this.minYear() ?? '',
      this.maxYear() ?? '',
      this.selectedFuels().join(','),
      this.selectedTransmissions().join(','),
      this.selectedBodyTypes().join(','),
      this.selectedOwners().join(','),
      this.absOption(),
      `${this.priceMin()}-${this.priceMax()}`,
      this.pageSize(),
      this.currentPage(),
      type === 'Bike' ? `${this.ccMin()}-${this.ccMax()}` : ''
    ].join('|');
  });

  private buildParams(page: number): URLSearchParams {
    const p = new URLSearchParams();
    p.set('type', this.type() === 'Bike' ? 'bike' : 'car');
    p.set('page', String(page));
    p.set('limit', String(this.pageSize()));

    if (this.selectedBrand()) p.append('brand', this.selectedBrand());
    if (this.selectedModel()) p.append('model', this.selectedModel());
    if (this.minYear()) p.set('minYear', String(this.minYear()));
    if (this.maxYear()) p.set('maxYear', String(this.maxYear()));

    for (const f of this.selectedFuels()) p.append('fuel', f);
    for (const t of this.selectedTransmissions()) p.append('transmission', t);
    for (const b of this.selectedBodyTypes()) p.append('bodyType', b);
    for (const o of this.selectedOwners()) p.append('owners', String(o));

    const loc = this.selectedLocation();
    if (loc && loc !== 'All Locations') {
      p.append('district', loc);
    }

    const abs = this.absOption();
    if (abs === 'With ABS') p.set('abs', 'true');
    else if (abs === 'Without ABS') p.set('abs', 'false');

    if (this.priceMin() > 0) p.set('minPrice', String(this.priceMin()));
    if (this.priceMax() < 5000000) p.set('maxPrice', String(this.priceMax()));

    if (this.type() === 'Bike') {
      if (this.ccMin() > 100) p.set('engineCcMin', String(this.ccMin()));
      if (this.ccMax() < this.maxCcOfType()) p.set('engineCcMax', String(this.ccMax()));
    }

    const kw = this.debouncedSearch().trim();
    if (kw) p.set('q', kw);

    const sort = this.sortToApi(this.sort());
    if (sort) p.set('sortBy', sort);

    return p;
  }

  private sortToApi(sort: string): string {
    switch (sort) {
      case 'Price: Low to High':
      case 'Price: low to high':
        return 'price_asc';
      case 'Price: High to Low':
      case 'Price: high to low':
        return 'price_desc';
      case 'Newest First':
      case 'Newest first':
        return 'newest';
      default:
        return '';
    }
  }

  // ---- Fetching -----------------------------------------------------------
  private async fetchResults(): Promise<void> {
    const seq = ++this.requestSeq;
    const page = this.currentPage();
    const params = this.buildParams(page);

    this.loadingResults.set(true);
    this.loadError.set(null);

    try {
      const res = await this.inventory.fetchVehicles(params);
      if (seq !== this.requestSeq) return;
      const mapped = res.items.map((v) => this.toListing(v));
      this.results.set(mapped);
      this.total.set(res.total);
      this.totalPages.set(res.totalPages || 1);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      this.loadError.set(err instanceof Error ? err.message : 'Failed to load vehicles');
      this.results.set([]);
    } finally {
      if (seq === this.requestSeq) {
        this.loadingResults.set(false);
      }
    }
  }

  private toListing(v: CatalogVehicle): ListingVehicle {
    return {
      id: v.id,
      type: v.vehicleType === 'bike' ? 'Bike' : 'Car',
      brand: v.brand,
      model: v.model,
      trim: v.variant || `${v.brand} ${v.model}`,
      price: Number.isFinite(Number(v.price)) ? Number(v.price) : 0,
      location: v.district || v.location || 'Bengaluru',
      year: v.year,
      km: `${(v.kilometers ?? 0).toLocaleString('en-IN')} km`,
      fuel: v.fuel || 'Petrol',
      transmission: v.transmission || 'Manual',
      bodyType: v.bodyType || 'SUV',
      color: v.color || '',
      owners: v.owners || 1,
      mileage: v.mileage || 18,
      engineCc: v.engineCC,
      abs: v.abs,
      image: v.image || '/home_landing.png',
      featured: v.featured,
      rating: v.rating ? v.rating.toFixed(1) : '4.5',
      emiFrom: (v as unknown as { emiFrom?: number }).emiFrom || undefined,
      emiNote: (v as unknown as { emiNote?: string }).emiNote || undefined
    };
  }

  private routeSynced = false;

  // ---- Route sync ---------------------------------------------------------
  private syncFromRoute(): void {
    const snapshot = this.route.snapshot;
    const dataType = snapshot.data['type'];
    const qp = snapshot.queryParamMap;
    const qType = qp.get('type');
    const type: VehicleType =
      qType === 'bike' ? 'Bike' : qType === 'car' ? 'Car' : dataType === 'bike' ? 'Bike' : 'Car';
    this.type.set(type);

    const brand = qp.get('brand');
    this.selectedBrand.set(brand ? brand.toLowerCase() : '');
    this.selectedModel.set(qp.get('model') || '');

    const q = qp.get('q');
    if (q) {
      this.search.set(q);
      this.debouncedSearch.set(q);
    }

    this.currentPage.set(1);
    this.applyTypeDefaults();

    const bodyType = qp.get('bodyType');
    if (bodyType) {
      this.selectedBodyTypes.set([bodyType]);
    }

    const priceMin = qp.get('priceMin');
    const priceMax = qp.get('priceMax');
    if (priceMin) this.priceMin.set(+priceMin);
    if (priceMax) this.priceMax.set(+priceMax);

    // District comes from home "Shop by District" cards (?district=) or the
    // location dropdown (?location=) — both map to the API `district` param.
    const district = qp.get('district') || qp.get('location');
    if (district) this.selectedLocation.set(district);

    // Backward compat: home quick-search used to send `budget=0-5|5-10|...`
    if (!priceMin && !priceMax) {
      const range = this.budgetParamToRange(qp.get('budget'));
      if (range) {
        if (range.min > 0) this.priceMin.set(range.min);
        if (range.max < 5000000) this.priceMax.set(range.max);
      }
    }

    this.routeSynced = true;
  }

  private budgetParamToRange(budget: string | null): { min: number; max: number } | null {
    switch (budget) {
      case '0-5': return { min: 0, max: 500000 };
      case '5-10': return { min: 500000, max: 1000000 };
      case '10-15': return { min: 1000000, max: 1500000 };
      case '15-25': return { min: 1500000, max: 2500000 };
      case '25+': return { min: 2500000, max: 5000000 };
      default: return null;
    }
  }

  private loadFacets(type: 'car' | 'bike'): void {
    this.inventory.fetchFacets(type).then((f) => {
      if (type === 'bike') this.bikeFacets.set(f);
      else this.carFacets.set(f);
      if (!this.routeSynced && ((type === 'bike' && this.type() === 'Bike') || (type === 'car' && this.type() === 'Car'))) {
        this.applyTypeDefaults();
      }
    });
  }

  private applyTypeDefaults(): void {
    this.priceMin.set(0);
    this.priceMax.set(5000000);
    this.ccMin.set(100);
    this.ccMax.set(this.facets()?.engineCcMax ?? 650);
  }

  // ---- Filtering logic ----------------------------------------------------
  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedBrand()) count += 1;
    if (this.selectedModel()) count += 1;
    if (this.selectedLocation()) count += 1;
    if (this.minYear() || this.maxYear()) count += 1;
    if (this.selectedFuels().length) count += this.selectedFuels().length;
    if (this.selectedTransmissions().length) count += this.selectedTransmissions().length;
    if (this.selectedBodyTypes().length) count += this.selectedBodyTypes().length;
    if (this.selectedOwners().length) count += this.selectedOwners().length;
    if (this.priceMin() > 0 || this.priceMax() < 5000000) count += 1;
    if (this.debouncedSearch().trim()) count += 1;
    return count;
  });

  readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  /** Type-aware hero copy — /cars vs /bikes land differently. */
  readonly heroTitle = computed(() =>
    this.type() === 'Bike' ? 'Explore Used Bikes in Karnataka' : 'Explore Used Cars in Karnataka'
  );
  readonly heroSubtitle = computed(() =>
    this.type() === 'Bike'
      ? 'Mileage champions for city traffic — RTO-checked, inspected, ready for a free test drive.'
      : 'Family SUVs to city hatchbacks — RTO-checked, inspected, ready for a free test drive.'
  );

  /** Applied-filter pills with one-tap remove — core listing UX. */
  readonly activePills = computed<{ key: string; label: string }[]>(() => {
    const pills: { key: string; label: string }[] = [];
    if (this.debouncedSearch().trim()) pills.push({ key: 'q', label: `“${this.debouncedSearch().trim()}”` });
    if (this.selectedLocation()) pills.push({ key: 'location', label: this.selectedLocation() });
    if (this.selectedBrand()) pills.push({ key: 'brand', label: this.selectedBrand() });
    if (this.selectedModel()) pills.push({ key: 'model', label: this.selectedModel() });
    if (this.priceMin() > 0 || this.priceMax() < 5000000)
      pills.push({ key: 'price', label: `${this.formatPriceIn(this.priceMin())} – ${this.priceMax() >= 5000000 ? '₹50L+' : this.formatPriceIn(this.priceMax())}` });
    if (this.minYear() || this.maxYear())
      pills.push({ key: 'year', label: `${this.minYear() ?? 'Any'} – ${this.maxYear() ?? 'Any'}` });
    for (const f of this.selectedFuels()) pills.push({ key: `fuel:${f}`, label: f });
    for (const t of this.selectedTransmissions()) pills.push({ key: `trans:${t}`, label: t });
    for (const b of this.selectedBodyTypes()) pills.push({ key: `body:${b}`, label: b });
    for (const o of this.selectedOwners()) pills.push({ key: `owner:${o}`, label: o === 1 ? '1st Owner' : o === 2 ? '2nd Owner' : '3rd Owner' });
    return pills;
  });

  removePill(key: string): void {
    if (key === 'q') { this.search.set(''); this.debouncedSearch.set(''); }
    else if (key === 'location') this.selectedLocation.set('');
    else if (key === 'brand') { this.selectedBrand.set(''); this.selectedModel.set(''); }
    else if (key === 'model') this.selectedModel.set('');
    else if (key === 'price') { this.priceMin.set(0); this.priceMax.set(5000000); }
    else if (key === 'year') { this.minYear.set(null); this.maxYear.set(null); }
    else if (key.startsWith('fuel:')) this.toggleFuel(key.slice(5));
    else if (key.startsWith('trans:')) this.toggleTransmission(key.slice(6));
    else if (key.startsWith('body:')) this.toggleBodyType(key.slice(5));
    else if (key.startsWith('owner:')) this.toggleOwner(Number(key.slice(6)));
    else return;
    this.currentPage.set(1);
  }

  // ---- Pagination generation ----------------------------------------------
  readonly pageNumbers = computed<(number | string)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (current > 3) {
      pages.push('...');
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push('...');
    }
    pages.push(total);
    return pages;
  });

  // ---- Actions ------------------------------------------------------------
  changeType(nextType: VehicleType): void {
    if (nextType === this.type()) return;
    this.type.set(nextType);
    this.currentPage.set(1);
    this.selectedBrand.set('');
    this.selectedModel.set('');
    this.router.navigate([`/${nextType === 'Bike' ? 'bikes' : 'cars'}`]);
  }

  onSearchSubmit(): void {
    this.debouncedSearch.set(this.search().trim());
    this.currentPage.set(1);
  }

  setSearchValue(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.search.set(val);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.debouncedSearch.set(val);
      this.currentPage.set(1);
    }, 400);
  }

  setSortValue(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  setLocationValue(event: Event): void {
    this.selectedLocation.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  setPageSizeValue(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  goToPage(p: number | string): void {
    if (typeof p !== 'number' || p === this.currentPage() || p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  toggleIn<T>(sig: WritableSignal<T[]>, value: T): void {
    sig.update((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
    this.currentPage.set(1);
  }

  toggleFuel(fuel: string): void { this.toggleIn(this.selectedFuels, fuel); }
  toggleTransmission(trans: string): void { this.toggleIn(this.selectedTransmissions, trans); }
  toggleBodyType(body: string): void { this.toggleIn(this.selectedBodyTypes, body); }
  toggleOwner(owner: number): void { this.toggleIn(this.selectedOwners, owner); }

  isSelected(sig: WritableSignal<unknown[]>, value: unknown): boolean {
    return (sig() as unknown[]).includes(value);
  }

  setBrand(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedBrand.set(val);
    this.selectedModel.set('');
    this.currentPage.set(1);
  }

  setModel(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedModel.set(val);
    this.currentPage.set(1);
  }

  setMinYear(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.minYear.set(val ? Number(val) : null);
    this.currentPage.set(1);
  }

  setMaxYear(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.maxYear.set(val ? Number(val) : null);
    this.currentPage.set(1);
  }

  setPriceMax(event: Event): void {
    this.priceMax.set(Number((event.target as HTMLInputElement).value));
    this.currentPage.set(1);
  }

  setCcMinValue(event: Event): void {
    this.ccMin.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  setCcMaxValue(event: Event): void {
    this.ccMax.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  setAbsOptionValue(event: Event): void {
    this.absOption.set((event.target as HTMLSelectElement).value as AbsOption);
    this.currentPage.set(1);
  }

  readonly ccOptions = [100, 125, 150, 200, 250, 350, 500, 650];

  formatPrice(price: number): string {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${price.toLocaleString('en-IN')}`;
  }

  formatPriceIn(price: number): string {
    return `₹ ${price.toLocaleString('en-IN')}`;
  }

  formatEmi(price: number): string {
    if (!price || !Number.isFinite(price)) return '';
    const principal = price * 0.85;
    const r = 0.11 / 12;
    const n = 60;
    const pow = Math.pow(1 + r, n);
    const emi = (principal * r * pow) / (pow - 1);
    if (!Number.isFinite(emi)) return '';
    return `₹${Math.round(emi).toLocaleString('en-IN')}/m`;
  }

  toggleSave(id: string): void {
    this.wishlistService.toggle(id);
  }

  isSaved(id: string): boolean {
    return this.wishlistService.has(id);
  }

  toggleCompare(id: string): void {
    this.compareService.toggle(id);
  }

  isCompared(id: string): boolean {
    return this.compareService.ids().includes(id);
  }

  saveSearch(): void {
    this.savedSearchActive.set(true);
    setTimeout(() => this.savedSearchActive.set(false), 3000);
  }

  clearFilters(): void {
    this.selectedBrand.set('');
    this.selectedModel.set('');
    this.selectedLocation.set('');
    this.minYear.set(null);
    this.maxYear.set(null);
    this.selectedFuels.set([]);
    this.selectedTransmissions.set([]);
    this.selectedBodyTypes.set([]);
    this.selectedOwners.set([]);
    this.absOption.set('all');
    this.search.set('');
    this.debouncedSearch.set('');
    this.priceMin.set(0);
    this.priceMax.set(5000000);
    this.currentPage.set(1);
  }
}