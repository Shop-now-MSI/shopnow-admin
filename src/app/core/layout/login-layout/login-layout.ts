import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Mail, Users, CircleCheck, LogIn, Truck, MapPin, ShieldCheck, Loader, EyeOff, Eye, Key, Lock, User, CircleAlert, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service'; // Assure-toi que le chemin est correct vers auth.service.ts

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './login-layout.html',
  styleUrls: ['./login-layout.scss']
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  mail = Mail;
  users = Users;
  circleCheck = CircleCheck;
  logIn = LogIn;
  loader = Loader;
  loader2 = Loader;
  alertCircle = CircleAlert;
  helpCircle = CircleAlert;
  key = Key;
  eyeOff = EyeOff;
  eye = Eye;
  lock = Lock;
  user = User;
  truck = Truck;
  mapPin = MapPin;
  shieldCheck = ShieldCheck;

  constructor(private router: Router, private authService: AuthService) {}

  onEmailChange(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onPasswordChange(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  onRememberMeChange(event: Event): void {
    this.rememberMe.set((event.target as HTMLInputElement).checked);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage.set('Email ou mot de passe incorrect');
        setTimeout(() => {
           this.isLoading.set(false);
        }, 4000);
        alert(error)
      },
      
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}