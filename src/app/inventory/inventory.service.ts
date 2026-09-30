import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id: number;
  stockGroup: string;
  make: string;
  batchName: string;
  itemName: string;
  partNumber: string;
  quantity: number;
  rate: number | null;
  value: number | null;
  rackNumber: string;
}

export type InventoryField = Exclude<keyof InventoryItem, 'id'>;
export type InventoryFilters = Partial<Record<InventoryField, string>>;

export interface InventorySearchRequest {
  query: string;
  filters: InventoryFilters;
  page: number;
  size: number;
  sortBy: InventoryField;
  sortDirection: 'asc' | 'desc';
}

export interface InventorySearchResponse {
  content: InventoryItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'http://localhost:8080/api/inventory/search';

  search(request: InventorySearchRequest): Observable<InventorySearchResponse> {
    return this.http.post<InventorySearchResponse>(this.endpoint, request);
  }
}