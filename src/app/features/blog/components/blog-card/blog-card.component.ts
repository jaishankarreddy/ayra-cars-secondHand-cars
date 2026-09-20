import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogPost } from '../../data/blog.data';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <a [routerLink]="['/blog', post.slug]" class="am-card group flex flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
      <div class="relative aspect-[16/9] overflow-hidden bg-[var(--surface-2)]">
        <img [src]="post.cover" [alt]="post.title" loading="lazy" class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <span class="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#14272c] shadow-sm">{{ post.category }}</span>
        @if (post.featured) {
          <span class="absolute right-3 top-3 rounded-full bg-[#d7fa4c] px-3 py-1 text-[11px] font-bold text-[#14272c]">Featured</span>
        }
      </div>
      <div class="flex flex-1 flex-col p-5">
        <h3 class="line-clamp-2 font-heading text-[17px] font-semibold leading-tight text-[var(--text)] group-hover:text-[#14272c]">{{ post.title }}</h3>
        <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{{ post.excerpt }}</p>
        <div class="mt-4 flex items-center gap-3 border-t border-[var(--border)] pt-4">
          <img [src]="post.authorAvatar" [alt]="post.author" class="h-8 w-8 rounded-full object-cover" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-[var(--text)]">{{ post.author }}</p>
            <p class="text-[11px] text-[var(--text-muted)]">{{ post.date | date:'mediumDate' }} · {{ post.readMinutes }} min read</p>
          </div>
          <span class="shrink-0 rounded-full bg-[#14272c] px-3 py-1.5 text-xs font-semibold text-white">Read</span>
        </div>
      </div>
    </a>
  `,
})
export class BlogCardComponent {
  @Input({ required: true }) post!: BlogPost;
}
