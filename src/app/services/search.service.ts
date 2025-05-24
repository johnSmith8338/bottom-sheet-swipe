import { inject, Injectable, signal } from '@angular/core';
import { Place } from '../models/model';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private mapSvc = inject(MapService);
  private places = signal<Place[]>([]);
  filteredPlaces = signal<Place[]>([]);

  setPlaces(places: Place[]) {
    this.places.set(places);
    this.filteredPlaces.set(places);
  }

  filterPlaces(query: string) {
    this.mapSvc.activePlaceId.set(null); // Сбрасываем активное место
    if (!query.trim()) {
      this.filteredPlaces.set(this.places());
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.places().filter(
      (place) =>
        /**
         * можно добавить фильтрацию по другим полям
         */
        place.name.toLowerCase().includes(lowerQuery)
      // || place.address.toLowerCase().includes(lowerQuery)

    );
    this.filteredPlaces.set(filtered);
  }
}
