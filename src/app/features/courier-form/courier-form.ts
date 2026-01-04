import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, User, Upload, Save, X, ChevronLeft } from 'lucide-angular';
import { LivreurService } from '../../services/livreur.service';
import { CreateLivreurRequest, UpdateLivreurRequest, Livreur } from '../../shared/interfaces/livreur.interface';
import { ToastService } from '../../services/toast.service'; // Import ToastService

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
    firstname: '',
    name: '',
    email: '',
    password: '',
    tel: '',
    dateNaissance: '',
    typeVehicule: '',
    zoneActivite: '',
    typeContrat: '',
    matricule: ''
  });

  // Fichier photo sélectionné
  selectedPhoto: File | null = null;

  // ID pour mode édition
  private id: number | null = null;
  public edit = signal(false);

  // Loading
  isLoading = signal(false);

  // Inject ToastService
  private toastService = inject(ToastService);

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
          firstname: livreur.firstname,
          name: livreur.name,
          email: livreur.user.email,
          password: '',
          tel: livreur.tel,
          dateNaissance: livreur.dateNaissance,
          typeVehicule: livreur.typeVehicule,
          zoneActivite: livreur.zoneActivite,
          typeContrat: livreur.typeContrat,
          matricule: livreur.matricule
        });
        this.previewUrl.set(livreur.photo);
        this.isLoading.set(false);
        this.toastService.success('Livreur chargé avec succès');
      },
      error: (err) => {
        console.error('Erreur chargement livreur:', err);
        this.isLoading.set(false);
        this.toastService.error('Erreur lors du chargement des données du livreur');
      }
    });
  }

  // Gestion de l'upload photo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation de la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('La photo ne doit pas dépasser 5MB', 4000);
        return;
      }

      // Validation du type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        this.toastService.error('Format de fichier non supporté. Utilisez JPG ou PNG', 4000);
        return;
      }

      this.selectedPhoto = file;
      // Création de l'URL pour la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.selectedPhoto);
      this.toastService.info('Photo sélectionnée', 2000);
    }
  }

  // Méthode de validation des champs
  private validateForm(): boolean {
    const data = this.courier();
    const errors: string[] = [];

    if (!data.firstname.trim()) errors.push('Le prénom est requis');
    if (!data.name.trim()) errors.push('Le nom est requis');
    if (!data.email.trim()) errors.push('L\'email est requis');
    if (!data.tel.trim()) errors.push('Le téléphone est requis');
    if (!data.dateNaissance) errors.push('La date de naissance est requise');
    if (!data.typeVehicule) errors.push('Le type de véhicule est requis');
    if (!data.zoneActivite) errors.push('La zone d\'activité est requise');
    if (!data.typeContrat) errors.push('Le type de contrat est requis');
    if (!data.matricule.trim()) errors.push('Le matricule est requis');

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Format d\'email invalide');
    }

    if (errors.length > 0) {
      this.toastService.error(errors.join('<br>'), 6000);
      return false;
    }

    return true;
  }

  saveCourier() {
    // Validation du formulaire
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    const data = this.courier();

    if (this.id) {
      // Mode update
      const updateData: UpdateLivreurRequest = {
        name: data.name,
        firstname: data.firstname,
        email: data.email,
        tel: data.tel,
        dateNaissance: data.dateNaissance,
        typeVehicule: data.typeVehicule,
        zoneActivite: data.zoneActivite,
        typeContrat: data.typeContrat as 'temps plein' | 'temps partiel' | 'freelance',
        matricule: data.matricule
      };

      this.livreurService.update(this.id, updateData).subscribe({
        next: () => {
          this.toastService.success('Livreur modifié avec succès');
          setTimeout(() => {
            this.router.navigate(['/admin/couriers-list']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur update:', err);
          this.isLoading.set(false);
          this.toastService.error('Erreur lors de la mise à jour du livreur');
        }
      });
    } else {
      // Mode create
      const createData: CreateLivreurRequest = {
        name: data.name,
        firstname: data.firstname,
        email: data.email,
        password: data.password || 'motdepasse',
        tel: data.tel,
        dateNaissance: data.dateNaissance,
        typeVehicule: data.typeVehicule,
        zoneActivite: data.zoneActivite,
        typeContrat: data.typeContrat as 'temps plein' | 'temps partiel' | 'freelance',
        matricule: data.matricule,
        photo: this.selectedPhoto || undefined
      };

      this.livreurService.create(createData).subscribe({
        next: () => {
          this.toastService.success('Livreur créé avec succès');
          setTimeout(() => {
            this.router.navigate(['/admin/couriers-list']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.isLoading.set(false);
          this.toastService.error('Erreur lors de la création du livreur');
        }
      });
    }
  }
}