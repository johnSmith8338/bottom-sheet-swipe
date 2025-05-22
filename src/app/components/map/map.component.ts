import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MapService } from '../../services/map.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    BottomSheetComponent,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  private mapSvc = inject(MapService);
  private dataSvc = inject(DataService);

  constructor() {
    effect(() => {
      const places = this.dataSvc.places();
      if (places.length > 0) {
        this.mapSvc.initMap('map', places);
      }
    })
  }
}
