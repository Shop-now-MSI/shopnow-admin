import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, User, Upload, Save, X, ChevronLeft } from 'lucide-angular';
import { LivreurService } from '../../services/livreur.service';
import { CreateLivreurRequest, UpdateLivreurRequest, Livreur } from '../../shared/interfaces/livreur.interface';
import e from 'express';

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
    password: '', // Ajouté pour la création
    phone: '',
    dob: '',
    vehicleType: '',
    zone: '',
    startDate: '', // Non utilisé dans le backend, mais conservé
    contractType: '',
    licensePlate: ''
  });

  // Fichier photo sélectionné
  selectedPhoto: File | null = null;

  // ID pour mode édition
  private id: number | null = null;
  public edit = signal(false);

  // Loading et erreur
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private livreurService: LivreurService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    if (this.id) {
      this.edit.set(true);
      this.loadLivreur(this.id);
    }
  }

  private loadLivreur(id: number) {
    this.isLoading.set(true);
    this.livreurService.getById(id).subscribe({
      next: (livreur: Livreur) => {
        this.courier.set({
          firstName: livreur.firstname,
          lastName: livreur.name,
          email: livreur.user.email,
          password: "", // Non chargé pour édition
          phone: livreur.tel,
          dob: livreur.dateNaissance,
          vehicleType: livreur.typeVehicule,
          zone: livreur.zoneActivite,
          startDate: '', // Non présent, laisser vide
          contractType: livreur.typeContrat,
          licensePlate: livreur.matricule
        });
        this.previewUrl.set(livreur.photo);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement livreur:', err);
        this.errorMessage.set('Erreur lors du chargement des données');
        this.isLoading.set(false);
      }
    });
  }

  // Gestion de l'upload photo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];

      // Création de l'URL pour la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  saveCourier() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = this.courier();

    if (this.id) {
      // Mode update
      const updateData: UpdateLivreurRequest = {
        name: data.lastName,
        email: data.email,
        matricule: data.licensePlate,
        typeContrat: data.contractType as 'temps plein' | 'temps partiel' | 'freelance'
        // Ajoute d'autres champs si nécessaires, ex. tel, dateNaissance, etc.
        // Note: Le controller update ne gère que certains champs, mais on envoie ce qui est changé
      };
      // Photo non gérée dans update pour l'instant (ajoute si besoin)
      this.livreurService.update(this.id, updateData).subscribe({
        next: () => {
          this.router.navigate(['/admin/couriers-list']);
        },
        error: (err) => {
          console.error('Erreur update:', err);
          this.errorMessage.set('Erreur lors de la mise à jour');
          this.isLoading.set(false);
        }
      });
    } else {
      // Mode create
      if (!data.password) {
        this.errorMessage.set('Le mot de passe est requis pour la création');
        this.isLoading.set(false);
        return;
      }
      const createData: CreateLivreurRequest = {
        name: data.lastName,
        firstname: data.firstName,
        email: data.email,
        password: data.password,
        tel: data.phone,
        dateNaissance: data.dob,
        typeVehicule: data.vehicleType,
        zoneActivite: data.zone,
        typeContrat: data.contractType as 'temps plein' | 'temps partiel' | 'freelance',
        matricule: data.licensePlate,
        photo: this.selectedPhoto || undefined
      };
      this.livreurService.create(createData).subscribe({
        next: () => {
          this.router.navigate(['/admin/couriers-list']);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.errorMessage.set('Erreur lors de la création');
          this.isLoading.set(false);
        }
      });
    }
  }
}