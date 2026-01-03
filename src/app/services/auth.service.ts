import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, LoginResponse, UpdateProfileRequest } from '../shared/interfaces/user.interface';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private route: Router) {
    // Charge l'utilisateur depuis localStorage au démarrage si token existe
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Login : POST /login
  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, body).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
      }),
      catchError(this.handleError)
    );
  }

  // Get Profil : GET /me (ou /user, selon ton usage ; j'ai utilisé /me basé sur le controller)
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}me`, { headers: this.getAuthHeaders() }).pipe(
      tap(user => this.setCurrentUser(user)),
      catchError(this.handleError)
    );
  }

  // Update Profil : POST /user/update
  updateProfile(data: UpdateProfileRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.apiUrl}user/update`, data, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.setCurrentUser(response.user)),
      catchError(this.handleError)
    );
  }

  // Logout : POST /logout
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}logout`, {}, { headers: this.getAuthHeaders() }).pipe(
      tap(() =>  this.clearSession()),
      tap(() => this.route.navigate(['/login'])),
      catchError(this.handleError)
    );
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Helpers privés
  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  isAuthenticated(): Observable<boolean> {
    // Vérifiez si l'utilisateur est authentifié
    const token = localStorage.getItem('authToken');

    if (!token) {
      this.isAuthenticatedSubject.next(false);
      return of(false);
    }

    this.isAuthenticatedSubject.next(true);
    return this.isAuthenticatedSubject.asObservable();
  }

  // auth.service.ts
verifyToken(): Observable<boolean> {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return of(false);
  }

  // Vérification supplémentaire du token (expiration, validité)
  // Vous pourriez faire un appel API pour vérifier le token
  return this.http.post(`${this.apiUrl}verify-token`, { token }).pipe(
    map((response: any) => response.isValid || false),
    catchError(() => of(false))
  );
}

}