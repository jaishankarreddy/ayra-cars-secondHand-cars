import { Component, inject } from '@angular/core';
import {
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideInfo,
  LucideX
} from '@lucide/angular';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [LucideCheckCircle2, LucideAlertCircle, LucideInfo, LucideX],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-[52px] z-[9999] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of service.toasts(); track toast.id) {
        <div
          class="am-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border bg-surface p-4 shadow-lg"
          [class.border-success/30]="toast.type === 'success'"
          [class.border-danger/30]="toast.type === 'error'"
          [class.border-border]="toast.type === 'info'"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            [class.bg-success/10]="toast.type === 'success'"
            [class.text-success]="toast.type === 'success'"
            [class.bg-danger/10]="toast.type === 'error'"
            [class.text-danger]="toast.type === 'error'"
            [class.bg-primary-soft]="toast.type === 'info'"
            [class.text-primary]="toast.type === 'info'"
          >
            @switch (toast.type) {
              @case ('success') { <svg lucideCheckCircle2 class="h-4.5 w-4.5"></svg> }
              @case ('error') { <svg lucideAlertCircle class="h-4.5 w-4.5"></svg> }
              @default { <svg lucideInfo class="h-4.5 w-4.5"></svg> }
            }
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-text">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-0.5 text-xs leading-relaxed text-muted">{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            (click)="service.dismiss(toast.id)"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
            aria-label="Dismiss notification"
          >
            <svg lucideX class="h-3.5 w-3.5"></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  readonly service = inject(ToastService);
}
