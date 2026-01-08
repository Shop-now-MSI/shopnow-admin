import { Component, ChangeDetectorRef } from '@angular/core';
import { SlidersHorizontal, LucideAngularModule, EllipsisVertical } from 'lucide-angular/src/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  MoreVertical,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  slidersHorizontal = SlidersHorizontal;
 
  readonly packageIcon = Package;
  readonly clockIcon = Clock;
  readonly truckIcon = Truck;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;
  readonly moreVertical = MoreVertical;
  stats = {
    totalOrders: 0,
    pendingDeliveries: 0,
    activeDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0
  };

  couriers: any[] = [];

  private apiUrl = 'http://localhost:8000/api';
  private token = localStorage.getItem('authToken');

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadCouriers();
    
    // setInterval(() => {
    //   this.loadDashboardStats();
    //   this.loadCouriers();
    // }, 10000);
  }

  loadDashboardStats() {
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    };

    this.http.get<any[]>(`${this.apiUrl}/commandes`, { headers }).subscribe({
      next: (commandes) => {
        console.log('📦 Orders:', commandes);
        
        // Show all statuses
        const statuses = commandes.reduce((acc: any, c) => {
          acc[c.delivery_status] = (acc[c.delivery_status] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Statuses:', statuses);
        
        this.stats = {
          totalOrders: commandes.length,
          pendingDeliveries: commandes.filter(c => c.delivery_status === 'en attente').length,
          activeDeliveries: commandes.filter(c => c.delivery_status === 'en cours').length,
          successfulDeliveries: commandes.filter(c => c.delivery_status === 'livré').length,
          failedDeliveries: commandes.filter(c => c.delivery_status === 'annulé').length
        };
        
        console.log('✅ Stats:', this.stats);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error:', err)
    });
  }

  loadCouriers() {
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    };

    this.http.get<any[]>(`${this.apiUrl}/livraisons`, { headers }).subscribe({
      next: (livraisons) => {
        const livreursMap = new Map();
        
        livraisons.forEach(livraison => {
          const livreur = livraison.livreur;
          
          if (livreur?.user_id) {
            if (!livreursMap.has(livreur.user_id)) {
              livreursMap.set(livreur.user_id, {
                name: livreur.user?.name || `Courier ${livreur.user_id}`,
                city: livreur.ville || 'Unknown city',
                avatar: '',
                level: Math.floor(Math.random() * 15) + 5,
                deliveryCount: 0,
                progress: 0,
                color: '#10b981',
                trend: '+0%'
              });
            }
            
            const courierData = livreursMap.get(livreur.user_id);
            courierData.deliveryCount++;
            courierData.progress = Math.min(100, courierData.progress + 10);
          }
        });
        
        this.couriers = Array.from(livreursMap.values());
        
        if (this.couriers.length === 0) {
          this.couriers = [
            { name: 'No courier', city: 'N/A', avatar: '', level: 1, deliveryCount: 0, progress: 0, color: '#8b949e', trend: '0%' }
          ];
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.couriers = [
          { name: 'Courier 1', city: 'City A', avatar: '', level: 10, deliveryCount: 20, progress: 75, color: '#10b981', trend: '+10%' },
          { name: 'Courier 2', city: 'City B', avatar: '', level: 8, deliveryCount: 15, progress: 50, color: '#3b82f6', trend: '+5%' }
        ];
      }
    });
  }

  get percentPending(): number {
    return this.stats.totalOrders > 0
      ? +(this.stats.pendingDeliveries / this.stats.totalOrders * 100).toFixed(2)
      : 0;
  }

  get percentActive(): number {
    return this.stats.totalOrders > 0
      ? +(this.stats.activeDeliveries / this.stats.totalOrders * 100).toFixed(2)
      : 0;
  }

  get percentSuccessful(): number {
    return this.stats.totalOrders > 0
      ? +(this.stats.successfulDeliveries / this.stats.totalOrders * 100).toFixed(2)
      : 0;
  }

  get percentFailed(): number {
    return this.stats.totalOrders > 0
      ? +(this.stats.failedDeliveries / this.stats.totalOrders * 100).toFixed(2)
      : 0;
  }
}