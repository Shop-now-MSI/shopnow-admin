import {
  Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import * as L from 'leaflet';

// Fix icônes Leaflet
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
          <button (click)="zoomIn()" title="Zoom +">+</button>
          <button (click)="zoomOut()" title="Zoom -">−</button>
          <button (click)="resetView()" title="Reset">⟳</button>
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
    }

    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 1000;
    }

    .map-controls button {
      width: 40px;
      height: 36px;
      border-radius: 6px;
      background: #fff;
      border: 1px solid #ccc;
      cursor: pointer;
      font-weight: bold;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  @Input() center: [number, number] = [48.8566, 2.3522];
  @Input() zoom = 13;
  @Input() showControls = true;

  @Output() mapReady = new EventEmitter<L.Map>();

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private customMarkers = new Map<string, L.Marker>();
  private routesLayer = L.layerGroup();
  private customRoutes = new Map<string, L.Polyline>();

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.routesLayer.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
      this.mapReady.emit(this.map);
    }, 200);
  }

  /* ====== API PUBLIQUE ====== */

  updateOrAddMarker(
    key: string,
    position: [number, number],
    title?: string,
    color: string = '#3b82f6'
  ): void {
    if (this.customMarkers.has(key)) {
      this.customMarkers.get(key)!.setLatLng(position);
      return;
    }

    const icon = L.divIcon({
      html: `<div style="
        background:${color};
        width:18px;
        height:18px;
        border-radius:50%;
        border:3px solid white;
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const marker = L.marker(position, { icon });
    if (title) marker.bindPopup(title);

    marker.addTo(this.markersLayer);
    this.customMarkers.set(key, marker);
  }

  updateOrAddRoute(
    key: string,
    coordinates: [number, number][],
    color: string = '#3b82f6',
    weight: number = 4
  ): void {
    if (this.customRoutes.has(key)) {
      this.customRoutes.get(key)!.setLatLngs(coordinates);
      return;
    }

    const polyline = L.polyline(coordinates, {
      color: color,
      weight: weight,
      opacity: 0.7,
      smoothFactor: 1
    });

    polyline.addTo(this.routesLayer);
    this.customRoutes.set(key, polyline);
  }

  fitBounds(points: [number, number][]): void {
    if (points.length > 0) {
      this.map.fitBounds(points, { padding: [50, 50] });
    }
  }

  setView(position: [number, number], zoom?: number): void {
    this.map.setView(position, zoom || this.zoom);
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  resetView(): void {
    this.map.setView(this.center, this.zoom);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}