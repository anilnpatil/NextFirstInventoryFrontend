import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleSheetLink {
  id: number;
  name: string | null;
  url: string;
  spreadsheetId: string;
  sheetId: number;
}

export interface InventorySyncResult {
  loadedItems: number;
  loadedSheets: number;
}

@Injectable({ providedIn: 'root' })
export class GoogleSheetLinkService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'http://localhost:8080/api/google-sheets';

  findAll(): Observable<GoogleSheetLink[]> {
    return this.http.get<GoogleSheetLink[]>(this.endpoint);
  }

  add(name: string, url: string): Observable<GoogleSheetLink> {
    return this.http.post<GoogleSheetLink>(this.endpoint, { name, url });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  loadInventoryData(): Observable<InventorySyncResult> {
    return this.http.post<InventorySyncResult>('http://localhost:8080/api/inventory/sync', {});
  }
}