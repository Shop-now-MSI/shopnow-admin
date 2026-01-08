import { Component, signal, computed, viewChild, ElementRef, AfterViewInit, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Trash, ChevronLeft, ChevronRight, Eye, ArrowBigRightDash } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../shared/interfaces/order.interface';
import { ToastService } from '../../services/toast.service'; // Import ToastService

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList implements AfterViewInit, OnInit {
  // Icônes
  readonly trash = Trash;
  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly eye = Eye;
  readonly ArrowBigRightDash = ArrowBigRightDash;

  // Services
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  // --- SCROLL TABLEAU ---
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  tableContainer = viewChild<ElementRef>('tableContainer');

  // --- FILTRES ---
  // Liste des statuts disponibles (modifiable facilement)
  statusOptions = signal([
    { value: '', label: 'Tous les statuts' },
    { value: 'en attente', label: 'En attente' },
    { value: 'en cours', label: 'En cours' },
    { value: 'livré', label: 'Livré' },
    { value: 'annulé', label: 'Annulé' },
  ]);

  // Filtres actifs
  selectedStatus = signal<string>('');
  selectedPeriod = signal<string>(''); // Optionnel pour plus tard
  searchQuery = signal<string>(''); // Pour recherche textuelle

  // --- DONNÉES COMMANDES ---
  allOrders = signal<Order[]>([]);
  isLoading = signal(false);

  // Commandes filtrées
  filteredOrders = computed(() => {
    let filtered = this.allOrders();

    // Filtre par statut
    if (this.selectedStatus()) {
      filtered = filtered.filter(order => 
        order.delivery_status?.toLowerCase() === this.selectedStatus().toLowerCase()
      );
    }

    // Filtre par recherche (optionnel - recherche dans client, adresse, ID)
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.user?.firstname?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.address?.toLowerCase().includes(query) ||
        order.city?.toLowerCase().includes(query) ||
        order.id?.toString().includes(query)
      );
    }

    // Filtre par période (exemple - à adapter selon vos besoins)
    if (this.selectedPeriod()) {
      const today = new Date();
      const orderDate = new Date();
      
      filtered = filtered.filter(order => {
        orderDate.setTime(new Date(order.created_at).getTime());
        
        switch(this.selectedPeriod()) {
          case 'today':
            return orderDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return orderDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            return orderDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  });

  // --- PAGINATION ---
  currentPage = signal(1);
  itemsPerPage = signal(5); // Augmenté à 10 pour plus de visibilité
  totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.itemsPerPage()));
  
  paginatedOrders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredOrders().slice(startIndex, startIndex + this.itemsPerPage());
  });
  
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
  
  paginationInfo = computed(() => {
    const total = this.filteredOrders().length;
    if (total === 0) return 'Aucune commande';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `${start}-${end} sur ${total} commande${total > 1 ? 's' : ''}`;
  });

  // Compteurs par statut
  statusCounts = computed(() => {
    const counts: { [key: string]: number } = {};
    this.statusOptions().forEach(status => {
      if (status.value) {
        counts[status.value] = this.allOrders().filter(order => 
          order.delivery_status?.toLowerCase() === status.value.toLowerCase()
        ).length;
      }
    });
    counts['all'] = this.allOrders().length;
    return counts;
  });

  constructor() {}

  ngOnInit() {
    this.fetchOrders();
  }

  // Fetch des commandes via le service
  private fetchOrders() {
    this.isLoading.set(true);
    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.allOrders.set(orders);
        this.isLoading.set(false);
        this.toastService.success(`${orders.length} commandes chargées`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes:', err);
        this.isLoading.set(false);
        this.toastService.error('Erreur lors du chargement des commandes');
      }
    });
  }

  // --- GESTION DES FILTRES ---
  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.currentPage.set(1); // Retour à la première page quand on change de filtre
  }

  onPeriodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedPeriod.set(select.value);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.selectedStatus.set('');
    this.selectedPeriod.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtres réinitialisés');
  }

  // --- NAVIGATION ---
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

  // --- SCROLL LOGIC ---
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

  onItemsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(select.value));
    this.currentPage.set(1); // Retour à la première page
  }

  // Méthode pour formater le statut pour les classes CSS
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    const statusMap: { [key: string]: string } = {
      'en attente': 'en-attente',
      'en cours': 'enCours',
      'en livraison': 'enCours',
      'livré': 'livré',
      'annulé': 'Annulé',
      'terminé': 'livré',
      'retourné': 'Annulé'
    };
    
    return statusMap[status.toLowerCase()] || 
           status.toLowerCase().replace(/\s+/g, '-');
  }
}