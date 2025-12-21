import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Truck, 
  Settings, 
  Bell,
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
  readonly box = Box;
  readonly users = Users;
  readonly truck = Truck
  readonly settings = Settings;
  readonly bell = Bell;
}
