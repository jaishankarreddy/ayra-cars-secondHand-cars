import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { API_BASE } from '@config/api';
import {
  LucideUpload,
  LucideDownload,
  LucideCheck,
  LucideX,
  LucideLoaderCircle,
  LucideFileText,
  LucideImagePlus
} from '@lucide/angular';
import { RippleDirective } from '../../../../cars/directives/ripple.directive';
import { AdminService, VehicleFormPayload } from '../../../services/admin.service';
import { CatalogService } from '../../../../../services/catalog.service';
import { ToastService } from '../../../../../services/toast.service';
import { compressImage } from '../../../utils/image-compress.util';

type ExcelStatus = 'pending' | 'uploading' | 'done' | 'error';

interface ExcelPhoto {
  file: File;
  preview: string;
}

export interface ExcelRow {
  uid: number;
  code: string;
  vehicleType: 'car' | 'bike';
  brand: string;
  brandAuto: boolean;
  brandNew: boolean;
  model: string;
  variant: string;
  year: string;
  price: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  district: string;
  kilometers: string;
  owners: string;
  mileage: string;
  engineCC: string;
  abs: boolean;
  registration: string;
  description: string;
  photos: ExcelPhoto[];
  issues: string[];
  warnings: string[];
  status: ExcelStatus;
  error: string;
}

const TEMPLATE_HEADERS = [
  'Code', 'Type', 'Brand', 'Model', 'Variant', 'Year', 'Price', 'Fuel',
  'Transmission', 'BodyType', 'Color', 'District', 'Kilometers', 'Owners',
  'Mileage', 'EngineCC', 'ABS', 'Registration', 'Description'
];

const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'Electric'];
const CAR_BODY = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY = ['Commuter', 'Scooter', 'Sport', 'Street', 'Cruiser', 'Adventure', 'Streetfighter', 'Tourer', 'Electric Scooter'];
const DISTRICTS = [
  'Bengaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Mangaluru', 'Udupi',
  'Davanagere', 'Tumakuru', 'Kalaburagi', 'Shivamogga', 'Ballari', 'Dakshina Kannada'
];

/** Common spelling variants → canonical brand name. */
const BRAND_ALIASES: Record<string, string> = {
  maruti: 'Maruti Suzuki',
  marutisuzuki: 'Maruti Suzuki',
  vw: 'Volkswagen',
  volkswagen: 'Volkswagen',
  mg: 'MG',
  morrisgarage: 'MG',
  re: 'Royal Enfield',
  royalenfield: 'Royal Enfield',
  benz: 'Mercedes-Benz',
  mercedes: 'Mercedes-Benz',
  mercedesbenz: 'Mercedes-Benz',
  ktm: 'KTM',
  tvs: 'TVS',
  hero: 'Hero',
  heromotocorp: 'Hero',
  bajaj: 'Bajaj',
  honda: 'Honda',
  yamaha: 'Yamaha',
  suzuki: 'Suzuki',
  tata: 'Tata',
  mahindra: 'Mahindra',
  hyundai: 'Hyundai',
  toyota: 'Toyota',
  kia: 'Kia',
  skoda: 'Skoda'
};

const BIKE_HINTS = ['bike', 'bikes', 'scooter', 'scooty', '2w', 'twowheeler', 'two-wheeler', 'motorcycle'];

