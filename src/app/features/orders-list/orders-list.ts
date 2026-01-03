import { Component, signal, computed, viewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, ArrowBigRightDash, Pencil, Trash2, Eye } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../shared/interfaces/order.interface';


interface OrderDisplay {
  id: number;
  trackingId: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  deliveryAddress: string;
  city: string;
  zip: string;
  country: string;
  date: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  status: 'pending' | 'transit' | 'delivered' | 'cancelled';
  notes: string;
  products: Array<{
    name: string;
    brand: string;
    quantity: number;
    price: number;
    totalPrice: number;
    images: string[] | null;
  }>;
}



@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList implements AfterViewInit, OnInit {
  // Icônes
  readonly plus = Plus; readonly trash = Trash;
  readonly chevronLeft = ChevronLeft; readonly chevronRight = ChevronRight;
  readonly pencil = Pencil; readonly trash2 = Trash2; readonly eye = Eye;
  readonly ArrowBigRightDash  = ArrowBigRightDash 


  // --- SCROLL TABLEAU ---
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  tableContainer = viewChild<ElementRef>('tableContainer');

  // --- DONNÉES COMMANDES ---
  allOrders = signal<OrderDisplay[]>([]);

  // --- PAGINATION ---
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

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.fetchOrders();
  }

  // Fetch des commandes via le service
private fetchOrders() {
  this.orderService.getAll().subscribe({
    next: (orders) => {
      const mappedOrders: OrderDisplay[] = orders.map(o => ({
        id: o.id,
        trackingId: o.zip,
        clientName: `${o.user.firstname} ${o.user.name}`,
        clientEmail: o.user.email,
        clientAvatar: `https://i.pravatar.cc/150?u=${o.user.id}`,
        deliveryAddress: o.address,
        city: o.city,
        zip: o.zip,
        country: o.country,
        date: this.formatDate(o.date || new Date().toISOString()),
        amount: parseFloat(o.total),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_method === 'carte' || o.payment_method === 'paypal' ? 'paid' : 'pending',
        status: this.mapStatus(o.delivery_status),
        notes: o.notes || 'Aucune note',
        products: o.order_items.map(item => ({
          name: item.product.name,
          brand: item.product.brand,
          quantity: item.quantite,
          price: parseFloat(item.product.price),
          totalPrice: parseFloat(item.product.price) * item.quantite,
          images: item.product.images || []
        }))
      }));
      this.allOrders.set(mappedOrders);
    },
    error: (err) => {
      console.error('Erreur lors du chargement des commandes:', err);
    }
  });
}



  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  private mapStatus(deliveryStatus: string): 'pending' | 'transit' | 'delivered' | 'cancelled' {
    switch (deliveryStatus) {
      case 'en cours':
        return 'transit';
      case 'livré':
        return 'delivered';
      case 'annulé':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

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
