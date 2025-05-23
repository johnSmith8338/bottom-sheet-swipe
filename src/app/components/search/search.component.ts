import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private searchSvc = inject(SearchService);
  query = signal('');

  onSearch(value: string) {
    this.query.set(value);
    this.searchSvc.filterPlaces(this.query());
  }

  clearSearch() {
    this.query.set('');
    this.searchSvc.filterPlaces('');
  }
}
