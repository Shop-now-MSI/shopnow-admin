import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, User, ArrowRight, Save } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-assignment',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  templateUrl: './order-assignment.html',
  styleUrl: './order-assignment.scss'
})
export class OrderAssignment {
  // Icônes
  readonly chevronLeft = ChevronLeft;
  readonly userIcon = User;
  readonly arrowRight = ArrowRight;

  // Données simulées via Signal (comme votre liste)
  order = signal({
    id: '56784567',
    updatedAt: '16/12/2024, 15:32 PM',
    town: 'Personal or House hold goods',
    age: 15,
    totalWeight: 650,
    volume: 1.3,
    dob: '12/05/1990',
    serviceType: 'Small parcel',
    clientAvatar: 'https://i.pravatar.cc/150?u=99',
    prices: {
      trucking: 456.50,
      insurance: 87.70,
      fuelSurcharge: 400.00,
      warehouse: 240.50,
      chassis: 132.67,
      commFee: 20.00,
      vgmFee: 40.00
    }
  });

  availableCouriers = signal([
    { id: 1, name: 'Jean Marc Alain', zone: 'Zone A' },
    { id: 2, name: 'Sophie Martin', zone: 'Zone B' },
    { id: 11, name: 'Manon Laurent', zone: 'Paris 15' }
  ]);

  selectedCourierId = signal<number | string>('');
  description = '';

  // Calcul du total automatique
  calculateTotal = computed(() => {
    const p = this.order().prices;
    return Object.values(p).reduce((acc, curr) => acc + curr, 0);
  });

  onCourierChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCourierId.set(val);
  }

  acceptAssignment() {
    console.log('Assigné au ID:', this.selectedCourierId(), 'Notes:', this.description);
    // Logique de sauvegarde ici
  }

  rejectAssignment() {
    // Logique de refus
  }
}