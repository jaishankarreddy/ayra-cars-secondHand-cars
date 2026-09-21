import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideScale, LucideX, LucideArrowRight, LucideCar, LucideBike } from '@lucide/angular';
import { CompareService } from '../../features/compare/services/compare.service';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [RouterLink, LucideScale, LucideX, LucideArrowRight, LucideCar, LucideBike],
  template: `
    @if (service.count() > 0 && isComparePage()) {
      <div class="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
        <div class="flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur">
          <span class="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <svg lucideScale class="h-4.5 w-4.5"></svg>
          </span>

          <div class="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            @for (v of service.vehicles(); track v.id) {
              <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 py-1 pl-2 pr-1 text-xs font-semibold text-text">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft">
                  @if (v.type === 'car') {
                    <svg lucideCar class="h-3 w-3 text-primary"></svg>
                  } @else {
                    <svg lucideBike class="h-3 w-3 text-primary"></svg>
                  }
                </span>
                {{ v.brand }} {{ v.model }}
                <button type="button" (click)="service.remove(v.id)" class="flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger" aria-label="Remove {{ v.brand }} {{ v.model }}">
                  <svg lucideX class="h-3 w-3"></svg>
                </button>
              </span>
            }
          </div>

          <a
            routerLink="/compare"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-primary transition-all duration-300 hover:bg-primary-hover"
          >
            Compare
            <svg lucideArrowRight class="h-3.5 w-3.5"></svg>
          </a>
        </div>
      </div>
    }
  `
})
export class CompareBarComponent {
  private readonly router = inject(Router);
  readonly service = inject(CompareService);

  isComparePage(): boolean {
    return this.router.url.startsWith('/compare');
  }
}
