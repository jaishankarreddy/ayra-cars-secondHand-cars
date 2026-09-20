export type BikeFuel = 'Petrol' | 'Electric';
export type BikeBodyType =
  | 'Commuter'
  | 'Scooter'
  | 'Sport'
  | 'Street'
  | 'Cruiser'
  | 'Adventure'
  | 'Streetfighter'
  | 'Tourer'
  | 'Electric Scooter';

export interface Bike {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  /** Price in full Indian Rupees (e.g. 62000 = ₹62,000) */
  price: number;
  /** Engine displacement in cc. 0 for electric bikes. */
  engineCC: number;
  fuel: BikeFuel;
  abs: boolean;
  /** km/l for petrol bikes, km per full charge for electric bikes */
  mileage: number;
  /** Odometer reading in km */
  kilometers: number;
  /** District in Karnataka */
  district: string;
  owners: number;
  bodyType: BikeBodyType;
  color: string;
  image: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
}
