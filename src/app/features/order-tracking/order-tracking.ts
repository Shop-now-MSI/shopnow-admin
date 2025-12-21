import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, Phone, Mail, User, MapPin, Package, CircleCheckBig, Truck, Ban } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTracking {
  // Icônes
  readonly chevronLeft = ChevronLeft;
  readonly phoneIcon = Phone;
  readonly mailIcon = Mail;
  readonly userIcon = User;
  readonly mapPin = MapPin;
  readonly packageIcon = Package;
  readonly checkCircle = CircleCheckBig;
  readonly truckIcon = Truck;
  readonly cancel = Ban;

  // Données de la commande
  order = signal({
    deliveryId: 'LIV-2024-001',
    commandId: 'CMD-2024-456',
    status: 'En cours',
    estimatedTime: '14:30'
  });

  // Étapes de progression
  trackingSteps = signal([
    {
      id: 1,
      status: 'completed',
      title: 'Commande acceptée',
      description: 'Le livreur a accepté la commande',
      time: "Aujourd'hui à 13:15",
      icon: 'checkCircle'
    },
    {
      id: 2,
      status: 'completed',
      title: 'Début de la livraison',
      description: 'Le livreur a commencé le trajet',
      time: "Aujourd'hui à 13:25",
      icon: 'truck'
    },
    {
      id: 3,
      status: 'current',
      title: 'En cours de livraison',
      description: 'Le livreur est en route vers le client',
      time: 'En cours',
      badge: 'En cours',
      icon: 'truck'
    },
    {
      id: 4,
      status: 'pending',
      title: 'Arrivée chez le client',
      description: "Le livreur est arrivé à l'adresse de livraison",
      time: 'Estimation: 14:30',
      icon: 'mapPin'
    },
    {
      id: 5,
      status: 'pending',
      title: 'Paiement',
      description: 'Confirmation du paiement par le client',
      time: 'En attente',
      icon: 'clock'
    },
    {
      id: 6,
      status: 'pending',
      title: 'Livraison finalisée',
      description: 'Commande livrée avec succès',
      time: 'En attente',
      icon: 'checkCircle'
    }
  ]);

  // Informations livreur
  courier = signal({
    name: 'Jean Martin',
    vehicle: 'Renault Kangoo',
    plate: 'AB-123-CD',
    phone: '+33 6 98 76 54 32',
    avatar: 'https://i.pravatar.cc/150?u=jeanmartin'
  });

  // Détails de la commande
  orderItems = signal([
    { name: 'iPhone 15 Pro', quantity: 1, price: 1229.00 },
    { name: 'Coque de protection', quantity: 2, price: 29.99 }
  ]);

  // Client
  client = signal({
    name: 'Marie Dubois',
    address: '123 Rue de la Paix, 75002 Paris',
    phone: '+33 6 12 34 56 78',
    email: 'marie.dubois@example.com'
  });

  // Calcul du total
  calculateTotal() {
    return this.orderItems().reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Actions
  contactCourier() {
    console.log('Contacter le livreur:', this.courier().phone);
  }

  cancelDelivery() {
    console.log('Annuler la livraison');
  }
}