import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Place } from '../../models/model';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-cinema',
  standalone: true,
  imports: [],
  templateUrl: './cinema.component.html',
  styleUrl: './cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinemaComponent {
  private dataSvc = inject(DataService);
  private mapSvc = inject(MapService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  cinema = signal<Place | null>(null);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const places = this.dataSvc.places();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (places.length > 0) {
        this.isLoading.set(false);
        if (id) {
          const foundCinema = places.find(place => place.id === id) || null;
          this.cinema.set(foundCinema);
        } else {
          this.cinema.set(null);
        }
      } else {
        this.isLoading.set(true);
      }
    }, { allowSignalWrites: true });
  }

  // Метод для возврата назад
  goBack(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
