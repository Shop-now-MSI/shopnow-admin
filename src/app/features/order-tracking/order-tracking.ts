import { Component, signal, computed, OnInit, ViewChild, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, Phone, Mail, User, MapPin, Package, CircleCheckBig, Truck, Clock, CreditCard, Ban, Maximize, Image, Pen, QrCode } from 'lucide-angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Livraison } from '../../shared/interfaces/order.interface';
import { Order } from '../../shared/interfaces/order.interface'
import { MapComponent } from '../../map/map';
import { Position } from '../../shared/interfaces/position.interface';
import { LivraisonPreuve } from '../../shared/interfaces/livraison-preuve.interface';

interface TrackingStep {
  id: number;
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  time: string;
  badge?: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, MapComponent],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTracking implements OnInit, AfterViewInit, OnDestroy {
  // Icônes
  readonly chevronLeft = ChevronLeft;
  readonly phoneIcon = Phone;
  readonly mailIcon = Mail;
  readonly userIcon = User;
  readonly mapPin = MapPin;
  readonly packageIcon = Package;
  readonly checkCircle = CircleCheckBig;
  readonly truckIcon = Truck;
  readonly clockIcon = Clock;
  readonly creditCard = CreditCard;
  readonly cancel = Ban;
  readonly maximize = Maximize;
  readonly imageIcon = Image;
  readonly signatureIcon = Pen;
  readonly qrCodeIcon = QrCode;

  @ViewChild(MapComponent) map!: MapComponent;

  // Données de la livraison
  livraison = signal<Livraison | null>(null);
  // Full order (pour items, client, etc.)
  order = signal<Order | null>(null);
  // Étapes de progression (mappées depuis livraison)
  trackingSteps = computed(() => this.mapTrackingSteps());
  // Détails de la commande (items depuis order)
  orderItems = computed(() => this.order()?.order_items || []);
  // Livreur (de livraison.livreur)
  courier = computed(() => this.livraison()?.livreur || null);
  // Client (de order.user)
  client = computed(() => this.order()?.user || null);
  
  // Preuves de livraison
  preuves = signal<LivraisonPreuve[]>([]);
  
  // Temps estimé d'arrivée
  estimatedTime = signal<string>('Calcul en cours...');
  
  // Mode plein écran
  isFullscreen = signal<boolean>(false);

  // ID de la livraison
  private livraisonId: string | null = null;

  center: [number, number] = [4.0511, 9.7679];
  zoom = 13;
  pollingTimer: any;
  clientPosition?: [number, number];
  courierPosition?: [number, number];
  
  // Flag pour savoir si l'utilisateur a interagi avec la carte
  private userInteractedWithMap = false;
  private shouldFitBounds = true;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Effect pour déclencher le polling et géocodage une fois les données chargées
    effect(() => {
      if (this.order() && this.livraison() && this.map) {
        this.geocodeClient();
        this.pollCourier();
      }
    });
  }

  ngOnInit() {
    this.livraisonId = this.route.snapshot.params['id'];
    if (this.livraisonId) {
      this.loadLivraisonDetails(this.livraisonId);
    }
  }

  ngAfterViewInit(): void {
    // La carte est initialisée ici via MapComponent
    // Écouter les interactions de l'utilisateur avec la carte
    setTimeout(() => {
      if (this.map && this.map['map']) {
        this.map['map'].on('dragstart', () => {
          this.userInteractedWithMap = true;
          this.shouldFitBounds = false;
        });
        this.map['map'].on('zoomstart', () => {
          this.userInteractedWithMap = true;
          this.shouldFitBounds = false;
        });
      }
    }, 500);
  }

  private loadLivraisonDetails(id: string) {
    this.orderService.getLivraisonsById(id).subscribe({
      next: (livraison) => {
        this.livraison.set(livraison);
        // Charger full order pour items et client
        this.loadFullOrder(livraison.order_id);
        // Charger les preuves de livraison
        this.loadLivraisonPreuves(id);
      },
      error: (err) => {
        console.error('Erreur chargement livraison:', err);
      }
    });
  }

  private loadFullOrder(orderId: number) {
    this.orderService.getById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
      },
      error: (err) => {
        console.error('Erreur chargement order:', err);
      }
    });
  }

  private loadLivraisonPreuves(livraisonId: string) {
    this.orderService.getLivraisonPreuves(livraisonId).subscribe({
      next: (preuves) => {
        this.preuves.set(preuves);
      },
      error: (err) => {
        console.error('Erreur chargement preuves:', err);
        this.preuves.set([]);
      }
    });
  }

  private mapTrackingSteps(): TrackingStep[] {
    const liv = this.livraison();
    if (!liv) return [];

    const steps: TrackingStep[] = [
      {
        id: 1,
        status: liv.status === 'assigned' || liv.en_route || liv.en_cours || liv.livrée ? 'completed' : 'pending',
        title: 'Assigné',
        description: 'La livraison a été assignée au livreur',
        time: liv.created_at ? (new Date(liv.created_at).toLocaleString()) : 'En attente'
      },
      {
        id: 2,
        status: liv.en_route ? 'completed' : (liv.status === 'assigned' ? 'current' : 'pending'),
        title: 'En route',
        description: 'Le livreur est en route',
        time: liv.en_route ? (new Date(liv.en_route).toLocaleString()) : 'En attente'
      },
      {
        id: 3,
        status: liv.en_cours ? 'completed' : (liv.en_route ? 'current' : 'pending'),
        title: 'En cours de livraison',
        description: 'Livraison en cours',
        time: liv.en_cours ? (new Date(liv.en_cours).toLocaleString()) : 'En attente',
        badge: liv.en_cours ? 'En cours' : undefined
      },
      {
        id: 4,
        status: liv.livrée ? 'completed' : (liv.en_cours ? 'current' : 'pending'),
        title: 'Livrée',
        description: 'Livraison complétée',
        time: liv.livrée ? (new Date(liv.livrée).toLocaleString()) : 'En attente'
      }
    ];
    return steps;
  }

  // Calcul du total (de order.total)
  calculateTotal(): number {
    return parseFloat(this.order()?.total || '0');
  }

  // Actions
  contactCourier() {
    if (this.courier()) {
      console.log('Contacter le livreur:', this.courier()?.tel);
      // Vous pouvez ajouter window.open(`tel:${this.courier()?.tel}`) pour appeler directement
    }
  }

  cancelDelivery() {
    if (this.order()) {
      console.log('Annuler la livraison pour order:', this.order()?.id);
      // Implémente cancel si besoin
    }
  }

  /* ===== CLIENT ===== */
  private geocodeClient(): void {
    const address = `${this.order()?.address}, ${this.order()?.city}`;
    this.orderService.geocodeAddress(address).subscribe(res => {
      if (res.length) {
        this.clientPosition = [+res[0].lat, +res[0].lon];
        this.map.updateOrAddMarker(
          'client',
          this.clientPosition,
          'Client',
          '#10b981'
        );
        if (this.shouldFitBounds) {
          this.updateBounds();
        }
        this.calculateEstimatedTime();
        this.drawRoute();
      }
    });
  }

  /* ===== LIVREUR (polling 3s) ===== */
  private pollCourier(): void {
    if (!this.livraison()) return;

    const fetch = () => {
      this.orderService.getLivreurPosition(this.livraison()!.id).subscribe({
        next: (positions: Position[]) => {
          // Extraire la dernière position (la plus récente)
          if (positions && positions.length > 0) {
            const latestPosition = positions[positions.length - 1];
            
            if (latestPosition.lat != null && latestPosition.lng != null) {
              this.courierPosition = [latestPosition.lat, latestPosition.lng];
              this.map.updateOrAddMarker(
                'courier',
                this.courierPosition,
                'Livreur',
                '#3b82f6'
              );
              if (this.shouldFitBounds) {
                this.updateBounds();
              }
              this.calculateEstimatedTime();
              this.drawRoute();
            }
          }
        },
        error: (err) => {
          console.error('Erreur position livreur:', err);
        }
      })
      .add(() => {
        this.pollingTimer = setTimeout(fetch, 3000);
      });
    };

    fetch();
  }

  private updateBounds(): void {
    const pts: [number, number][] = [];
    if (this.clientPosition) pts.push(this.clientPosition);
    if (this.courierPosition) pts.push(this.courierPosition);
    if (pts.length) this.map.fitBounds(pts);
  }

  /* ===== CALCUL DU TEMPS ESTIMÉ ===== */
  private calculateEstimatedTime(): void {
    if (!this.courierPosition || !this.clientPosition) {
      this.estimatedTime.set('Calcul en cours...');
      return;
    }

    // Calcul de la distance en utilisant la formule de Haversine
    const distance = this.calculateDistance(
      this.courierPosition[0],
      this.courierPosition[1],
      this.clientPosition[0],
      this.clientPosition[1]
    );

    // Vitesse moyenne estimée en ville (30 km/h)
    const averageSpeed = 30;
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    if (timeInMinutes < 1) {
      this.estimatedTime.set('Moins d\'1 min');
    } else if (timeInMinutes < 60) {
      this.estimatedTime.set(`${timeInMinutes} min`);
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      this.estimatedTime.set(`${hours}h ${minutes}min`);
    }
  }

  // Formule de Haversine pour calculer la distance entre deux coordonnées GPS
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /* ===== UI ===== */
  showClient(): void {
    if (this.clientPosition) {
      this.map.setView(this.clientPosition, 16);
      this.shouldFitBounds = false;
      this.userInteractedWithMap = true;
    }
  }

  showCourier(): void {
    if (this.courierPosition) {
      this.map.setView(this.courierPosition, 16);
      this.shouldFitBounds = false;
      this.userInteractedWithMap = true;
    }
  }
  
  /* ===== TRACÉ DE L'ITINÉRAIRE ===== */
  private drawRoute(): void {
    if (!this.courierPosition || !this.clientPosition) return;
    
    // Utiliser l'API OSRM pour obtenir l'itinéraire
    const url = `https://router.project-osrm.org/route/v1/driving/${this.courierPosition[1]},${this.courierPosition[0]};${this.clientPosition[1]},${this.clientPosition[0]}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates: [number, number][] = route.geometry.coordinates.map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          );
          
          // Mettre à jour ou ajouter la ligne de route sur la carte
          this.map.updateOrAddRoute('delivery-route', coordinates);
        }
      })
      .catch(err => {
        console.error('Erreur lors du tracé de l\'itinéraire:', err);
      });
  }

  toggleFullscreen(): void {
    const mapCard = document.querySelector('.map-card');
    if (!mapCard) return;

    if (!this.isFullscreen()) {
      if (mapCard.requestFullscreen) {
        mapCard.requestFullscreen();
      }
      this.isFullscreen.set(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isFullscreen.set(false);
    }

    // Écouter les changements de fullscreen
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen.set(!!document.fullscreenElement);
    });
  }

  /* ===== PREUVES DE LIVRAISON ===== */
  getPreuveIcon(type: string) {
    switch (type) {
      case 'PHOTO':
        return this.imageIcon;
      case 'SIGNATURE':
        return this.signatureIcon;
      case 'QR':
        return this.qrCodeIcon;
      default:
        return this.packageIcon;
    }
  }

  getPreuveLabel(type: string): string {
    switch (type) {
      case 'PHOTO':
        return 'Photo';
      case 'SIGNATURE':
        return 'Signature';
      case 'QR':
        return 'QR Code';
      default:
        return 'Preuve';
    }
  }

  openPreuve(preuve: LivraisonPreuve): void {
    if (preuve.file_url) {
      window.open(preuve.file_url, '_blank');
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.pollingTimer);
  }
}