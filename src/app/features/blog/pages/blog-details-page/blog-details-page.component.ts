import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BLOG_POSTS } from '../../data/blog.data';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';

@Component({
  selector: 'app-blog-details-page',
  standalone: true,
  imports: [RouterLink, DatePipe, BlogCardComponent],
  templateUrl: './blog-details-page.component.html',
  styleUrl: './blog-details-page.component.scss',
})
export class BlogDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  readonly slug = computed(() => this.route.snapshot.paramMap.get('slug') ?? '');
  readonly post = computed(() => BLOG_POSTS.find((p) => p.slug === this.slug()) ?? null);
  readonly related = computed(() => {
    const p = this.post();
    if (!p) return [];
    return BLOG_POSTS.filter((x) => x.id !== p.id && (x.category === p.category || x.tags.some((t) => p.tags.includes(t)))).slice(0, 3);
  });

  safeContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  shareUrl(): string {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }
}
