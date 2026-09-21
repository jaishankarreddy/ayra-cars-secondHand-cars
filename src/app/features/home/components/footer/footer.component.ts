import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FOOTER_EXPLORE_LINKS,
  FOOTER_BUY_SELL_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
} from '../../data/home.data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly exploreLinks = FOOTER_EXPLORE_LINKS;
  readonly buySellLinks = FOOTER_BUY_SELL_LINKS;
  readonly companyLinks = FOOTER_COMPANY_LINKS;
  readonly legalLinks = FOOTER_LEGAL_LINKS;

  readonly year = new Date().getFullYear();
}
