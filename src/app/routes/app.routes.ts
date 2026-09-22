import { Routes } from '@angular/router';
import { PublicLayoutComponent, AdminLayoutComponent, AuthLayoutComponent } from '../layouts';
import { adminAuthGuard } from '../features/admin/services/admin-auth.guard';

export const routes: Routes = [
  // Public routes wrapped in PublicLayout
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
            data: {
              seo: {
                title: 'Ayra Cars | Buy and Sell Used Cars in Bangalore',
                description: 'Buy and sell verified used cars and bikes in Bangalore and across Karnataka with transparent prices and trusted listings.',
                keywords: 'used cars Bangalore, second hand cars Bangalore, used bikes Bangalore, buy used vehicles Karnataka, sell car Bangalore, Ayra Cars'
              }
            },
            loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES)
      },
      {
        path: 'home',
            redirectTo: '',
            pathMatch: 'full'
      },
      {
        path: 'cars',
            data: {
              seo: {
                title: 'Used Cars for Sale in Bangalore | Ayra Cars',
                description: 'Browse verified second hand cars for sale in Bangalore and Karnataka with transparent prices and trusted vehicle listings.',
                keywords: 'used cars for sale Bangalore, second hand cars Bangalore, pre owned cars Karnataka, buy used car Bangalore, Ayra Cars cars'
              }
            },
        loadChildren: () => import('@features/cars/cars.routes').then(m => m.CARS_ROUTES)
      },
      {
        path: 'bikes',
            data: {
              seo: {
                title: 'Used Bikes for Sale in Bangalore | Ayra Cars',
                description: 'Find inspected second hand bikes for sale in Bangalore and across Karnataka with clear pricing and trusted listings.',
                keywords: 'used bikes for sale Bangalore, second hand bikes Karnataka, pre owned bikes Bangalore, buy used bike, Ayra Cars bikes'
              }
            },
        loadChildren: () => import('@features/bikes/bikes.routes').then(m => m.BIKES_ROUTES)
      },
      {
        path: 'vehicles/:id',
        data: {
          seo: {
            title: 'Used Vehicle Details | Ayra Cars Bangalore',
            description: 'View verified used car and bike details, pricing and seller information for vehicles available in Bangalore and Karnataka.',
            keywords: 'used vehicle Bangalore, used car details, used bike details Karnataka, verified vehicles Ayra Cars'
          }
        },
        loadChildren: () => import('@features/vehicle-details/vehicle-details.routes').then(m => m.VEHICLE_DETAILS_ROUTES)
      },
      
      {
        path: 'compare',
        data: {
          seo: {
            title: 'Compare Used Cars and Bikes | Ayra Cars',
            description: 'Compare verified used cars and bikes in Bangalore and Karnataka by price, mileage, features and condition.',
            keywords: 'compare used cars Bangalore, compare used bikes, pre owned vehicle comparison, Ayra Cars'
          }
        },
        loadChildren: () => import('@features/compare/compare.routes').then(m => m.COMPARE_ROUTES)
      },
      {
        path: 'wishlist',
        loadChildren: () => import('@features/wishlist/wishlist.routes').then(m => m.WISHLIST_ROUTES)
      },
      {
        path: 'brands',
        data: {
          seo: {
            title: 'Car and Bike Brands in Bangalore | Ayra Cars',
            description: 'Explore popular car and bike brands with verified pre owned vehicles available for buyers across Bangalore and Karnataka.',
            keywords: 'car brands Bangalore, bike brands Karnataka, used vehicle brands, pre owned cars by brand, Ayra Cars'
          }
        },
        loadChildren: () => import('@features/brands/brands.routes').then(m => m.BRANDS_ROUTES)
      },
      {
        path: 'about',
        data: {
          seo: {
            title: 'About Ayra Cars | Trusted Used Vehicles in Karnataka',
            description: 'Learn how Ayra Cars helps buyers and sellers trade verified second hand cars and bikes across Bangalore and Karnataka.',
            keywords: 'about Ayra Cars, trusted used cars Bangalore, used vehicle marketplace Karnataka, buy sell cars Bangalore'
          }
        },
        loadChildren: () => import('@features/about/about.routes').then(m => m.ABOUT_ROUTES)
      },
      {
        path: 'contact',
        data: {
          seo: {
            title: 'Contact Ayra Cars | Used Cars and Bikes in Bangalore',
            description: 'Contact Ayra Cars for help buying or selling used cars and bikes in Bangalore and across Karnataka.',
            keywords: 'contact Ayra Cars, used car help Bangalore, sell used vehicle Karnataka, Ayra Cars support'
          }
        },
        loadChildren: () => import('@features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
      },
      {
        path: 'sell',
        data: {
          seo: {
            title: 'Sell Your Used Car or Bike in Bangalore | Ayra Cars',
            description: 'Sell your used car or bike in Bangalore and Karnataka with Ayra Cars. Get a fair offer, expert support and a simple selling process.',
            keywords: 'sell used car Bangalore, sell used bike Bangalore, sell car Karnataka, car valuation Bangalore, Ayra Cars sellers'
          }
        },
        loadChildren: () => import('@features/sell/sell.routes').then(m => m.SELL_ROUTES)
      },
      {
        path: 'blog',
        data: {
          seo: {
            title: 'Ayra Cars Blog | Used Car Buying Guides & Tips in Bangalore',
            description: 'Expert guides on buying, selling, financing and maintaining used cars and bikes in Bangalore and Karnataka — trusted advice from Ayra Cars.',
            keywords: 'used car blog Bangalore, car buying guide Karnataka, used bike tips, car loan EMI, car maintenance, Ayra Cars blog'
          }
        },
        loadChildren: () => import('@features/blog/blog.routes').then(m => m.BLOG_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('@features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'privacy',
        loadComponent: () => import('@features/common/pages/privacy/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'terms',
        loadComponent: () => import('@features/common/pages/terms/terms.component').then(m => m.TermsComponent)
      }
    ]
  },
  // Auth routes wrapped in AuthLayout
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Admin login (full-screen, outside the admin layout)
  {
    path: 'admin/login',
    loadComponent: () =>
      import('../features/admin/login/pages/admin-login.page').then(
        (m) => m.AdminLoginPageComponent
      )
  },
  // Admin routes wrapped in AdminLayout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    loadChildren: () => import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Fallback catch-all route
  {
    path: '**',
    redirectTo: ''
  }
];
