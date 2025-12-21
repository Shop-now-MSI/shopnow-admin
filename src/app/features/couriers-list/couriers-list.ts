import { Component, signal, computed, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour ngClass si besoin
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, Star, Eye, Pencil, Trash2 } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-couriers-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './couriers-list.html',
  styleUrl: './couriers-list.scss',
})
export class CouriersList implements AfterViewInit {
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
  allCouriers = signal([
    { id: 1, name: 'Jean Dupont', email: 'jean@hub.com', phone: '06 12 34 56 78', zone: 'Paris 08', totalDeliveries: 154, rating: 4.8, status: 'service', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Marc Vasseur', email: 'marc@hub.com', phone: '07 88 99 00 11', zone: 'Lyon Centre', totalDeliveries: 89, rating: 4.5, status: 'offline', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Sophie Martin', email: 'sophie@hub.com', phone: '06 23 45 67 89', zone: 'Marseille 01', totalDeliveries: 203, rating: 4.9, status: 'service', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Thomas Leroy', email: 'thomas@hub.com', phone: '06 34 56 78 90', zone: 'Bordeaux Centre', totalDeliveries: 76, rating: 4.2, status: 'pause', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Claire Petit', email: 'claire@hub.com', phone: '07 55 66 77 88', zone: 'Lille Centre', totalDeliveries: 187, rating: 4.7, status: 'service', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 6, name: 'Antoine Moreau', email: 'antoine@hub.com', phone: '06 77 88 99 00', zone: 'Toulouse', totalDeliveries: 132, rating: 4.6, status: 'service', avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: 7, name: 'Émilie Bernard', email: 'emilie@hub.com', phone: '07 11 22 33 44', zone: 'Nice', totalDeliveries: 95, rating: 4.4, status: 'offline', avatar: 'https://i.pravatar.cc/150?u=7' },
    { id: 8, name: 'Julien Robert', email: 'julien@hub.com', phone: '06 44 55 66 77', zone: 'Strasbourg', totalDeliveries: 168, rating: 4.8, status: 'service', avatar: 'https://i.pravatar.cc/150?u=8' },
    { id: 9, name: 'Camille Richard', email: 'camille@hub.com', phone: '07 99 88 77 66', zone: 'Nantes', totalDeliveries: 121, rating: 4.3, status: 'pause', avatar: 'https://i.pravatar.cc/150?u=9' },
    { id: 10, name: 'Lucas Simon', email: 'lucas@hub.com', phone: '06 22 33 44 55', zone: 'Montpellier', totalDeliveries: 145, rating: 4.7, status: 'service', avatar: 'https://i.pravatar.cc/150?u=10' },
    { id: 11, name: 'Manon Laurent', email: 'manon@hub.com', phone: '07 66 55 44 33', zone: 'Paris 15', totalDeliveries: 189, rating: 4.9, status: 'service', avatar: 'https://i.pravatar.cc/150?u=11' },
    { id: 12, name: 'Nicolas Michel', email: 'nicolas@hub.com', phone: '06 99 00 11 22', zone: 'Lyon Part-Dieu', totalDeliveries: 112, rating: 4.5, status: 'offline', avatar: 'https://i.pravatar.cc/150?u=12' },
    { id: 13, name: 'Sarah Lefebvre', email: 'sarah@hub.com', phone: '07 33 44 55 66', zone: 'Marseille 08', totalDeliveries: 176, rating: 4.6, status: 'service', avatar: 'https://i.pravatar.cc/150?u=13' },
    { id: 14, name: 'Pierre Garcia', email: 'pierre@hub.com', phone: '06 55 44 33 22', zone: 'Bordeaux', totalDeliveries: 134, rating: 4.4, status: 'pause', avatar: 'https://i.pravatar.cc/150?u=14' },
    { id: 15, name: 'Marie Dubois', email: 'marie@hub.com', phone: '07 22 11 00 99', zone: 'Lille', totalDeliveries: 198, rating: 4.8, status: 'service', avatar: 'https://i.pravatar.cc/150?u=15' },
    { id: 16, name: 'Alexandre David', email: 'alex@hub.com', phone: '06 88 77 66 55', zone: 'Toulouse', totalDeliveries: 156, rating: 4.7, status: 'service', avatar: 'https://i.pravatar.cc/150?u=16' },
    { id: 17, name: 'Julie Bertrand', email: 'julie@hub.com', phone: '07 44 33 22 11', zone: 'Nice', totalDeliveries: 103, rating: 4.3, status: 'offline', avatar: 'https://i.pravatar.cc/150?u=17' },
    { id: 18, name: 'Maxime Roux', email: 'maxime@hub.com', phone: '06 66 77 88 99', zone: 'Strasbourg', totalDeliveries: 142, rating: 4.6, status: 'service', avatar: 'https://i.pravatar.cc/150?u=18' },
    { id: 19, name: 'Laura Fournier', email: 'laura@hub.com', phone: '07 55 44 33 22', zone: 'Nantes', totalDeliveries: 167, rating: 4.8, status: 'pause', avatar: 'https://i.pravatar.cc/150?u=19' },
    { id: 20, name: 'Benjamin Morel', email: 'benjamin@hub.com', phone: '06 11 22 33 44', zone: 'Montpellier', totalDeliveries: 125, rating: 4.5, status: 'service', avatar: 'https://i.pravatar.cc/150?u=20' },
    { id: 21, name: 'Chloé Girard', email: 'chloe@hub.com', phone: '07 77 66 55 44', zone: 'Paris 17', totalDeliveries: 212, rating: 4.9, status: 'service', avatar: 'https://i.pravatar.cc/150?u=21' },
    { id: 22, name: 'Hugo Faure', email: 'hugo@hub.com', phone: '06 44 33 22 11', zone: 'Lyon 7', totalDeliveries: 178, rating: 4.7, status: 'offline', avatar: 'https://i.pravatar.cc/150?u=22' },
    { id: 23, name: 'Emma Perrin', email: 'emma@hub.com', phone: '07 88 99 11 22', zone: 'Marseille 06', totalDeliveries: 145, rating: 4.6, status: 'service', avatar: 'https://i.pravatar.cc/150?u=23' },
    { id: 24, name: 'Romain Gauthier', email: 'romain@hub.com', phone: '06 99 88 77 66', zone: 'Bordeaux', totalDeliveries: 97, rating: 4.4, status: 'pause', avatar: 'https://i.pravatar.cc/150?u=24' },
    { id: 25, name: 'Inès Lambert', email: 'ines@hub.com', phone: '07 22 33 44 55', zone: 'Lille Fives', totalDeliveries: 134, rating: 4.5, status: 'service', avatar: 'https://i.pravatar.cc/150?u=25' }
  ]);

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