import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

let toastId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(type: ToastType, title: string, message?: string, duration = 4500): number {
    const id = ++toastId;
    this.toasts.update((list) => [...list, { id, type, title, message }]);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration)
    );
    return id;
  }

  success(title: string, message?: string): number {
    return this.show('success', title, message);
  }

  error(title: string, message?: string): number {
    return this.show('error', title, message);
  }

  info(title: string, message?: string): number {
    return this.show('info', title, message);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  dismissAll(): void {
    for (const id of [...this.timers.keys()]) this.dismiss(id);
  }
}