let excelUid = 0;

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function titleCase(s: string): string {
  return s.trim().replace(/\s+/g, ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [
    RippleDirective,
    LucideUpload,
    LucideDownload,
    LucideCheck,
    LucideX,
    LucideLoaderCircle,
    LucideFileText,
    LucideImagePlus
  ],
  templateUrl: './excel-import.component.html',
  styleUrl: './excel-import.component.scss'
})
export class ExcelImportComponent {
  private readonly http = inject(HttpClient);
  private readonly service = inject(AdminService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly rows = signal<ExcelRow[]>([]);
  readonly fileName = signal('');
  readonly zipName = signal('');
  readonly parsing = signal(false);
  readonly importing = signal(false);
  readonly importedCount = signal(0);

  private brandMap = new Map<string, string>();

  readonly validCount = computed(() => this.rows().filter((r) => !r.issues.length && r.status !== 'done').length);
  readonly errorCount = computed(() => this.rows().filter((r) => r.issues.length > 0).length);
  readonly doneCount = computed(() => this.rows().filter((r) => r.status === 'done').length);

  constructor() {
    this.http.get<{ name: string }[]>(`${API_BASE}/brands`).subscribe({
      next: (list) => {
        for (const b of list ?? []) {
          if (b?.name) this.brandMap.set(norm(b.name), b.name);
        }
      },
      error: () => undefined
    });
    this.service.fetchFacets('car').subscribe({
      next: (res) => {
        for (const b of res.brands ?? []) {
          const proper = b.charAt(0).toUpperCase() + b.slice(1);
          if (!this.brandMap.has(norm(b))) this.brandMap.set(norm(b), proper);
        }
      },
      error: () => undefined
    });
    this.service.fetchFacets('bike').subscribe({
      next: (res) => {
        for (const b of res.brands ?? []) {
          const proper = b.charAt(0).toUpperCase() + b.slice(1);
          if (!this.brandMap.has(norm(b))) this.brandMap.set(norm(b), proper);
        }
      },
      error: () => undefined
    });
  }

  downloadTemplate(): void {
    const example = [
      ['V1', 'car', 'Honda', 'City', 'VX CVT', 2021, 750000, 'Petrol', 'Automatic', 'Sedan', 'White', 'Bengaluru', 42000, 1, 18, 1498, 'Yes', 'KA-05-AB-1234', 'Single owner, serviced regularly'],
      ['V2', 'bike', 'Royal Enfield', 'Classic 350', '', 2022, 185000, 'Petrol', 'Manual', 'Cruiser', 'Black', 'Mysuru', 12000, 1, 35, 349, '', 'KA-11-C-5678', '']
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...example]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 16 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
    const help = [
      ['How to use this template'],
      ['1. One vehicle per row. Do not change the header names.'],
      ['2. Code (V1, V2…) links photos: name ZIP photos like V1_front.jpg, V1_side.jpg.'],
      ['3. Required columns: Brand, Model, Year, Price.'],
      ['4. Type: car or bike (default car). Year e.g. 2021. Price in rupees.'],
      ['5. Brands are matched automatically (maruti → Maruti Suzuki, re → Royal Enfield). Unknown brands are added as-is.'],
      ['6. Keep each vehicle to max 10 photos. First photo alphabetically becomes the cover.'],
      ['7. Upload the Excel file below, optionally add a ZIP of photos, review, then Import.']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(help), 'ReadMe');
    XLSX.writeFile(wb, 'ayra-bulk-template.xlsx');
  }

  async onExcelPicked(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.parsing.set(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
      if (grid.length < 2) {
        this.toast.error('Empty file', 'Add at least one vehicle row below the headers.');
        this.parsing.set(false);
        return;
      }
      const headers = grid[0].map((h) => norm(String(h)));
      this.setColCache(headers);
      const cell = (row: unknown[], i: number): string => (i < 0 ? '' : String(row[i] ?? '').trim());
      const parsed: ExcelRow[] = [];
      grid.slice(1).forEach((row, r) => {
        if (!row.some((c) => String(c ?? '').trim())) return;
        parsed.push(this.mapRow(cell, row, r));
      });
      this.rows.set(parsed);
      this.fileName.set(file.name);
      this.zipName.set('');
      this.importedCount.set(0);
      const bad = parsed.filter((p) => p.issues.length).length;
      this.toast.info('Excel parsed', `${parsed.length} vehicle(s) found${bad ? `, ${bad} need fixes` : ''}.`);
    } catch {
      this.toast.error('Could not read file', 'Please upload a valid .xlsx file.');
    }
    this.parsing.set(false);
  }

  private mapRow(cell: (row: unknown[], i: number) => string, row: unknown[], r: number): ExcelRow {
    const c = this.colCache;
    const get = (key: string): string => cell(row, c[key] ?? -1);
    const rawBrand = get('brand');
    const matched = this.matchBrand(rawBrand);
    const rawType = get('type');
    const vehicleType: 'car' | 'bike' = BIKE_HINTS.includes(norm(rawType)) ? 'bike' : 'car';
    const fuel = this.matchEnum(get('fuel'), FUELS, 'Petrol', 'Fuel');
    const transmission = this.matchEnum(get('transmission'), TRANSMISSIONS, 'Manual', 'Transmission');
    const bodyList = vehicleType === 'car' ? CAR_BODY : BIKE_BODY;
    const bodyType = this.matchEnum(get('body'), bodyList, '', 'Body type');
    const district = this.matchEnum(get('district'), DISTRICTS, 'Bengaluru', 'District');
    const issues: string[] = [];
    const warnings: string[] = [];
    if (!rawBrand) issues.push('Brand is required.');
    if (!get('model')) issues.push('Model is required.');
    const yearNum = parseInt(get('year'), 10);
    const thisYear = new Date().getFullYear();
    if (!yearNum || yearNum < 1990 || yearNum > thisYear + 1) issues.push('Year must be 1990–' + (thisYear + 1) + '.');
    const priceNum = parseFloat(get('price'));
    if (!priceNum || priceNum <= 0) issues.push('Price must be a number above 0.');
    if (matched.isNew && rawBrand) warnings.push(`New brand "${matched.name}" — will be added as-is.`);
    if (matched.auto) warnings.push(`Brand auto-matched to "${matched.name}".`);
    for (const w of [fuel.warn, transmission.warn, bodyType.warn, district.warn]) {
      if (w) warnings.push(w);
    }
    if (rawType && !BIKE_HINTS.includes(norm(rawType)) && norm(rawType) !== 'car' && norm(rawType) !== 'cars') {
      warnings.push(`Type "${get('type')}" not recognised — treated as car.`);
    }
    return {
      uid: ++excelUid,
      code: get('code') || `ROW${r + 1}`,
      vehicleType,
      brand: matched.name,
      brandAuto: matched.auto,
      brandNew: matched.isNew,
      model: get('model'),
      variant: get('variant'),
      year: get('year'),
      price: get('price'),
      fuel: fuel.value,
      transmission: transmission.value,
      bodyType: bodyType.value,
      color: titleCase(get('color') || 'White'),
      district: district.value,
      kilometers: get('km'),
      owners: get('owners') || '1',
      mileage: get('mileage'),
      engineCC: get('cc'),
      abs: ['yes', 'true', '1', 'y'].includes(norm(get('abs'))),
      registration: get('reg'),
      description: get('desc'),
      photos: [],
      issues,
      warnings,
      status: 'pending',
      error: ''
    };
  }

  private matchBrand(raw: string): { name: string; auto: boolean; isNew: boolean } {
    if (!raw.trim()) return { name: '', auto: false, isNew: false };
    const key = norm(raw);
    const known = this.brandMap.get(key);
    if (known) return { name: known, auto: known.toLowerCase() !== raw.trim().toLowerCase(), isNew: false };
    const alias = BRAND_ALIASES[key];
    if (alias) return { name: alias, auto: true, isNew: !this.brandMap.has(norm(alias)) };
    return { name: titleCase(raw), auto: false, isNew: true };
  }

  private matchEnum(raw: string, list: string[], fallback: string, label: string): { value: string; warn: string } {
    if (!raw.trim()) return { value: fallback, warn: '' };
    const hit = list.find((v) => norm(v) === norm(raw));
    if (hit) return { value: hit, warn: '' };
    return { value: fallback, warn: `${label} "${raw}" not recognised — using ${fallback || 'blank'}.` };
  }

  private colCache: Record<string, number> = {};

  private setColCache(headers: string[]): void {
    const idx = (names: string[]): number => {
      for (const n of names) {
        const i = headers.indexOf(norm(n));
        if (i >= 0) return i;
      }
      return -1;
    };
    this.colCache = {
      code: idx(['code', 'ref', 'id']),
      type: idx(['type', 'vehicletype', 'category']),
      brand: idx(['brand', 'make']),
      model: idx(['model']),
      variant: idx(['variant', 'trim']),
      year: idx(['year', 'mfgyear', 'modelyear']),
      price: idx(['price', 'expectedprice', 'amount']),
      fuel: idx(['fuel', 'fueltype']),
      transmission: idx(['transmission', 'gearbox']),
      body: idx(['bodytype', 'body', 'segment']),
      color: idx(['color', 'colour']),
      district: idx(['district', 'city', 'location']),
      km: idx(['kilometers', 'km', 'kms', 'kmdriven', 'odometer']),
      owners: idx(['owners', 'owner']),
      mileage: idx(['mileage', 'average']),
      cc: idx(['enginecc', 'engine', 'cc', 'displacement']),
      abs: idx(['abs']),
      reg: idx(['registration', 'reg', 'regno', 'number']),
      desc: idx(['description', 'desc', 'notes', 'remarks'])
    };
  }

  async onZipPicked(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.rows().length) return;
    this.parsing.set(true);
    try {
      const zipMod = await import('jszip');
      const ZipCtor = (zipMod as unknown as { default?: unknown }).default ?? zipMod;
      const zip = new (ZipCtor as new () => {
        loadAsync(d: ArrayBuffer): Promise<{ file(p: string): { async(t: string): Promise<Blob> } | null; files: Record<string, { dir: boolean; name: string }> }>;
      })();
      const loaded = await zip.loadAsync(await file.arrayBuffer());
      const names = Object.keys(loaded.files).filter(
        (n) => !loaded.files[n].dir && /\.(jpe?g|png|webp)$/i.test(n)
      );
      const byCode = new Map<string, string[]>();
      for (const n of names) {
        const base = n.split('/').pop() ?? n;
        const token = base.replace(/\.[^.]+$/, '').split(/[_.\-\s]+/)[0].toUpperCase();
        if (!byCode.has(token)) byCode.set(token, []);
        byCode.get(token)?.push(n);
      }
      let matched = 0;
      const updated = [...this.rows()];
      for (const row of updated) {
        const hits = (byCode.get(row.code.toUpperCase()) ?? []).sort().slice(0, 10);
        row.photos.forEach((p) => URL.revokeObjectURL(p.preview));
        row.photos = [];
        for (const h of hits) {
          const entry = loaded.file(h);
          if (!entry) continue;
          const blob = await entry.async('blob');
          try {
            const compressed = await compressImage(blob);
            row.photos.push({ file: compressed, preview: URL.createObjectURL(compressed) });
            matched++;
          } catch {
            continue;
          }
        }
        if (!hits.length) {
          if (!row.warnings.includes('No photos matched in the ZIP.')) {
            row.warnings.push('No photos matched in the ZIP.');
          }
        }
      }
      this.rows.set(updated);
      this.zipName.set(file.name);
      this.toast.info('ZIP matched', `${matched} photo(s) linked to ${updated.filter((r) => r.photos.length).length} vehicle(s).`);
    } catch {
      this.toast.error('Could not read ZIP', 'Please upload a valid .zip of images.');
    }
    this.parsing.set(false);
  }

