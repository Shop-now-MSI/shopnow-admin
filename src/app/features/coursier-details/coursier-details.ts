import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, MapPin, Package, Download, User, ArrowLeftRight, Bike, Ban } from 'lucide-angular';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LivreurService } from '../../services/livreur.service';
import { OrderService } from '../../services/order.service';
import { Livreur } from '../../shared/interfaces/livreur.interface';
import { Livraison } from '../../shared/interfaces/order.interface';
import { ToastService } from '../../services/toast.service'; // Import ToastService
import * as XLSX from 'xlsx'; // Pour l'export Excel
import { saveAs } from 'file-saver'; // Pour télécharger le fichier

@Component({
  selector: 'app-coursier-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './coursier-details.html',
  styleUrl: './coursier-details.scss'
})
export class CoursierDetails implements OnInit {
  // Icônes
  readonly chevronLeft = ChevronLeft;
  readonly mapPin = MapPin;
  readonly userIcon = User;
  readonly packageIcon = Package;
  readonly downloadIcon = Download; // Nouvelle icône pour l'export
  readonly cancel = Ban;
  readonly arrowLeftRight = ArrowLeftRight
  // Services
  private toastService = inject(ToastService);

  // Données du livreur
  courier = signal<Livreur | null>(null);

  // Livraisons assignées
  assignedLivraisons = signal<Livraison[]>([]);

  // Total des commandes
  totalOrders = computed(() => this.assignedLivraisons().length);

  // ID du livreur
  private livreurId: number | null = null;

  // État de chargement pour l'export
  isExporting = signal(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private livreurService: LivreurService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.livreurId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    if (this.livreurId) {
      this.loadLivreurDetails(this.livreurId);
      this.loadAssignedLivraisons(this.livreurId);
    }
  }

  private loadLivreurDetails(id: number) {
    this.livreurService.getById(id).subscribe({
      next: (livreur) => {
        this.courier.set(livreur);
        this.toastService.success('Informations du livreur chargées');
      },
      error: (err) => {
        console.error('Erreur chargement livreur:', err);
        this.toastService.error('Erreur lors du chargement des informations du livreur');
      }
    });
  }

  private loadAssignedLivraisons(id: number) {
    this.orderService.getLivraisonsByLivreurId(id).subscribe({
      next: (livraisons) => {
        this.assignedLivraisons.set(livraisons);
        if (livraisons.length > 0) {
          this.toastService.info(`${livraisons.length} livraisons assignées`);
        }
      },
      error: (err) => {
        console.error('Erreur chargement livraisons:', err);
        this.toastService.error('Erreur lors du chargement des livraisons assignées');
      }
    });
  }

  navigateToOrderDetails(id: number) {
    this.router.navigate([`/admin/order-assignment/${id}`]);
  }

