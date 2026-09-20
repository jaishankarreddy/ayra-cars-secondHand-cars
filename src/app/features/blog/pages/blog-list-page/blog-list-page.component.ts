import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory, BlogPost } from '../../data/blog.data';

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [RouterLink, BlogCardComponent],
  templateUrl: './blog-list-page.component.html',
  styleUrl: './blog-list-page.component.scss',
})
export class BlogListPageComponent {
  readonly categories = BLOG_CATEGORIES;
  readonly allPosts = BLOG_POSTS;

  readonly activeCategory = signal<BlogCategory | 'All'>('All');
  readonly search = signal('');

  readonly filtered = computed<BlogPost[]>(() => {
    const cat = this.activeCategory();
    const q = this.search().toLowerCase().trim();
    return this.allPosts.filter((p) => {
      const catOk = cat === 'All' || p.category === cat;
      const qOk = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
      return catOk && qOk;
    });
  });

  readonly featured = computed(() => this.filtered().filter((p) => p.featured).slice(0, 3));
  readonly grid = computed(() => this.filtered().filter((p) => !p.featured || this.activeCategory() !== 'All' || this.search().trim() !== ''));

  onSearch(e: Event): void {
    this.search.set((e.target as HTMLInputElement).value);
  }

  setCategory(c: BlogCategory | 'All'): void {
    this.activeCategory.set(c);
  }
}
