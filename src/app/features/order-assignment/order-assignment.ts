import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, User, ArrowRight, Save } from 'lucide-angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { LivreurService } from '../../services/livreur.service';
import { Livreur } from '../../shared/interfaces/livreur.interface';
import { Order } from '../../shared/interfaces/order.interface';

@Component({
  selector: 'app-order-assignment',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  templateUrl: './order-assignment.html',
  styleUrl: './order-assignment.scss'
})
export class OrderAssignment implements OnInit {
  // Icons
  readonly chevronLeft = ChevronLeft;
  readonly userIcon = User;
  readonly arrowRight = ArrowRight;

  // Data
  order = signal<any>(null);
  availableCouriers = signal<Livreur[]>([]);
  selectedCourierId = signal<number | string>('');
  description = '';
  isLoading = signal(true);
  error = signal<string | null>(null);
  currentAssignmentId = signal<string | null>(null);

  constructor(
    private orderService: OrderService,
    private LivreurService: LivreurService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(Number(orderId));
      this.loadAvailableCouriers();
    }
  }

  loadOrderDetails(orderId: number) {
    this.isLoading.set(true);
    this.orderService.getById(orderId).subscribe({
      next: (order) => {
        this.order.set(this.mapOrderData(order));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load order details');
        this.isLoading.set(false);
      }
    });
  }

  //getAvailableCoursiers
  loadAvailableCouriers() {
    this.LivreurService.getAll().subscribe({
      next: (couriers) => this.availableCouriers.set(couriers),
      error: (err) => console.error('Error loading couriers:', err)
    });
  }

  mapOrderData(order: any) {
    return {
      id: order.id,
      date: new Date(order.date).toLocaleDateString(),
      clientName: `${order.user.firstname} ${order.user.name}`,
      clientEmail: order.user.email,
      zip: order.zip,
      clientAvatar: `https://i.pravatar.cc/150?u=${order.user.id}`,
      deliveryAddress: `${order.address}, ${order.zip} ${order.city}`,
      products: order.order_items.map((item: any) => ({
        name: item.product.name,
        brand: item.product.brand,
        quantity: item.quantite,
        price: parseFloat(item.product.price)
      })),
      total: parseFloat(order.total),
      paymentMethod: order.payment_method,
      notes: order.notes,
      deliveryStatus: this.mapDeliveryStatus(order.delivery_status)
    };
  }

  mapDeliveryStatus(status: string) {
    const statusMap: {[key: string]: string} = {
      'en attente': 'En attente',
      'en cours': 'En cours',
      'livré': 'Livré',
      'annulé': 'Annulé'
    };
    return statusMap[status] || status;
  }

  onCourierChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCourierId.set(val);
  }

acceptAssignment() {
  if (!this.selectedCourierId()) {
    this.error.set('Veuillez sélectionner un livreur');
    return;
  }

  const request = {
    idCommande: this.order().id,
    idLivreur: Number(this.selectedCourierId())
  };

  this.orderService.assignLivreur(request).subscribe({
    next: (response) => {
      // Mettre à jour l'interface avec les données de la réponse
      this.order.update(order => ({
        ...order,
        deliveryStatus: response.order_status,
        livraison: response.livraison
      }));
      this.currentAssignmentId.set(response.livraison.id);
      // Optionnel: afficher un message de succès
    },
    error: (err) => {
      this.error.set('Échec de l\'assignation du livreur');
      console.error('Erreur:', err);
    }
  });
}


  rejectAssignment() {
    // Logique pour annuler l'assignation
    if (this.currentAssignmentId()) {
      this.orderService.cancel(this.order().id).subscribe({
        next: () => {
          this.currentAssignmentId.set(null);
          this.selectedCourierId.set('');
          this.description = '';
        },
        error: (err) => {
          this.error.set('Échec de l\'annulation');
          console.error('Erreur:', err);
        }
      });
    }
  }

}