  // Méthode pour exporter en Excel
exportToExcel(): void {
  this.isExporting.set(true);
  
  try {
    const livreur = this.courier();
    if (!livreur) {
      this.toastService.error('Aucune donnée de livreur à exporter');
      this.isExporting.set(false);
      return;
    }

    const livraisons = this.assignedLivraisons();
    
    // Vérifier si nous avons des données
    if (livraisons.length === 0) {
      this.toastService.info('Aucune livraison à exporter');
      this.isExporting.set(false);
      return;
    }

    // Créer le workbook
    const wb = XLSX.utils.book_new();

    // ============================================
    // FEUILLE 1 : INFORMATIONS DU LIVREUR
    // ============================================
    const livreurData = [
      ['PROFIL DU LIVREUR - DÉTAILS COMPLETS'],
      ['Export généré le', new Date().toLocaleString('fr-FR')],
      [''],
      ['INFORMATIONS PERSONNELLES'],
      ['Nom', livreur.name],
      ['Prénom', livreur.firstname],
      ['Email', livreur.user?.email],
      ['Téléphone', livreur.tel || 'Non renseigné'],
      ['Date de naissance', livreur.dateNaissance ? new Date(livreur.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseigné'],
      ['Date d\'embauche', livreur.created_at ? new Date(livreur.created_at).toLocaleDateString('fr-FR') : 'Non renseigné'],
      ['ID Livreur', livreur.user_id],
      [''],
      ['INFORMATIONS PROFESSIONNELLES'],
      ['Zone d\'activité', livreur.zoneActivite],
      ['Type de véhicule', livreur.typeVehicule],
      ['Type de contrat', livreur.typeContrat],
      ['Matricule', livreur.matricule || 'Non renseigné'],
      [''],
      ['STATISTIQUES'],
      ['Total livraisons assignées', this.totalOrders()],
      ['Livraisons réussies', this.countByStatus('livré')],
      ['Livraisons en cours', this.countByStatus('en_cours')],
      ['Livraisons annulées', this.countByStatus('annulé')],
      ['Taux de réussite', `${this.calculateSuccessRate()}%`],
      ['Montant total livré', `${this.calculateTotalAmount()} €`],
      ['Moyenne par commande', `${this.calculateAverageAmount()} €`]
    ];

    const wsLivreur = XLSX.utils.aoa_to_sheet(livreurData);
    wsLivreur['!cols'] = [
      { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsLivreur, 'Profil Livreur');

    // ============================================
    // FEUILLE 2 : RÉSUMÉ DES LIVRAISONS
    // ============================================
    const resumeLivraisonsData = [
      ['RÉSUMÉ DES LIVRAISONS ASSIGNÉES'],
      [''],
      ['ID Commande', 'Client', 'Email Client', 'Téléphone Client', 'Adresse Livraison', 'Ville', 'Code Postal', 'Date Commande', 'Heure Commande', 'Montant Total', 'Méthode Paiement', 'Statut Livraison', 'Date Livraison', 'Notes']
    ];

    livraisons.forEach((livraison) => {
      const order = livraison.order || {};
      const user = order.user || {};
      const orderDate = order.created_at ? new Date(order.created_at) : null;
      const deliveryDate = livraison.updated_at ? new Date(livraison.updated_at) : null;
      
      resumeLivraisonsData.push([
        order.id.toString() || 'N/A',
        `${user.firstname || ''} ${user.name || ''}`.trim(),
        user.email || 'N/A',
        order.address || 'N/A',
        order.city || 'N/A',
        order.zip || 'N/A',
        orderDate ? orderDate.toLocaleDateString('fr-FR') : 'N/A',
        orderDate ? orderDate.toLocaleTimeString('fr-FR') : 'N/A',
        order.total ? `${parseFloat(order.total).toFixed(2)} €` : '0.00 €',
        order.payment_method || 'N/A',
        livraison.status || 'N/A',
        deliveryDate ? deliveryDate.toLocaleDateString('fr-FR') : 'En attente',
        order.notes || ''
      ]);
    });

    // Ajouter les totaux
    resumeLivraisonsData.push(['']);
    resumeLivraisonsData.push([
      'TOTAUX',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `${this.calculateTotalAmount().toFixed(2)} €`,
      '',
      `${this.calculateSuccessRate()}% de réussite`,
      '',
      ''
    ]);

    const wsResume = XLSX.utils.aoa_to_sheet(resumeLivraisonsData);
    wsResume['!cols'] = [
      { wch: 12 },  // ID Commande
      { wch: 20 },  // Client
      { wch: 25 },  // Email
      { wch: 15 },  // Téléphone
      { wch: 30 },  // Adresse
      { wch: 15 },  // Ville
      { wch: 12 },  // Code Postal
      { wch: 12 },  // Date
      { wch: 12 },  // Heure
      { wch: 15 },  // Montant
      { wch: 15 },  // Paiement
      { wch: 15 },  // Statut
      { wch: 15 },  // Date Livraison
      { wch: 40 }   // Notes
    ];
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé Livraisons');

    // ============================================
    // FEUILLE 3 : DÉTAILS DES PRODUITS PAR COMMANDE
    // ============================================
    const produitsData = [
      ['DÉTAILS COMPLETS DES PRODUITS PAR COMMANDE'],
      [''],
      ['ID Commande', 'Client', 'Produit ID', 'Nom Produit', 'Marque', 'Catégorie', 'Quantité', 'Prix Unitaire', 'Prix Total', 'SKU/Code', 'Date Ajout', 'Remarques Produit']
    ];

    let totalProduits = 0;
    let montantTotalProduits = 0;

    livraisons.forEach((livraison) => {
      const order = livraison.order || {};
      const user = order.user || {};
      const orderItems = order.order_items || [];
      
      if (orderItems.length > 0) {
        orderItems.forEach((item: any) => {
          const product = item.product || {};
          const prixUnitaire = parseFloat(product.price || item.price || '0');
          const quantite = parseInt(item.quantite || item.quantity || '1');
          const prixTotal = prixUnitaire * quantite;
          
          produitsData.push([
            order.id || 'N/A',
            `${user.firstname || ''} ${user.name || ''}`.trim(),
            product.id || item.product_id || 'N/A',
            product.name || 'Produit non spécifié',
            product.brand || 'N/A',
            product.category || product.category_name || 'N/A',
            quantite,
            `${prixUnitaire.toFixed(2)} €`,
            `${prixTotal.toFixed(2)} €`,
            product.sku || product.code || 'N/A',
            product.created_at ? new Date(product.created_at).toLocaleDateString('fr-FR') : 'N/A',
            item.notes || product.notes || ''
          ]);
          
          totalProduits += quantite;
          montantTotalProduits += prixTotal;
        });
      } else {
        // Si pas de produits détaillés, ajouter une ligne générique
        produitsData.push([
          order.id.toString() || 'N/A',
          `${user.firstname || ''} ${user.name || ''}`.trim(),
          'N/A',
          'Informations produits non disponibles',
          'N/A',
          'N/A',
          '0',
          '0.00 €',
          '0.00 €',
          'N/A',
          'N/A',
          ''
        ]);
      }
    });

    // Ajouter les totaux
    produitsData.push(['']);
    produitsData.push([
      'TOTAUX PRODUITS',
      '',
      '',
      '',
      '',
      '',
      totalProduits.toString(),
      '',
      `${montantTotalProduits.toFixed(2)} €`,
      '',
      '',
      ''
    ]);

    const wsProduits = XLSX.utils.aoa_to_sheet(produitsData);
    wsProduits['!cols'] = [
      { wch: 12 },  // ID Commande
      { wch: 20 },  // Client
      { wch: 12 },  // Produit ID
      { wch: 25 },  // Nom Produit
      { wch: 15 },  // Marque
      { wch: 15 },  // Catégorie
      { wch: 10 },  // Quantité
      { wch: 12 },  // Prix Unitaire
      { wch: 12 },  // Prix Total
      { wch: 15 },  // SKU
      { wch: 12 },  // Date Ajout
      { wch: 30 }   // Remarques
    ];
    XLSX.utils.book_append_sheet(wb, wsProduits, 'Détails Produits');

    // ============================================
    // FEUILLE 4 : ADRESSES DE LIVRAISON DÉTAILLÉES
    // ============================================
    const adressesData = [
      ['ADRESSES DE LIVRAISON COMPLÈTES'],
      [''],
      ['ID Commande', 'Client', 'Adresse Complète', 'Ville', 'Code Postal', 'Région', 'Pays', 'Notes', 'Email Client']
    ];

    livraisons.forEach((livraison) => {
      const order = livraison.order || {};
      const user = order.user || {};
      
      adressesData.push([
        order.id?.toString() || 'N/A',
        `${user.firstname || ''} ${user.name || ''}`.trim(),
        order.address || 'N/A',
        order.city || 'N/A',
        order.zip || 'N/A',
        order.region || 'N/A',
        order.country || 'France',
        order.notes || 'Aucune note',
        user.email || 'N/A'
      ]);
    });

    const wsAdresses = XLSX.utils.aoa_to_sheet(adressesData);
    wsAdresses['!cols'] = [
      { wch: 12 },  // ID Commande
      { wch: 20 },  // Client
      { wch: 40 },  // Adresse
      { wch: 15 },  // Ville
      { wch: 10 },  // Code Postal
      { wch: 15 },  // Région
      { wch: 15 },  // Pays
      { wch: 30 },  // Notes
      { wch: 25 }   // Email Client
    ];
    XLSX.utils.book_append_sheet(wb, wsAdresses, 'Adresses Livraison');


    // ============================================
    // GÉNÉRATION ET TÉLÉCHARGEMENT
    // ============================================
    const excelBuffer = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Nom du fichier
    const fileName = `Export_Complet_Livreur_${livreur.firstname}_${livreur.name}_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.xlsx`;
    
    // Télécharger
    saveAs(blob, fileName);
    
    this.toastService.success(`Export réussi ! ${livraisons.length} livraisons exportées avec tous les détails`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    this.toastService.error('Erreur lors de l\'export Excel');
  } finally {
    this.isExporting.set(false);
  }
}

// ============================================
// MÉTHODES UTILITAIRES SUPPLÉMENTAIRES
// ============================================

// Analyser par méthode de paiement
analyzeByPaymentMethod(livraisons: any[]): any[] {
  const stats: any = {};
  
  livraisons.forEach(livraison => {
    const method = livraison.order?.payment_method || 'Non spécifié';
    const amount = parseFloat(livraison.order?.total || '0');
    
    if (!stats[method]) {
      stats[method] = { count: 0, total: 0 };
    }
    
    stats[method].count++;
    stats[method].total += amount;
  });
  
  const total = livraisons.length;
  return Object.keys(stats).map(method => ({
    method,
    count: stats[method].count,
    percentage: total > 0 ? Math.round((stats[method].count / total) * 100) : 0,
    total: stats[method].total.toFixed(2)
  }));
}

// Analyser par date
analyzeByDate(livraisons: any[]): any[] {
  const stats: any = {};
  
  livraisons.forEach(livraison => {
    const date = new Date(livraison.order?.created_at || livraison.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const amount = parseFloat(livraison.order?.total || '0');
    
    if (!stats[monthYear]) {
      stats[monthYear] = { count: 0, total: 0 };
    }
    
    stats[monthYear].count++;
    stats[monthYear].total += amount;
  });
  
  return Object.keys(stats).map(period => ({
    period,
    count: stats[period].count,
    total: stats[period].total.toFixed(2)
  }));
}

// Analyser par localisation
analyzeByLocation(livraisons: any[]): any[] {
  const stats: any = {};
  
  livraisons.forEach(livraison => {
    const city = livraison.order?.city || 'Non spécifié';
    
    if (!stats[city]) {
      stats[city] = 0;
    }
    
    stats[city]++;
  });
  
  const total = livraisons.length;
  return Object.keys(stats).map(city => ({
    city,
    count: stats[city],
    percentage: total > 0 ? Math.round((stats[city] / total) * 100) : 0
  }));
}

// Méthodes existantes (gardez-les)
calculateTotalAmount(): number {
  return this.assignedLivraisons().reduce((total, livraison) => {
    const orderTotal = parseFloat(livraison.order?.total || '0');
    return total + orderTotal;
  }, 0);
}

calculateSuccessRate(): number {
  const livraisons = this.assignedLivraisons();
  if (livraisons.length === 0) return 0;
  
  const livrees = livraisons.filter(l => l.status === 'livré').length;
  return Math.round((livrees / livraisons.length) * 100);
}

calculateAverageAmount(): number {
  const total = this.calculateTotalAmount();
  const count = this.totalOrders();
  return count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
}

countByStatus(status: string): number {
  return this.assignedLivraisons().filter(l => l.status === status).length;
}

  // Méthode alternative pour exporter en PDF (optionnel)
  exportToPDF(): void {
    this.toastService.info('Export PDF bientôt disponible', 3000);
    // À implémenter avec une bibliothèque PDF comme jsPDF
  }
}