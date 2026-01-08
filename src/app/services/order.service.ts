import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Order, AssignLivreurRequest, UpdateAssignationRequest, CancelOrderRequest, Livraison } from '../shared/interfaces/order.interface';
import { Position } from '../shared/interfaces/position.interface';
import { LivraisonPreuve } from '../shared/interfaces/livraison-preuve.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all orders: GET /commandes
  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}commandes`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get order by ID: GET /commande/{idCommande}
  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}commande/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Assign livreur: POST /commandes/assigner
  assignLivreur(data: AssignLivreurRequest): Observable<{ message: string; order_status: string; livraison: any }> {
    return this.http.post<{ message: string; order_status: string; livraison: any }>(`${this.apiUrl}commandes/assigner`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Update assignation: POST /commandes/modifier-assignation
  updateAssignation(data: UpdateAssignationRequest): Observable<{ message: string; livraison: any }> {
    return this.http.post<{ message: string; livraison: any }>(`${this.apiUrl}commandes/modifier-assignation`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get livraisons by livreur ID: GET /livreurs/{idlivreur}/livraisons
  getLivraisonsByLivreurId(idlivreur: number): Observable<Livraison[]> {
    return this.http.get<Livraison[]>(`${this.apiUrl}livreurs/${idlivreur}/livraisons`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get livraisons by order ID: GET /livraisons/{id}
  getLivraisonsById(id: string): Observable<Livraison> {
    return this.http.get<Livraison>(`${this.apiUrl}livraisons/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Cancel order: POST /commandes/annuler
  cancel(data: CancelOrderRequest): Observable<{ message: string; idCommande: number }> {
    return this.http.post<{ message: string; idCommande: number }>(`${this.apiUrl}commandes/annuler`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get position livreur: GET /livraisons/{livraisonId}/positions
  // Retourne un tableau de positions et extrait la dernière (la plus récente)
  getLivreurPosition(livraisonId: string): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}livraisons/${livraisonId}/positions`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Geocode address using Nominatim
  geocodeAddress(address: string): Observable<any[]> {
    return this.http.get<any[]>(
      'https://nominatim.openstreetmap.org/search',
      { params: { q: address, format: 'json', limit: '1' } }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get preuves de livraison: GET /livraisons/{id}/preuves
  getLivraisonPreuves(livraisonId: string): Observable<LivraisonPreuve[]> {
    return this.http.get<LivraisonPreuve[]>(`${this.apiUrl}livraisons/${livraisonId}/preuves`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Helpers privés
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}