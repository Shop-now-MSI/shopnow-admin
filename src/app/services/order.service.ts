// 2. Service pour Order : src/app/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, AssignLivreurRequest, UpdateAssignationRequest, CancelOrderRequest } from '../shared/interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/api/'; // Adapte à ton backend Laravel

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

assignLivreur(data: { idCommande: number, idLivreur: number }): Observable<{
  message: string;
  order_status: string;
  livraison: {
    id: string; // UUID
    order_id: number;
    livreur_id: number;
    status: string;
    date_livraison: string | null;
    created_at: string;
    updated_at: string;
  }
}> {
  return this.http.post<{
    message: string;
    order_status: string;
    livraison: {
      id: string;
      order_id: number;
      livreur_id: number;
      status: string;
      date_livraison: string | null;
      created_at: string;
      updated_at: string;
    }
  }>(`${this.apiUrl}commandes/assigner`, data, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}


  // Update assignation: POST /commandes/modifier-assignation
  updateAssignation(data: UpdateAssignationRequest): Observable<{ message: string; livraison: any }> {
    return this.http.post<{ message: string; livraison: any }>(`${this.apiUrl}commandes/modifier-assignation`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Cancel order: POST /commandes/annuler
  cancel(data: CancelOrderRequest): Observable<{ message: string; idCommande: number }> {
    return this.http.post<{ message: string; idCommande: number }>(`${this.apiUrl}commandes/annuler`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Helpers privés (similaires aux services précédents pour cohérence)
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