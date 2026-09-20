import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { LucideBadgeCheck, LucideChevronLeft, LucideChevronRight, LucideMaximize2, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [LucideBadgeCheck, LucideChevronLeft, LucideChevronRight, LucideX, LucideMaximize2],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss'
})
export class ImageGalleryComponent {
  readonly images = input.required<string[]>();
  readonly alt = input('');

  readonly activeIndex = signal(0);
  readonly fullscreen = signal(false);
  readonly zoomed = signal(false);

  /** Show at most 4 thumbnails, then the 5th slot becomes "+N View all" */
  readonly maxThumbs = 4;

  readonly visibleThumbs = computed(() => this.images().slice(0, this.maxThumbs));
  readonly remainingCount = computed(() => Math.max(0, this.images().length - this.maxThumbs));

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  readonly activeImage = () => this.images()[this.activeIndex()];

  prev(): void {
    this.activeIndex.update((i) => (i - 1 + this.images().length) % this.images().length);
  }

  next(): void {
    this.activeIndex.update((i) => (i + 1) % this.images().length);
  }

  selectIndex(index: number): void {
    this.activeIndex.set(index);
  }

  openFullscreen(): void {
    this.fullscreen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen(): void {
    this.fullscreen.set(false);
    this.zoomed.set(false);
    document.body.style.overflow = '';
  }
}
