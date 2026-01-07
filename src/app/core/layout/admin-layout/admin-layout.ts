import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Truck, 
  Settings, 
  Bell,
  User,
  LogOut,
  LucideAngularModule,
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
})
export class AdminLayoutComponent {
  // Profile popup state
  showProfilePopup = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleProfilePopup(event: MouseEvent) {
    event.stopPropagation();
    this.showProfilePopup.set(!this.showProfilePopup());
  }

  closeProfilePopup() {
    this.showProfilePopup.set(false);
  }

  goToProfile(event: MouseEvent) {
    event.stopPropagation();
    this.closeProfilePopup();
    this.router.navigate(['/admin/profile']);
  }

  logout(event: MouseEvent) {
    event.stopPropagation();
    this.authService.logout().subscribe({
      next: () => {
        // Redirection gérée par AuthService
      },
      error: (err) => {
        console.error('Error during logout:', err);
      }
    });
  }

  layoutDashboard = LayoutDashboard;
  readonly box = Box;
  readonly users = Users;
  readonly truck = Truck;
  readonly settings = Settings;
  readonly bell = Bell;
  readonly user = User;
  readonly logOut = LogOut;
}