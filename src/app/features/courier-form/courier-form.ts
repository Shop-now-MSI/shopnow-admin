import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, Upload, Save, X, ChevronLeft } from 'lucide-angular';

@Component({
  selector: 'app-courier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './courier-form.html',
  styleUrl: './courier-form.scss'
})
export class CourierForm {
  // Icônes
  readonly user = User;
  readonly upload = Upload;
  readonly save = Save;
  readonly x = X;
  readonly chevronLeft = ChevronLeft;
  // Signal pour l'aperçu de l'image
  previewUrl = signal<string | null>(null);

  // Signal pour l'objet coursier
  courier = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    vehicleType: '',
    zone: '',
    startDate: '',
    contractType: '',
    licensePlate: ''
  });

  // Gestion de l'upload photo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Création de l'URL pour la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveCourier() {
    console.log('Données du formulaire:', this.courier());
    // Logique d'appel API ici
    alert('Livreur enregistré (voir console)');
  }
}