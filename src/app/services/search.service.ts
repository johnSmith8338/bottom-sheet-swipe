import { Injectable, signal } from '@angular/core';
import { Place } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private places = signal<Place[]>([]);
  filteredPlaces = signal<Place[]>([]);

  setPlaces(places: Place[]) {
    this.places.set(places);
    this.filteredPlaces.set(places);
  }

  filterPlaces(query: string) {
    if (!query.trim()) {
      this.filteredPlaces.set(this.places());
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.places().filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.description.toLowerCase().includes(lowerQuery) ||
        place.text.toLowerCase().includes(lowerQuery)
    );
    this.filteredPlaces.set(filtered);
  }
}