  setBrand(uid: number, value: string): void {
    this.rows.update((list) =>
      list.map((r) => {
        if (r.uid !== uid) return r;
        const issues = r.issues.filter((i) => i !== 'Brand is required.');
        if (!value.trim()) issues.push('Brand is required.');
        return { ...r, brand: value, brandAuto: false, brandNew: !this.brandMap.has(norm(value)), issues, status: 'pending' as ExcelStatus, error: '' };
      })
    );
  }

  removeRow(uid: number): void {
    this.rows.update((list) => {
      const target = list.find((r) => r.uid === uid);
      target?.photos.forEach((p) => URL.revokeObjectURL(p.preview));
      return list.filter((r) => r.uid !== uid);
    });
  }

  clearAll(): void {
    this.rows().forEach((r) => r.photos.forEach((p) => URL.revokeObjectURL(p.preview)));
    this.rows.set([]);
    this.fileName.set('');
    this.zipName.set('');
    this.importedCount.set(0);
  }

  private toPayload(r: ExcelRow): VehicleFormPayload {
    return {
      vehicleType: r.vehicleType,
      brand: r.brand.trim(),
      model: r.model.trim(),
      variant: r.variant.trim(),
      year: parseInt(r.year, 10) || 0,
      price: parseFloat(r.price) || 0,
      fuel: r.fuel,
      transmission: r.transmission,
      mileage: parseFloat(r.mileage) || 0,
      kilometers: parseInt(r.kilometers, 10) || 0,
      district: r.district,
      location: '',
      owners: parseInt(r.owners, 10) || 1,
      bodyType: r.bodyType,
      color: r.color,
      engineCC: parseInt(r.engineCC, 10) || 0,
      abs: r.abs,
      engine: '',
      power: '',
      registration: r.registration.trim(),
      insurance: '',
      featured: false,
      availability: 'available',
      rating: 4,
      description: r.description,
      images: r.photos.map((p) => p.file)
    };
  }

