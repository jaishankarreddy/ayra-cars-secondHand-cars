import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideCheck,
  LucideX,
  LucideSearch,
  LucideScale,
  LucideCar,
  LucideBike
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { PricePipe } from '../../home/pipes/price.pipe';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { CompareService, ComparableVehicle } from '../services/compare.service';

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    FooterComponent,
    PricePipe,
    RippleDirective,
    RevealDirective,
    LucidePlus,
    LucideCheck,
    LucideX,
    LucideSearch,
    LucideScale,
    LucideCar,
    LucideBike
  ],
  templateUrl: './compare.page.html',
  styleUrl: './compare.page.scss'
})
export class ComparePageComponent {
  readonly service = inject(CompareService);
  readonly pickerKeyword = signal('');
  readonly highlightDifferences = signal(false);
  readonly pickerSearching = signal(false);
  readonly serverResults = signal<ComparableVehicle[]>([]);
  readonly serverKey = signal('');

  private pickerSeq = 0;
  private pickerTimer: ReturnType<typeof setTimeout> | undefined;

  onPickerInput(value: string): void {
    this.pickerKeyword.set(value);
    clearTimeout(this.pickerTimer);
    const kw = value.trim().toLowerCase();
    if (!kw) {
      this.pickerSearching.set(false);
      this.serverResults.set([]);
      this.serverKey.set('');
      return;
    }
    this.pickerSearching.set(true);
    this.pickerTimer = setTimeout(async () => {
      const seq = ++this.pickerSeq;
      try {
        const res = await this.service.searchServer(kw);
        if (seq !== this.pickerSeq) return;
        this.serverResults.set(res);
        this.serverKey.set(kw);
      } finally {
        if (seq === this.pickerSeq) this.pickerSearching.set(false);
      }
    }, 350);
  }

  clearPicker(): void {
    clearTimeout(this.pickerTimer);
    this.pickerSeq++;
    this.pickerKeyword.set('');
    this.pickerSearching.set(false);
    this.serverResults.set([]);
    this.serverKey.set('');
  }

  readonly pickerList = computed(() => {
    const kw = this.pickerKeyword().trim().toLowerCase();
    if (!kw) return this.service.catalog();
    // Real server results once they arrive; instant local fallback while searching.
    if (this.serverKey() === kw) return this.serverResults();
    const list = this.service.catalog();
    return list.filter((v) =>
      `${v.brand} ${v.model} ${v.variant} ${v.type}`.toLowerCase().includes(kw)
    );
  });

  selected(id: string): boolean {
    return this.service.ids().includes(id);
  }

  isBest(v: ComparableVehicle): boolean {
    return this.service.vehicles().length > 1 && v.price === this.service.bestPrice();
  }

  isRowDifferent(field: keyof ComparableVehicle): boolean {
    if (!this.highlightDifferences()) return false;
    const vs = this.service.vehicles();
    if (vs.length < 2) return false;
    const first = String(vs[0][field] ?? '');
    return vs.some(v => String(v[field] ?? '') !== first);
  }
}
