import { Injectable } from '@angular/core';
import type { VehicleFormModel } from '../vehicles/components/vehicle-form-modal/vehicle-form-modal';

export interface VehicleDraft {
  form: VehicleFormModel;
  type: 'car' | 'bike';
  photos: { file: File; preview: string }[];
}

/**
 * In-memory draft for the Add Vehicle form.
 * Survives accidental modal closes (same page session only — a page refresh
 * or explicit Reset clears it). Never used for Edit mode.
 */
@Injectable({ providedIn: 'root' })
export class VehicleDraftService {
  private draft: VehicleDraft | null = null;

  save(form: VehicleFormModel, type: 'car' | 'bike', photos: { file: File; preview: string }[]): void {
    this.draft = { form: { ...form }, type, photos: [...photos] };
  }

  restore(): VehicleDraft | null {
    return this.draft;
  }

  clear(): void {
    this.draft = null;
  }

  hasDraft(): boolean {
    return this.draft !== null;
  }
}
