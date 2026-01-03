import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout';
import { LoginComponent } from './core/layout/login-layout/login-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { CouriersList } from './features/couriers-list/couriers-list';
import { CourierForm } from './features/courier-form/courier-form';
import { OrderAssignment} from './features/order-assignment/order-assignment';
import { OrdersList } from './features/orders-list/orders-list';
import { CoursierDetails } from './features/coursier-details/coursier-details';
import { OrderTracking } from './features/order-tracking/order-tracking';
// app.routes.ts
import { authGuard } from '../app/services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'couriers-list', component: CouriersList },
      { path: 'courier-form', component: CourierForm },
      { path: 'coursier-details/:id', component: CoursierDetails },
      { path: 'courier-form/:id', component: CourierForm },
      { path: 'order-assignment/:id', component: OrderAssignment },
      { path: 'orders-list', component: OrdersList },
      { path: 'coursier-details', component: CoursierDetails },
      { path: 'order-tracking', component: OrderTracking },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
