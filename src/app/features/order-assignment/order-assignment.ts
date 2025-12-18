import { Component } from '@angular/core';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  ChevronDown,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-order-assignment',
  imports: [LucideAngularModule],
  templateUrl: './order-assignment.html',
  styleUrl: './order-assignment.scss',
})
export class OrderAssignment {
// Déclaration des icônes Lucide
  readonly arrowLeft = ArrowLeft;
  readonly arrowRight = ArrowRight;
  readonly user = User;
  readonly chevronDown = ChevronDown;

  constructor() {}
}
