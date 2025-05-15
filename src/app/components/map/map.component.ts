import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
export class MapComponent implements AfterViewInit {
  private mapSvc = inject(MapService);
  private dataSvc = inject(DataService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      const places = this.dataSvc.places();
      this.mapSvc.initMap('map', places);
    }, 0);
  }
}
