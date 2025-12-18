import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { SlidersHorizontal, LucideAngularModule, EllipsisVertical } from 'lucide-angular/src/icons';

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  slidersHorizontal = SlidersHorizontal;
  moreVertical = EllipsisVertical;

  constructor(
    private api: ApiService
  ){}

  ngOnInit() : void{
  }

  // Données mockées pour le visuel
  couriers = [
    { 
      name: 'Elliot Møller', 
      city: 'Copenhagen, Denmark', 
      avatar: 'https://i.pravatar.cc/150?u=1', 
      level: 15, 
      deliveryCount: 4723, 
      progress: 75,
      color: '#10b981'
    },
    { 
      name: 'Olivia Pedersen', 
      city: 'Copenhagen, Denmark', 
      avatar: 'https://i.pravatar.cc/150?u=2', 
      level: 11, 
      deliveryCount: 2339, 
      progress: 40,
      color: '#3b82f6'
    },
    { 
      name: 'Niklas Döring', 
      city: 'Berlin, Germany', 
      avatar: 'https://i.pravatar.cc/150?u=3', 
      level: 6, 
      deliveryCount: 1884, 
      progress: 25,
      color: '#a855f7'
    }
  ];

}
