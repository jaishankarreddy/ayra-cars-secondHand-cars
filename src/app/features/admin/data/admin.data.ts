export type OfferStatus = 'Pending' | 'Accepted' | 'Countered' | 'Rejected';

export interface AdminOffer {
  id: string;
  vehicle: string;
  customer: string;
  phone: string;
  offerPrice: number;
  askingPrice: number;
  status: OfferStatus;
  date: string;
  rawDate?: string;
}

export type ContactStatus = 'New' | 'Replied';

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  date: string;
  rawDate?: string;
}

export interface AdminNotification {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

export type TestDriveStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface AdminTestDrive {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  status: TestDriveStatus;
  note: string;
  date: string;
  rawDate?: string;
}

export interface BrandStat {
  brand: string;
  count: number;
}

export type SellRequestStatus = 'New' | 'Contacted' | 'Closed';

export interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSellRequest {
  id: string;
  vehicleType: 'car' | 'bike';
  brand: string;
  model: string;
  year: number | null;
  kilometers: number | null;
  fuel: string;
  transmission: string;
  name: string;
  phone: string;
  district: string;
  expectedPrice: number | null;
  notes: string;
  images: string[];
  status: SellRequestStatus;
  date: string;
}
