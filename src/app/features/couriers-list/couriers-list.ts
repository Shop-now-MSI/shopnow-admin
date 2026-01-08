import { Component, signal, computed, viewChild, ElementRef, AfterViewInit, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Search } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { LivreurService } from '../../services/livreur.service';
import { Livreur } from '../../shared/interfaces/livreur.interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-couriers-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './couriers-list.html',
  styleUrl: './couriers-list.scss',
})
export class CouriersList implements AfterViewInit, OnInit {
  // Icônes
  readonly plus = Plus;
  readonly trash = Trash;
  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly pencil = Pencil;
  readonly trash2 = Trash2;
  readonly eye = Eye;
  readonly searchIcon = Search;

  // Services
  private livreurService = inject(LivreurService);
  private toastService = inject(ToastService);

  // --- GESTION DU SCROLL TABLEAU ---
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  tableContainer = viewChild<ElementRef>('tableContainer');

  // --- DONNÉES ---
  allCouriers = signal<Livreur[]>([]);
  isLoading = signal(false);

  // --- RECHERCHE ---
  searchQuery = signal<string>('');

  // --- ZONES D'ACTIVITÉ DISPONIBLES (pour affichage) ---
  availableZones = signal<string[]>([]);

  // Livreurs filtrés
  filteredCouriers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      return this.allCouriers();
    }

    return this.allCouriers().filter(courier => {
      return (
        courier.user.firstname?.toLowerCase().includes(query) ||
        courier.user.name?.toLowerCase().includes(query) ||
        courier.user?.email?.toLowerCase().includes(query) ||
        courier.tel?.toLowerCase().includes(query) ||
        courier.zoneActivite?.toLowerCase().includes(query) ||
        courier.typeVehicule?.toLowerCase().includes(query) ||
        courier.typeContrat?.toLowerCase().includes(query) ||
        courier.matricule?.toLowerCase().includes(query) ||
        `${courier.user.firstname} ${courier.user.name}`.toLowerCase().includes(query)
      );
    });
  });

  // --- GESTION DE LA PAGINATION ---
  currentPage = signal(1);
  itemsPerPage = signal(5);

  // Nombre total de pages
  totalPages = computed(() => Math.ceil(this.filteredCouriers().length / this.itemsPerPage()));

  // Les données à afficher pour la page courante
  paginatedCouriers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCouriers().slice(startIndex, startIndex + this.itemsPerPage());
  });

  // Liste des numéros de pages avec ellipsis pour beaucoup de pages
  pagesArray = computed(() => {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const current = this.currentPage();
    let pages = [1];
    
    if (current > 4) pages.push(-1); // Ellipsis
    
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 3) pages.push(-1); // Ellipsis
    
    if (total > 1) pages.push(total);
    
    return pages;
  });

  // Texte informatif
  paginationInfo = computed(() => {
    const total = this.filteredCouriers().length;
    if (total === 0) return 'Aucun livreur';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `${start}-${end} sur ${total} livreur${total > 1 ? 's' : ''}`;
  });

  // Statistiques
  stats = computed(() => {
    const total = this.allCouriers().length;
    const filtered = this.filteredCouriers().length;
    const zones = [...new Set(this.allCouriers().map(c => c.zoneActivite))];
    
    return {
      total,
      filtered,
      zonesCount: zones.length,
      zones: zones.slice(0, 3) // Afficher seulement les 3 premières zones
    };
  });

  constructor() {}

  ngOnInit() {
    this.fetchCouriers();
  }

  // Fetch des livreurs via le service
  private fetchCouriers() {
    this.isLoading.set(true);
    this.livreurService.getAll().subscribe({
      next: (livreurs) => {
        this.allCouriers.set(livreurs);
        
        // Extraire les zones d'activité uniques
        const zones = [...new Set(livreurs.map(c => c.zoneActivite).filter(z => z))];
        this.availableZones.set(zones);
        
        this.isLoading.set(false);
        this.toastService.success(`${livreurs.length} livreurs chargés`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des livreurs:', err);
        this.isLoading.set(false);
        this.toastService.error('Erreur lors du chargement des livreurs');
      }
    });
  }

  // Gestion de la recherche
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1); // Retour à la première page
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.toastService.info('Recherche effacée');
  }

  // Suppression d'un livreur
  deleteCourier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible.')) {
      this.livreurService.delete(id).subscribe({
        next: () => {
          this.allCouriers.update(couriers => couriers.filter(c => c.user_id !== id));
          this.toastService.success('Livreur supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.toastService.error('Erreur lors de la suppression du livreur');
        }
      });
    }
  }

  // Méthodes de navigation
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.scrollToTop();
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.scrollToTop();
  }

  // Changement du nombre d'éléments par page
  onItemsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(select.value));
    this.currentPage.set(1);
  }

  // --- LIFECYCLE SCROLL ---
  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 100);
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

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}