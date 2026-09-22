import { Component, inject } from '@angular/core';
import {
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideX,
  LucideShieldCheck
} from '@lucide/angular';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [LucideCheckCircle2, LucideAlertCircle, LucideX, LucideShieldCheck],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-[72px] z-[9999] flex flex-col items-center gap-3 px-3 sm:left-auto sm:right-6 sm:top-[76px] sm:items-end sm:px-0"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of service.toasts(); track toast.id) {
        <div
          class="am-toast pointer-events-auto relative flex w-full max-w-[420px] items-start gap-3.5 overflow-hidden rounded-[16px] border bg-white p-4 pr-3 shadow-[0_12px_40px_rgba(6,45,50,0.14),0_2px_8px_rgba(6,45,50,0.06)]"
          [class.border-[#D4EBCC]]="toast.type === 'success'"
          [class.border-[#FECACA]]="toast.type === 'error'"
          [class.border-[#E2E9E7]]="toast.type === 'info'"
        >
          <!-- Left accent bar -->
          <span
            class="absolute left-0 top-0 bottom-0 w-[4px]"
            [class.bg-[#15803D]]="toast.type === 'success'"
            [class.bg-[#DC2626]]="toast.type === 'error'"
            [class.bg-[#062D32]]="toast.type === 'info'"
            aria-hidden="true"
          ></span>

          <!-- Icon -->
          <span
            class="mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] border"
            [class.bg-[#ECFDF5]]="toast.type === 'success'"
            [class.border-[#D1FAE5]]="toast.type === 'success'"
            [class.text-[#15803D]]="toast.type === 'success'"
            [class.bg-[#FEF2F2]]="toast.type === 'error'"
            [class.border-[#FECACA]]="toast.type === 'error'"
            [class.text-[#DC2626]]="toast.type === 'error'"
            [class.bg-[#F0F7F2]]="toast.type === 'info'"
            [class.border-[#E2E9E7]]="toast.type === 'info'"
            [class.text-[#062D32]]="toast.type === 'info'"
          >
            @switch (toast.type) {
              @case ('success') { <svg lucideCheckCircle2 class="h-[22px] w-[22px]"></svg> }
              @case ('error') { <svg lucideAlertCircle class="h-[22px] w-[22px]"></svg> }
              @default { <svg lucideShieldCheck class="h-[22px] w-[22px]"></svg> }
            }
          </span>

          <!-- Content -->
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="font-['Poppins',sans-serif] text-[14px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0B1720]">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-1 font-['Inter',sans-serif] text-[13px] font-normal leading-[1.5] text-[#5F7078]">{{ toast.message }}</p>
            }
          </div>

          <!-- Close -->
          <button
            type="button"
            (click)="service.dismiss(toast.id)"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E2E9E7] bg-white text-[#8A969D] transition-colors hover:border-[#062D32] hover:text-[#062D32] hover:bg-[#F7FAF9]"
            aria-label="Dismiss notification"
          >
            <svg lucideX class="h-3.5 w-3.5"></svg>
          </button>

          <!-- Progress bar -->
          <span
            class="am-toast-progress absolute bottom-0 left-0 h-[3px]"
            [class.bg-[#15803D]]="toast.type === 'success'"
            [class.bg-[#DC2626]]="toast.type === 'error'"
            [class.bg-[#062D32]]="toast.type === 'info'"
            aria-hidden="true"
          ></span>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  readonly service = inject(ToastService);
}
