import { Component } from '@angular/core';
import { ChevronDown, ArrowRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-courier-form',
  templateUrl: './courier-form.html',
  styleUrls: ['./courier-form.scss'],
  imports: [LucideAngularModule],
})
export class CourierForm {
  // Icônes Lucide
  readonly chevronDown = ChevronDown;
  readonly arrowRight = ArrowRight;

  constructor() {}
}