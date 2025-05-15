import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Place } from '../models/model';

interface PlacesResponse {
  theatre: Place[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  places = signal<Place[]>([]);

  constructor() {
    this.loadPlaces();
  }

  private loadPlaces() {
    this.http.get<PlacesResponse>('/assets/places.json').subscribe({
      next: (response) => {
        this.places.set(response.theatre);
      },
      error: (error) => {
        console.error('Failed to load places:', error);
        this.places.set([]);
      },
    });
  }
}
