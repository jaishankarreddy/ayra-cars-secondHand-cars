import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteNavbarComponent } from '../../ui/site-navbar/site-navbar.component';
import { TopMarqueeComponent } from '../../ui/top-marquee/top-marquee.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, SiteNavbarComponent, TopMarqueeComponent],
  template: `
    <app-top-marquee />
    <app-site-navbar />
    <router-outlet />
  `,
  styles: `
    :host { display: block; }
  `
})
export class PublicLayoutComponent {}
