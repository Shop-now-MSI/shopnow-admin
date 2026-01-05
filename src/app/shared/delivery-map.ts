import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map';

@Component({
  selector: 'app-delivery-map',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="delivery-map-container">
      <div class="map-header">
        <h3>Carte des Livraisons</h3>
        <div class="map-stats">
          <span class="stat">Livraisons: {{ deliveries.length }}</span>
          <span class="stat">En cours: {{ activeDeliveries }}</span>
        </div>
      </div>
      
      <div class="map-content">
        <div class="map-sidebar">
          <div class="search-box">
            <input type="text" placeholder="Rechercher une adresse..." (keyup.enter)="searchAddress($event)">
          </div>
          
          <div class="delivery-list">
            <h4>Livraisons du jour</h4>
            <div class="delivery-items">
              @for (delivery of deliveries; track delivery.id) {
                <div class="delivery-item" 
                     [class.active]="selectedDelivery === delivery.id"
                     (click)="selectDelivery(delivery)">
                  <div class="delivery-info">
                    <span class="delivery-name">{{ delivery.address }}</span>
                    <span class="delivery-status status-{{ delivery.status }}">
                      {{ delivery.status }}
                    </span>
                  </div>
                  <div class="delivery-meta">
                    <span>{{ delivery.time }}</span>
                    <span>{{ delivery.distance }} km</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        
        <div class="map-area">
          <app-map
            [center]="center"
            [zoom]="zoom"
            [markers]="mapMarkers"
            [showControls]="true"
            (mapClick)="onMapClick($event)"
            (markerClick)="onMarkerClick($event)"
            (mapReady)="onMapReady($event)">
          </app-map>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .delivery-map-container {
      background: #1a1c22;
      border-radius: 12px;
      padding: 20px;
      margin: 20px;
      height: calc(100vh - 100px);
      display: flex;
      flex-direction: column;
    }
    
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #2d3139;
      
      h3 {
        margin: 0;
        color: #f0f6fc;
        font-size: 1.5rem;
      }
    }
    
    .map-stats {
      display: flex;
      gap: 15px;
      
      .stat {
        background: #2d3139;
        color: #8b949e;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
      }
    }
    
    .map-content {
      display: flex;
      flex: 1;
      gap: 20px;
      overflow: hidden;
    }
    
    .map-sidebar {
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .search-box {
      input {
        width: 100%;
        padding: 12px 16px;
        background: #2d3139;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        color: #f0f6fc;
        outline: none;
        
        &::placeholder {
          color: #8b949e;
        }
        
        &:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      }
    }
    
    .delivery-list {
      background: #2d3139;
      border-radius: 8px;
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      
      h4 {
        margin: 0 0 16px 0;
        color: #f0f6fc;
        font-size: 1.1rem;
      }
    }
    
    .delivery-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .delivery-item {
      background: #1a1c22;
      border-radius: 6px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      
      &:hover {
        background: #2d3139;
        border-color: #3b82f6;
      }
      
      &.active {
        background: #2d3139;
        border-color: #3b82f6;
      }
    }
    
    .delivery-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .delivery-name {
        color: #f0f6fc;
        font-weight: 500;
        font-size: 14px;
      }
      
      .delivery-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        
        &.status-en-cours {
          background: #bfdbfe;
          color: #1d4ed8;
        }
        
        &.status-livré {
          background: #dcfce7;
          color: #15803d;
        }
        
        &.status-en-attente {
          background: #ffeab0;
          color: #b78103;
        }
      }
    }
    
    .delivery-meta {
      display: flex;
      justify-content: space-between;
      color: #8b949e;
      font-size: 12px;
    }
    
    .map-area {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
    }
    
    /* Scrollbar personnalisée */
    .delivery-items::-webkit-scrollbar {
      width: 6px;
    }
    
    .delivery-items::-webkit-scrollbar-track {
      background: #1a1c22;
      border-radius: 3px;
    }
    
    .delivery-items::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 3px;
    }
  `]
})
export class DeliveryMapComponent implements AfterViewInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  
  center: [number, number] = [48.8566, 2.3522];
  zoom: number = 13;
  selectedDelivery: number | null = null;
  
  deliveries = [
    { 
      id: 1, 
      address: '15 Rue de Rivoli, 75004 Paris',
      position: [48.8566, 2.3522] as [number, number],
      status: 'en-cours',
      time: '14:30',
      distance: 2.5
    },
    { 
      id: 2, 
      address: '1 Avenue des Champs-Élysées, 75008 Paris',
      position: [48.8698, 2.3072] as [number, number],
      status: 'en-attente',
      time: '15:15',
      distance: 3.2
    },
    { 
      id: 3, 
      address: '6 Place du Colonel Fabien, 75019 Paris',
      position: [48.8806, 2.3722] as [number, number],
      status: 'livré',
      time: '13:45',
      distance: 4.1
    }
  ];
  
  get activeDeliveries(): number {
    return this.deliveries.filter(d => d.status === 'en-cours').length;
  }
  
  get mapMarkers() {
    return this.deliveries.map(delivery => ({
      position: delivery.position,
      title: delivery.address,
      color: this.getStatusColor(delivery.status)
    }));
  }

  ngAfterViewInit(): void {
    // Ajouter les marqueurs après l'initialisation
    setTimeout(() => {
      this.fitToMarkers();
    }, 500);
  }

  onMapClick(event: any): void {
    console.log('Position cliquée:', event);
    // Vous pouvez ajouter une nouvelle livraison ici
  }

  onMarkerClick(marker: any): void {
    const delivery = this.deliveries.find(d => 
      d.position[0] === marker.position[0] && 
      d.position[1] === marker.position[1]
    );
    
    if (delivery) {
      this.selectDelivery(delivery);
    }
  }

  onMapReady(map: any): void {
    console.log('Carte prête');
    // Vous pouvez ajouter des couches supplémentaires ici
  }

  selectDelivery(delivery: any): void {
    this.selectedDelivery = delivery.id;
    this.mapComponent.setView(delivery.position, 16);
    
    // Mettre en surbrillance le marqueur
    // Vous pourriez implémenter une logique de surbrillance ici
  }

  searchAddress(event: Event): void {
    const input = event.target as HTMLInputElement;
    const address = input.value.trim();
    
    if (address) {
      // Ici, vous pourriez utiliser un service de géocodage
      // Pour l'instant, on va simuler avec une position aléatoire
      const randomLat = 48.85 + Math.random() * 0.05;
      const randomLng = 2.35 + Math.random() * 0.05;
      
      this.mapComponent.addMarker([randomLat, randomLng], address, '#3b82f6');
      this.mapComponent.setView([randomLat, randomLng], 15);
    }
  }

  fitToMarkers(): void {
    if (this.mapComponent && this.deliveries.length > 0) {
      const points = this.deliveries.map(d => d.position);
      this.mapComponent.fitBounds(points);
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'en-cours': return '#3b82f6';
      case 'livré': return '#10b981';
      case 'en-attente': return '#f59e0b';
      default: return '#8b949e';
    }
  }
}