import { Component, AfterViewInit, Input } from '@angular/core';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
import { HttpClient } from '@angular/common/http';

// Fix pour les icônes Leaflet (problème connu)
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
    standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  @Input() center: [number, number] = [48.8566, 2.3522]; // Paris par défaut
  @Input() zoom: number = 12;
  @Input() showMarkers: boolean = true;
  @Input() markerPositions: [number, number][] = [];

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.center,
      zoom: this.zoom,
      attributionControl: false
    });

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Ajouter le contrôle d'attribution
    L.control.attribution({
      position: 'bottomright'
    }).addTo(this.map);

    // Ajouter des marqueurs si demandé
    if (this.showMarkers && this.markerPositions.length > 0) {
      this.addMarkers();
    }

    // Centrer et ajuster la vue
    this.map.invalidateSize();
  }

  private addMarkers(): void {
    this.clearMarkers();
    
    this.markerPositions.forEach((position, index) => {
      const marker = L.marker(position)
        .addTo(this.map!)
        .bindPopup(`Position ${index + 1}<br>Lat: ${position[0]}, Lng: ${position[1]}`);
      
      this.markers.push(marker);
    });
  }

  public clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  public addMarker(lat: number, lng: number, popupText?: string): void {
    const marker = L.marker([lat, lng]).addTo(this.map!);
    
    if (popupText) {
      marker.bindPopup(popupText);
    }
    
    this.markers.push(marker);
  }

  public setView(lat: number, lng: number, zoom?: number): void {
    this.map?.setView([lat, lng], zoom || this.zoom);
  }

  public getBounds(): L.LatLngBounds | null {
    return this.map?.getBounds() || null;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
