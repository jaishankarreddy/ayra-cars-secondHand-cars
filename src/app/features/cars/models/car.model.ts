export type CarFuel = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type CarTransmission = 'Manual' | 'Automatic';
export type CarBodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'MPV' | 'Crossover';
export type CarColor =
  | 'White'
  | 'Black'
  | 'Grey'
  | 'Silver'
  | 'Red'
  | 'Blue'
  | 'Green'
  | 'Orange';

export interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  /** Price in full Indian Rupees (e.g. 1680000 = ₹16,80,000) */
  price: number;
  fuel: CarFuel;
  transmission: CarTransmission;
  /** Mileage in km/l */
  mileage: number;
  /** Odometer reading in km */
  kilometers: number;
  /** District in Karnataka */
  district: string;
  owners: number;
  bodyType: CarBodyType;
  color: CarColor;
  image: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
}
