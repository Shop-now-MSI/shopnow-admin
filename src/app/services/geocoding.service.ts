import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<any[]> {
    return this.http.get<any[]>(this.nominatimUrl, {
      params: {
        q: query,
        format: 'json',
        limit: '5',
        'accept-language': 'fr',
        countrycodes: 'fr'
      },
      headers: {
        'User-Agent': 'ShopNowApp/1.0'
      }
    }).pipe(
      map(results => 
        results.map(result => ({
          display_name: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          type: result.type,
          importance: result.importance
        }))
      )
    );
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.nominatimUrl}/reverse`, {
      params: {
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        'accept-language': 'fr'
      },
      headers: {
        'User-Agent': 'ShopNowApp/1.0'
      }
    });
  }
}