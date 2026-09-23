import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/pages/dashboard.page').then((m) => m.AdminDashboardPageComponent)
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./vehicles/pages/vehicles.page').then((m) => m.AdminVehiclesPageComponent)
  },
  {
    path: 'bulk-upload',
    loadComponent: () =>
      import('./bulk-upload/pages/bulk-upload.page').then((m) => m.AdminBulkUploadPageComponent)
  },
  {
    path: 'cars',
    loadComponent: () =>
      import('./cars/pages/admin-cars.page').then((m) => m.AdminCarsPageComponent)
  },
  {
    path: 'bikes',
    loadComponent: () =>
      import('./bikes/pages/admin-bikes.page').then((m) => m.AdminBikesPageComponent)
  },
  {
    path: 'offers',
    loadComponent: () =>
      import('./offers/pages/offers.page').then((m) => m.AdminOffersPageComponent)
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./contacts/pages/contacts.page').then((m) => m.AdminContactsPageComponent)
  },
  {
    path: 'test-drives',
    loadComponent: () =>
      import('./test-drives/pages/test-drives.page').then((m) => m.AdminTestDrivesPageComponent)
  },
  {
    path: 'sell-requests',
    loadComponent: () =>
      import('./sell-requests/pages/sell-requests.page').then((m) => m.AdminSellRequestsPageComponent)
  },
  {
    path: 'admins',
    loadComponent: () =>
      import('./admins/pages/admins.page').then((m) => m.AdminAdminsPageComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/pages/settings.page').then((m) => m.AdminSettingsPageComponent)
  }
];