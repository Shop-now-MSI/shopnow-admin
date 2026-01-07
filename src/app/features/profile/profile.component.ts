import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, AdminProfile } from '../../services/profile.service';
import { LucideAngularModule, User, Mail, Phone, Lock, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  // Icons
  readonly userIcon = User;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly lockIcon = Lock;
  readonly saveIcon = Save;
  readonly arrowLeftIcon = ArrowLeft;

  profileForm!: FormGroup;
  adminProfile = signal<AdminProfile | null>(null);
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  showPasswordFields = signal(false);

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''],
      password_confirmation: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmation = form.get('password_confirmation')?.value;
    
    if (password && confirmation && password !== confirmation) {
      return { passwordMismatch: true };
    }
    return null;
  }

  loadProfile() {
    this.loading.set(true);
    this.profileService.getAdminProfile().subscribe({
      next: (response: any) => {
        // Laravel renvoie généralement { user: {...} } ou directement l'objet user
        const userData = response.user || response;
        this.adminProfile.set(userData);
        this.profileForm.patchValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || ''
        });
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.errorMessage.set('Impossible de charger le profil');
        this.loading.set(false);
      }
    });
  }

  togglePasswordFields() {
    this.showPasswordFields.set(!this.showPasswordFields());
    if (!this.showPasswordFields()) {
      this.profileForm.patchValue({
        password: '',
        password_confirmation: ''
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formData = { ...this.profileForm.value };
    
    // Ne pas envoyer les champs de mot de passe s'ils sont vides
    if (!formData.password) {
      delete formData.password;
      delete formData.password_confirmation;
    }

    this.profileService.updateProfile(formData).subscribe({
      next: (response) => {
        this.successMessage.set('Profil mis à jour avec succès !');
        this.loading.set(false);
        
        // Réinitialiser les champs de mot de passe
        this.profileForm.patchValue({
          password: '',
          password_confirmation: ''
        });
        this.showPasswordFields.set(false);

        // Recharger le profil
        setTimeout(() => {
          this.loadProfile();
          this.successMessage.set(null);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.errorMessage.set(
          error.error?.message || 'Erreur lors de la mise à jour du profil'
        );
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (fieldName === 'password_confirmation' && this.profileForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}