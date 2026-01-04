import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Livreur, CreateLivreurRequest, UpdateLivreurRequest } from '../shared/interfaces/livreur.interface';

@Injectable({
  providedIn: 'root'
})
export class LivreurService {
  private apiUrl = 'http://localhost:8000/api/'; // Adapte

  constructor(private http: HttpClient) {}

  // Get all livreurs: GET /livreurs
  getAll(): Observable<Livreur[]> {
    return this.http.get<Livreur[]>(`${this.apiUrl}livreurs`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Create livreur: POST /livreurs
  create(data: CreateLivreurRequest): Observable<{ message: string; data: Livreur }> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('firstname', data.firstname);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('tel', data.tel);
    formData.append('dateNaissance', data.dateNaissance);
    formData.append('typeVehicule', data.typeVehicule);
    formData.append('zoneActivite', data.zoneActivite);
    formData.append('typeContrat', data.typeContrat);
    formData.append('matricule', data.matricule);
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    return this.http.post<{ message: string; data: Livreur }>(`${this.apiUrl}livreurs`, formData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get livreur by ID: GET /livreurs/{id}
  getById(id: number): Observable<Livreur> {
    return this.http.get<Livreur>(`${this.apiUrl}livreurs/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Update livreur: POST /livreurs/{id}/update
  update(id: number, data: UpdateLivreurRequest): Observable<{ message: string; data: Livreur }> {
    return this.http.post<{ message: string; data: Livreur }>(`${this.apiUrl}livreurs/${id}/update`, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete livreur: DELETE /livreurs/{id}
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}livreurs/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Helpers privés (similaires à AuthService pour cohérence)
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