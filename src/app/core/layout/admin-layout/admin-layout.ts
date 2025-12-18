import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Truck, 
  Settings, 
  Plus,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
})
export class AdminLayoutComponent {

  layoutDashboard = LayoutDashboard;
  readonly shoppingCart = ShoppingCart;
  readonly users = Users;
  readonly truck = Truck
  readonly settings = Settings;
  readonly plus = Plus;
}
