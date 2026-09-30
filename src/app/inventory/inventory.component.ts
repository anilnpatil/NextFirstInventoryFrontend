import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import {
  InventoryField,
  InventoryFilters,
  InventoryItem,
  InventorySearchResponse,
  InventoryService
} from './inventory.service';

const inventoryFields: InventoryField[] = [
  'stockGroup', 'make', 'batchName', 'itemName', 'partNumber', 'quantity', 'rate', 'value', 'rackNumber'
];

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchRequests = new Subject<void>();

  protected readonly fields = inventoryFields;
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly filters = signal<InventoryFilters>({});
  protected readonly query = signal('');
  protected readonly page = signal(0);
  protected readonly pageSize = signal(25);
  protected readonly sortBy = signal<InventoryField>('itemName');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.searchRequests.pipe(
      debounceTime(220),
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set('');
      }),
      switchMap(() => this.inventoryService.search({
        query: this.query(),
        filters: this.filters(),
        page: this.page(),
        size: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection()
      }).pipe(catchError(() => {
        this.errorMessage.set('Inventory could not be loaded. Check the API connection and retry.');
        return of(null);
      }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((result) => {
      if (result) this.applyResult(result);
      this.isLoading.set(false);
    });

    this.refresh();
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(0);
    this.refresh();
  }

  protected setFilter(field: InventoryField, value: string): void {
    this.filters.update((filters) => ({ ...filters, [field]: value }));
    this.page.set(0);
    this.refresh();
  }

  protected sort(field: InventoryField): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }
    this.refresh();
  }

  protected changePage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.page.set(page);
    this.refresh();
  }

  protected changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(0);
    this.refresh();
  }

  protected clearFilters(): void {
    this.query.set('');
    this.filters.set({});
    this.page.set(0);
    this.refresh();
  }

  protected label(field: InventoryField): string {
    const labels: Record<InventoryField, string> = {
      stockGroup: 'Stock Group', make: 'Make', batchName: 'Batch Name', itemName: 'Item Name', partNumber: 'Part No.',
      quantity: 'Quantity', rate: 'Rate', value: 'Value', rackNumber: 'Rack No'
    };
    return labels[field];
  }

  protected firstVisibleItem(): number {
    return this.totalElements() === 0 ? 0 : this.page() * this.pageSize() + 1;
  }

  protected lastVisibleItem(): number {
    return Math.min((this.page() + 1) * this.pageSize(), this.totalElements());
  }

  protected retry(): void {
    this.refresh();
  }

  private refresh(): void {
    this.searchRequests.next();
  }

  private applyResult(result: InventorySearchResponse): void {
    this.items.set(result.content);
    this.totalElements.set(result.totalElements);
    this.totalPages.set(result.totalPages);
    this.page.set(result.page);
  }
}