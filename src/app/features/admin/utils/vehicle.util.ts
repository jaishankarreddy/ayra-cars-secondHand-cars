import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';

export interface AdminVehicle {
  id: string;
  type: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  price: number;
  fuel: string;
  transmission: string;
  engine: string;
  mileage: string;
  year: number;
  kilometers: number;
  district: string;
  owners: number;
  color: string;
  bodyType: string;
  abs: 'Yes' | 'No' | '—';
  image: string;
  images?: string[];
  status: 'Available' | 'Sold';
  rating?: number;
}

const SOLD_IDS = new Set(['c2', 'c8', 'c5', 'b7', 'b2']);

export function toAdminVehicle(v: Car | Bike): AdminVehicle {
  if ('transmission' in v) {
    const c = v as Car;
    return {
      id: c.id,
      type: 'car',
      brand: c.brand,
      model: c.model,
      variant: c.variant,
      price: c.price,
      fuel: c.fuel,
      transmission: c.transmission,
      engine: '—',
      mileage: `${c.mileage} km/l`,
      year: c.year,
      kilometers: c.kilometers,
      district: c.district,
      owners: c.owners,
      color: c.color,
      bodyType: c.bodyType,
      abs: '—',
      image: c.image,
      images: c.images,
      status: SOLD_IDS.has(c.id) ? 'Sold' : 'Available',
      rating: c.rating
    };
  }
  const b = v as Bike;
  return {
    id: b.id,
    type: 'bike',
    brand: b.brand,
    model: b.model,
    variant: b.variant,
    price: b.price,
    fuel: b.fuel,
    transmission: b.engineCC === 0 ? 'Electric' : 'Manual',
    engine: b.engineCC > 0 ? `${b.engineCC} cc` : 'Electric',
    mileage: b.fuel === 'Electric' ? `${b.mileage} km/charge` : `${b.mileage} km/l`,
    year: b.year,
    kilometers: b.kilometers,
    district: b.district,
    owners: b.owners,
    color: b.color,
    bodyType: b.bodyType,
    abs: b.abs ? 'Yes' : 'No',
    image: b.image,
    images: b.images,
    status: SOLD_IDS.has(b.id) ? 'Sold' : 'Available',
    rating: b.rating
  };
}
