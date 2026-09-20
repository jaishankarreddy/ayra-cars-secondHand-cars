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
}

export interface BrandStat {
  brand: string;
  count: number;
}
