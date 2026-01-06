// src/app/components/order-assignment.component.ts (complet)
import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, User, ArrowRight, Save } from 'lucide-angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { LivreurService } from '../../services/livreur.service';
import { Livreur } from '../../shared/interfaces/livreur.interface';
import { Order } from '../../shared/interfaces/order.interface';
import { Observable } from 'rxjs/internal/Observable';
import { ToastService } from '../../services/toast.service'; // Nouvel import

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
  order = signal<Order | null>(null);
  availableCouriers = signal<Livreur[]>([]);
  selectedCourierId = signal<number | null>(null);
  description = signal('');
  isLoading = signal(true);
  currentLivraisonId = signal<string | null>(null);

  // Flag pour savoir si déjà assigné
  isAssigned = computed(() => !!this.order()?.livraison);

  // Inject ToastService
  private toastService = inject(ToastService);

  constructor(
    private orderService: OrderService,
    private livreurService: LivreurService,
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
        this.order.set(order);
        this.description.set(order.notes || '');
        if (order.livraison) {
          this.currentLivraisonId.set(order.livraison.id);
          this.selectedCourierId.set(order.livraison.livreur_id);
        }
        this.isLoading.set(false);
        this.toastService.success('Détails de la commande chargés avec succès');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error('Échec du chargement des détails de la commande');
        console.error('Erreur:', err);
      }
    });
  }

  loadAvailableCouriers() {
    this.livreurService.getAll().subscribe({
      next: (couriers) => {
        this.availableCouriers.set(couriers);
        if (couriers.length > 0) {
          this.toastService.info(`${couriers.length} livreurs disponibles`);
        } else {
          this.toastService.warning('Aucun livreur disponible');
        }
      },
      error: (err) => {
        console.error('Erreur chargement livreurs:', err);
        this.toastService.error('Échec du chargement des livreurs');
      }
    });
  }

  saveAssignment() {
    if (!this.selectedCourierId()) {
      this.toastService.warning('Veuillez sélectionner un livreur', 3000);
      return;
    }

    const request = {
      idCommande: this.order()!.id,
      idLivreur: this.selectedCourierId()!
    };

    let observable: Observable<any>;
    if (this.isAssigned()) {
      observable = this.orderService.updateAssignation({
        ...request,
        idLivraison: this.currentLivraisonId()!
      });
    } else {
      observable = this.orderService.assignLivreur(request);
    }

    observable.subscribe({
      next: (response) => {
        this.order.update((currentOrder) => {
          if (currentOrder) {
            return {
              ...currentOrder,
              delivery_status: response.livraison.status || currentOrder.delivery_status,
              livraison: response.livraison
            };
          }
          return currentOrder;
        });
        this.currentLivraisonId.set(response.livraison.id);
        
        if (this.isAssigned()) {
          this.toastService.success('Assignation mise à jour avec succès');
        } else {
          this.toastService.success('Livreur assigné avec succès');
        }
      },
      error: (err) => {
        this.toastService.error('Échec de l\'assignation/mise à jour du livreur');
        console.error('Erreur:', err);
      }
    });
  }

  rejectAssignment() {
    if (!this.currentLivraisonId()) {
      this.toastService.warning('Aucune assignation à annuler', 3000);
      return;
    }

    const request = { idCommande: this.order()!.id };
    this.orderService.cancel(request).subscribe({
      next: () => {
        this.order.update((currentOrder) => {
          if (currentOrder) {
            return {
              ...currentOrder,
              delivery_status: 'annulé',
            };
          }
          return currentOrder;
        });
        // this.currentLivraisonId.set(null);
        // this.selectedCourierId.set(null);
        // this.description.set('');
        this.toastService.success('Assignation annulée avec succès');
      },
      error: (err) => {
        this.toastService.error('Échec de l\'annulation');
        console.error('Erreur:', err);
      }
    });
  }
}