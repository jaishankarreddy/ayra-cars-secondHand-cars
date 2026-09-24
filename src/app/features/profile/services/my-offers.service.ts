import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '@config/api';

export type MyOfferStatus = 'Pending' | 'Accepted' | 'Countered' | 'Rejected';

export interface MyOffer {
  id: string;
  vehicleId: string;
  vehicle: string;
  image: string;
  offerPrice: number;
  askingPrice: number | null;
  counterPrice: number | null;
  status: MyOfferStatus;
  date: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MyOffersService {
  private readonly http = inject(HttpClient);

  /** Logged-in user's offers with live status (auth token attached by interceptor). */
  list(): Observable<MyOffer[]> {
    return this.http.get<MyOffer[]>(`${API_BASE}/offers/mine`);
  }
}
