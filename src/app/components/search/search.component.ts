import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements AfterViewInit {
  private searchSvc = inject(SearchService);
  private mapSvc = inject(MapService);
  query = signal('');

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  ngAfterViewInit() {
    this.updateSearchHeight();
  }

  onSearch(value: string) {
    this.query.set(value);
    this.searchSvc.filterPlaces(this.query());
  }

  clearSearch() {
    this.query.set('');
    this.searchSvc.filterPlaces('');
  }

  private updateSearchHeight() {
    if (this.searchContainer) {
      const searchHeightPx = this.searchContainer.nativeElement.offsetHeight;
      const searchHeightVh = Math.round((searchHeightPx / window.innerHeight) * 100);
      this.mapSvc.searchHeight.set(searchHeightVh);
    } else {
      console.warn('Search container not found');
      this.mapSvc.searchHeight.set(null);
    }
  }
}
