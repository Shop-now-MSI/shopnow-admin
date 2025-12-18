import { Component, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LucideAngularModule, Plus, Trash, ChevronLeft, ChevronRight, Star, Pencil, Trash2 } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-couriers-list',
  imports: [LucideAngularModule, RouterModule],
  templateUrl: './couriers-list.html',
  styleUrl: './couriers-list.scss',
})
export class CouriersList {
// Icônes
  readonly plus = Plus; readonly trash = Trash; readonly star = Star;
  readonly chevronLeft = ChevronLeft; readonly chevronRight = ChevronRight;
  readonly pencil = Pencil; readonly trash2 = Trash2;

  // Signaux pour le scroll dynamique
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  
  tableContainer = viewChild<ElementRef>('tableContainer');

displayedCouriers = signal([
  { 
    id: 1, 
    name: 'Jean Dupont', 
    email: 'jean@hub.com', 
    phone: '06 12 34 56 78', 
    zone: 'Paris 08', 
    totalDeliveries: 154, 
    rating: 4.8, 
    status: 'service', 
    avatar: 'https://i.pravatar.cc/150?u=1',
    vehicle: 'Vélo électrique',
    experience: '2 ans'
  },
  { 
    id: 2, 
    name: 'Marc Vasseur', 
    email: 'marc@hub.com', 
    phone: '07 88 99 00 11', 
    zone: 'Lyon Centre', 
    totalDeliveries: 89, 
    rating: 4.5, 
    status: 'offline', 
    avatar: 'https://i.pravatar.cc/150?u=2',
    vehicle: 'Scooter 125cc',
    experience: '1 an'
  },
  { 
    id: 3, 
    name: 'Sophie Martin', 
    email: 'sophie@hub.com', 
    phone: '06 23 45 67 89', 
    zone: 'Marseille 01', 
    totalDeliveries: 203, 
    rating: 4.9, 
    status: 'service', 
    avatar: 'https://i.pravatar.cc/150?u=3',
    vehicle: 'Voiture',
    experience: '3 ans'
  },
  { 
    id: 4, 
    name: 'Thomas Leroy', 
    email: 'thomas@hub.com', 
    phone: '06 34 56 78 90', 
    zone: 'Bordeaux Centre', 
    totalDeliveries: 76, 
    rating: 4.2, 
    status: 'pause', 
    avatar: 'https://i.pravatar.cc/150?u=4',
    vehicle: 'Vélo électrique',
    experience: '8 mois'
  },
]);

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