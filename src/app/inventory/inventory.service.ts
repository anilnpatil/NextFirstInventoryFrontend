import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id: number;
  description: string;
  modelNumber: string;
  partNumber: string;
  make: string;
  rackNumber: string;
  quantity: number;
  condition: string;
  location: string;
}

export type InventoryField = keyof InventoryItem;
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