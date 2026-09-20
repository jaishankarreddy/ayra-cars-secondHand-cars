import { Routes } from '@angular/router';
import { BlogListPageComponent } from './pages/blog-list-page/blog-list-page.component';
import { BlogDetailsPageComponent } from './pages/blog-details-page/blog-details-page.component';

export const BLOG_ROUTES: Routes = [
  { path: '', component: BlogListPageComponent },
  { path: ':slug', component: BlogDetailsPageComponent },
];