  async importAll(): Promise<void> {
    if (this.importing()) return;
    const queue = this.rows().filter((r) => r.status !== 'done');
    const blocked = queue.filter((r) => r.issues.length > 0);
    if (!queue.length) return;
    if (blocked.length && queue.length === blocked.length) {
      this.toast.error('Nothing to import', 'Fix the flagged rows first.');
      return;
    }
    this.importing.set(true);
    this.importedCount.set(this.doneCount());
    let ok = 0;
    let failed = 0;
    for (const r of queue) {
      if (r.issues.length) continue;
      this.rows.update((list) => list.map((x) => (x.uid === r.uid ? { ...x, status: 'uploading' as ExcelStatus, error: '' } : x)));
      try {
        await firstValueFrom(this.service.create(this.toPayload(r)));
        ok++;
        this.importedCount.update((n) => n + 1);
        this.rows.update((list) => list.map((x) => (x.uid === r.uid ? { ...x, status: 'done' as ExcelStatus } : x)));
      } catch (err: unknown) {
        failed++;
        const message = err instanceof HttpErrorResponse ? (err.error?.message || err.message) : 'Upload failed.';
        this.rows.update((list) => list.map((x) => (x.uid === r.uid ? { ...x, status: 'error' as ExcelStatus, error: message } : x)));
      }
    }
    this.importing.set(false);
    this.catalog.refresh();
    if (failed === 0) {
      this.toast.success('Import complete', `${ok} vehicle(s) are now live.`);
    } else {
      this.toast.error('Import finished with errors', `${ok} live, ${failed} failed.`);
    }
  }
}
