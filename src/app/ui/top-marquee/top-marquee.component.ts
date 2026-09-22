import { Component } from '@angular/core';

@Component({
  selector: 'app-top-marquee',
  standalone: true,
  template: `
    <div class="top-bar">
      <div class="marquee-track">
        <span class="marquee-content">
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6" />
            </svg>
            Fixed Price — No Haggling
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5l7 7-7 7" />
            </svg>
            Pay After Sale — Consignment
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Free inspection across Karnataka
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            200+ Point Quality Check
          </span>
          <span class="divider">|</span>
        </span>
        <span class="marquee-content" aria-hidden="true">
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6" />
            </svg>
            Fixed Price — No Haggling
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5l7 7-7 7" />
            </svg>
            Pay After Sale — Consignment
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Free inspection across Karnataka
          </span>
          <span class="divider">|</span>
          <span class="marquee-item">
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            200+ Point Quality Check
          </span>
          <span class="divider">|</span>
        </span>
      </div>
    </div>
  `,
  styles: [`
    .top-bar {
      position: relative;
      left: 0;
      right: 0;
      top: 0;
      z-index: 1001;
      height: 36px;
      overflow: hidden;
      background: linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%);
    }

    .marquee-track {
      display: flex;
      animation: marquee 30s linear infinite;
      height: 100%;
      width: max-content;
      align-items: center;
    }

    .marquee-content {
      display: flex;
      align-items: center;
      gap: 40px;
      padding: 0 20px;
      flex-shrink: 0;
    }

    .marquee-item {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 600;
      color: #e8ede9;
    }

    .icon {
      height: 14px;
      width: 14px;
      color: #caff38;
      flex-shrink: 0;
    }

    .divider {
      color: rgba(255, 255, 255, 0.15);
      font-size: 12px;
    }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `]
})
export class TopMarqueeComponent {}
