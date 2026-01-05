import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container"></div>
        @if(showControls){
        <div class="map-controls">
            <button (click)="locateUser()" class="control-btn" title="Me localiser">
            <span>📍</span>
            </button>
            <button (click)="resetView()" class="control-btn" title="Réinitialiser">
            <span>🔄</span>
            </button>
        </div>
      }
      
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .map-container {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: white;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.2s;
    }
    
    .control-btn:hover {
      background: #f8f9fa;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .control-btn span {
      font-size: 18px;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  @Input() center: [number, number] = [48.8566, 2.3522]; // Paris par défaut
  @Input() zoom: number = 13;
  @Input() showControls: boolean = true;
  @Input() markers: Array<{
    position: [number, number];
    title?: string;
    color?: string;
    icon?: string;
  }> = [];
  
  @Output() mapClick = new EventEmitter<{lat: number, lng: number}>();
  @Output() markerClick = new EventEmitter<any>();
  @Output() mapReady = new EventEmitter<L.Map>();

  private map!: L.Map;
  private tileLayer!: L.TileLayer;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private userMarker: L.Marker | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100);
  }

  private initMap(): void {
    // Initialiser la carte
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: false
    });

    // Ajouter les tuiles OpenStreetMap
    this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Ajouter le contrôle de zoom
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Ajouter l'attribution
    L.control.attribution({
      position: 'bottomright'
    }).addTo(this.map);

    // Ajouter les marqueurs
    this.markersLayer.addTo(this.map);
    this.addMarkers();

    // Événement de clic sur la carte
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.mapClick.emit({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });

    // Redimensionner la carte
    setTimeout(() => {
      this.map.invalidateSize();
      this.mapReady.emit(this.map);
    }, 200);
  }

  private addMarkers(): void {
    this.markersLayer.clearLayers();
    
    this.markers.forEach(markerData => {
      const marker = this.createMarker(markerData);
      marker.addTo(this.markersLayer);
    });
  }

  private createMarker(markerData: any): L.Marker {
    let icon: L.Icon | L.DivIcon;
    
    if (markerData.icon) {
      // Créer une icône personnalisée
      icon = L.divIcon({
        className: 'custom-marker',
        html: markerData.icon,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
    } else if (markerData.color) {
      // Créer un marqueur coloré
      icon = L.divIcon({
        className: 'color-marker',
        html: `<div style="background-color: ${markerData.color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    } else {
      // Utiliser l'icône par défaut
      icon = L.icon({
        iconUrl: 'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });
    }

    const marker = L.marker(markerData.position, { icon });
    
    if (markerData.title) {
      marker.bindPopup(`<b>${markerData.title}</b>`);
    }
    
    marker.on('click', () => {
      this.markerClick.emit(markerData);
    });

    return marker;
  }

  // Méthodes publiques
  public locateUser(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          
          this.map.setView(latlng, 16);
          
          // Ajouter un marqueur pour la position de l'utilisateur
          if (this.userMarker) {
            this.userMarker.remove();
          }
          
          this.userMarker = L.marker(latlng, {
            icon: L.divIcon({
              className: 'user-marker',
              html: '<div class="pulse-dot"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          })
          .addTo(this.map)
          .bindPopup('Vous êtes ici')
          .openPopup();
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible de vous localiser. Vérifiez les permissions de géolocalisation.');
        }
      );
    }
  }

  public resetView(): void {
    this.map.setView(this.center, this.zoom);
  }

  public addMarker(position: [number, number], title?: string, color?: string): void {
    const marker = this.createMarker({ position, title, color });
    marker.addTo(this.markersLayer);
  }

  public setView(position: [number, number], zoom?: number): void {
    this.map.setView(position, zoom || this.zoom);
  }

  public fitBounds(points: [number, number][]): void {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  public drawRoute(points: [number, number][], color: string = '#3b82f6'): L.Polyline {
    const polyline = L.polyline(points as L.LatLngExpression[], {
      color,
      weight: 4,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(this.map);
    
    this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    return polyline;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}