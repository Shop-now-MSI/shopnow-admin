import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout';
import { LoginComponent } from './core/layout/login-layout/login-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { CouriersList } from './features/couriers-list/couriers-list';
import { CourierForm } from './features/courier-form/courier-form';
import { OrderAssignment} from './features/order-assignment/order-assignment';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'couriers-list', component: CouriersList },
      { path: 'courier-form', component: CourierForm },
      { path: 'order-assignment', component: OrderAssignment },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
