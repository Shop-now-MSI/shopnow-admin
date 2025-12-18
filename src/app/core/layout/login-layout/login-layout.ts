import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Mail, Users, CircleCheck,  LogIn, Truck, MapPin, ShieldCheck, Loader, EyeOff, Eye, Key, Lock, User,  CircleAlert,  LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LucideAngularModule ],
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

  constructor(private router: Router) {}

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

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.login(this.email(), this.password());
      this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.errorMessage.set('Email ou mot de passe incorrect');
    } finally {
      this.isLoading.set(false);
    }
  }

  private login(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 4000);
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}