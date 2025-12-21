import { Component, signal, computed, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss', 
})
export class OrdersList implements AfterViewInit {
  // Icônes
  readonly plus = Plus; readonly trash = Trash; 
  readonly chevronLeft = ChevronLeft; readonly chevronRight = ChevronRight;
  readonly pencil = Pencil; readonly trash2 = Trash2; readonly eye = Eye;

  // --- SCROLL TABLEAU ---
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  tableContainer = viewChild<ElementRef>('tableContainer');

  // --- DONNÉES COMMANDES ---
  allOrders = signal([
    { 
      id: 1, 
      trackingId: 'CMD-8854', 
      clientName: 'Alice Martin', 
      clientAvatar: 'https://i.pravatar.cc/150?u=30',
      destination: 'Paris 16ème', 
      date: '18/12/2024', 
      amount: 125.50, 
      paymentStatus: 'paid', 
      status: 'pending' 
    },
    { 
      id: 2, 
      trackingId: 'CMD-8855', 
      clientName: 'Paul Durand', 
      clientAvatar: 'https://i.pravatar.cc/150?u=31',
      destination: 'Lyon Part-Dieu', 
      date: '18/12/2024', 
      amount: 45.00, 
      paymentStatus: 'pending', 
      status: 'transit' 
    },
    { 
      id: 3, 
      trackingId: 'CMD-8856', 
      clientName: 'Entreprise XYZ', 
      clientAvatar: 'https://i.pravatar.cc/150?u=32',
      destination: 'Marseille Port', 
      date: '17/12/2024', 
      amount: 1250.00, 
      paymentStatus: 'paid', 
      status: 'delivered' 
    },
    { 
      id: 4, 
      trackingId: 'CMD-8857', 
      clientName: 'Sophie Bernard', 
      clientAvatar: 'https://i.pravatar.cc/150?u=33',
      destination: 'Bordeaux Centre', 
      date: '17/12/2024', 
      amount: 89.90, 
      paymentStatus: 'paid', 
      status: 'cancelled' 
    },
    { 
      id: 5, 
      trackingId: 'CMD-8858', 
      clientName: 'Lucas Petit', 
      clientAvatar: 'https://i.pravatar.cc/150?u=34',
      destination: 'Lille Europe', 
      date: '16/12/2024', 
      amount: 210.00, 
      paymentStatus: 'paid', 
      status: 'delivered' 
    },
    { 
      id: 6, 
      trackingId: 'CMD-8859', 
      clientName: 'Julie Rousseau', 
      clientAvatar: 'https://i.pravatar.cc/150?u=35',
      destination: 'Nantes', 
      date: '16/12/2024', 
      amount: 34.50, 
      paymentStatus: 'pending', 
      status: 'transit' 
    },
    { 
      id: 7, 
      trackingId: 'CMD-8860', 
      clientName: 'Marc Lefebvre', 
      clientAvatar: 'https://i.pravatar.cc/150?u=36',
      destination: 'Strasbourg', 
      date: '15/12/2024', 
      amount: 67.20, 
      paymentStatus: 'paid', 
      status: 'pending' 
    },
    // ... Ajoutez d'autres données pour tester la pagination
  ]);

  // --- PAGINATION (Copie conforme) ---
  currentPage = signal(1);
  itemsPerPage = signal(5);

  totalPages = computed(() => Math.ceil(this.allOrders().length / this.itemsPerPage()));

  paginatedOrders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.allOrders().slice(startIndex, startIndex + this.itemsPerPage());
  });

  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  paginationInfo = computed(() => {
    const total = this.allOrders().length;
    if (total === 0) return 'Aucune commande';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `Affichage ${start}-${end} sur ${total} commandes`;
  });

  // --- NAVIGATION ---
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  goToPage(page: number) { this.currentPage.set(page); }

  // --- SCROLL LOGIC ---
  ngAfterViewInit() { this.checkScroll(); }
  onScroll() { this.checkScroll(); }
  
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