import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Place } from '../models/model';

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
    this.http.get<Place[]>('/assets/places.json').subscribe({
      next: (places) => {
        this.places.set(places);
      },
      error: (error) => {
        console.error('Failed to load places:', error);
        this.places.set([]);
      },
    });
  }
}
