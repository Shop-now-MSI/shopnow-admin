import { Component, signal, computed, viewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour ngClass si besoin
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, Star, Eye, Pencil, Trash2 } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { LivreurService } from '../../services/livreur.service'; // Assure-toi que le chemin est correct

interface Courier {
  id: number;
  name: string;
  email: string;
  phone: string;
  zone: string;
  totalDeliveries: number;
  rating: number;
  status: string;
  avatar: string;
}

@Component({
  selector: 'app-couriers-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './couriers-list.html',
  styleUrl: './couriers-list.scss',
})
export class CouriersList implements AfterViewInit, OnInit {
  // Icônes
  readonly plus = Plus; readonly trash = Trash; readonly star = Star;
  readonly chevronLeft = ChevronLeft; readonly chevronRight = ChevronRight;
  readonly pencil = Pencil; readonly trash2 = Trash2;
  readonly eye = Eye;

  // --- GESTION DU SCROLL TABLEAU ---
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  tableContainer = viewChild<ElementRef>('tableContainer');

  // --- DONNÉES ---
  // Liste complète (Source de vérité)
  allCouriers = signal<Courier[]>([]);

  // --- GESTION DE LA PAGINATION ---
  currentPage = signal(1);
  itemsPerPage = signal(5);

  // Nombre total de pages (Calculé automatiquement)
  totalPages = computed(() => Math.ceil(this.allCouriers().length / this.itemsPerPage()));

  // Les données à afficher pour la page courante (Calculé automatiquement)
  paginatedCouriers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.allCouriers().slice(startIndex, endIndex);
  });

  // Liste des numéros de pages [1, 2, 3, 4, 5]
  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // Texte informatif "Affichage 1-5 sur 25"
  paginationInfo = computed(() => {
    const total = this.allCouriers().length;
    if (total === 0) return 'Aucun livreur';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `Affichage ${start}-${end} sur ${total} livreurs`;
  });

  constructor(private livreurService: LivreurService) {}

  ngOnInit() {
    this.fetchCouriers();
  }

  // Fetch des livreurs via le service
  private fetchCouriers() {
    this.livreurService.getAll().subscribe({
      next: (livreurs) => {
        const mappedCouriers: Courier[] = livreurs.map(l => ({
          id: l.user_id,
          name: `${l.firstname} ${l.name}`,
          email: l.user.email,
          phone: l.tel,
          zone: l.zoneActivite,
          totalDeliveries: 0, // À implémenter côté backend si nécessaire
          rating: 0, // À implémenter côté backend si nécessaire
          status: 'disponible', // À implémenter côté backend si nécessaire (ex. basé sur positions)
          avatar: l.photo || `https://i.pravatar.cc/150?u=${l.id}`
        }));
        this.allCouriers.set(mappedCouriers);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des livreurs:', err);
        // Optionnel: afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // Suppression d'un livreur
  deleteCourier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livreur ?')) {
      this.livreurService.delete(id).subscribe({
        next: () => {
          this.allCouriers.update(couriers => couriers.filter(c => c.id !== id));
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          // Optionnel: afficher un message d'erreur
        }
      });
    }
  }

  // Méthodes de navigation
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  // --- LIFECYCLE SCROLL ---
  ngAfterViewInit() {
    this.checkScroll();
  }

  onScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const el = this.tableContainer()?.nativeElement;
    if (el) {
      this.canScrollLeft.set(el.scrollLeft > 0);
      this.canScrollRight.set(el.scrollLeft < (el.scrollWidth - el.clientWidth - 5));
    }
  }

  scrollTable(offset: number) {
    this.tableContainer()?.nativeElement.scrollBy({ left: offset, behavior: 'smooth' });
  }
}