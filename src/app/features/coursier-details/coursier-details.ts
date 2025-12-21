import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, MapPin, Phone, Mail, Calendar, Bike, Package, Route } from 'lucide-angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-coursier-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './coursier-details.html',
  styleUrl: './coursier-details.scss'
})
export class CoursierDetails {

  constructor(private router: Router) {}

  // Icônes
  readonly chevronLeft = ChevronLeft;
  readonly mapPin = MapPin;
  readonly phone = Phone;
  readonly mail = Mail;
  readonly calendar = Calendar;
  readonly bike = Bike;
  readonly packageIcon = Package;

  // Données du livreur
  courier = signal({
    id: 'DRV-001',
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'Actif',
    avatar: 'https://i.pravatar.cc/150?u=jeandupont',
    email: 'jean.dupont@delivery.com',
    phone: '+33 6 12 34 56 78',
    address: '45 Rue de la Paix, 75002 Paris',
    vehicleType: 'Scooter',
    registrationDate: '15 mai 2023',
    totalDeliveries: 247,
    successRate: 98
  });

  // Commandes assignées
  assignedOrders = signal([
    {
      id: 'CMD-18234',
      date: '2024-01-16',
      status: 'En cours',
      statusClass: 'status-ongoing',
      client: 'Marie Lambert',
      address: '12 Avenue des Champs',
      items: 3,
      amount: 45.99
    },
    {
      id: 'CMD-18237',
      date: '2024-01-15',
      status: 'En cours',
      statusClass: 'status-ongoing',
      client: 'Luc Bernard',
      address: '15 Rue de Rivoli',
      items: 1,
      amount: 28.99
    },
    {
      id: 'CMD-18235',
      date: '2024-01-16',
      status: 'Livré',
      statusClass: 'status-delivered',
      client: 'Pierre Martin',
      address: '8 Rue Victor Hugo',
      items: 2,
      amount: 32.50
    },
    {
      id: 'CMD-18238',
      date: '2024-01-14',
      status: 'Livré',
      statusClass: 'status-delivered',
      client: 'Emma Petit',
      address: '7 Place de la République',
      items: 4,
      amount: 54.20
    },
    {
      id: 'CMD-18236',
      date: '2024-01-15',
      status: 'En attente',
      statusClass: 'status-pending',
      client: 'Sophie Dubois',
      address: '23 Boulevard Haussmann',
      items: 5,
      amount: 67.80
    },
    {
      id: 'CMD-18239',
      date: '2024-01-14',
      status: 'En attente',
      statusClass: 'status-pending',
      client: 'Thomas Roux',
      address: '34 Rue Lafayette',
      items: 2,
      amount: 39.75
    },{
      id: 'CMD-1839',
      date: '2024-01-14',
      status: 'En attente',
      statusClass: 'status-pending',
      client: 'Thomas Roux',
      address: '34 Rue Lafayette',
      items: 2,
      amount: 39.75
    }
  ]);

  // Total des commandes
  totalOrders = computed(() => this.assignedOrders().length);

  navigateToOrderDetails(id : string){
    this.router.navigate([`/admin/order-assignment`]);
  }
}