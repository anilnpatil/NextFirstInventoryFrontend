import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GoogleSheetLink, GoogleSheetLinkService } from './google-sheet-link.service';

@Component({
  selector: 'app-google-sheet-links',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './google-sheet-links.component.html',
  styleUrl: './google-sheet-links.component.scss'
})
export class GoogleSheetLinksComponent implements OnInit {
  private readonly linkService = inject(GoogleSheetLinkService);

  protected readonly links = signal<GoogleSheetLink[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isSyncing = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly addMessage = signal('');
  protected readonly addError = signal('');
  protected readonly syncMessage = signal('');
  protected readonly syncError = signal('');
  protected name = '';
  protected url = '';

  ngOnInit(): void {
    this.loadLinks();
  }

  protected loadLinks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.linkService.findAll().subscribe({
      next: (links) => {
        this.links.set(links);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('We could not load your saved sheets. Check that the API is running.');
        this.isLoading.set(false);
      }
    });
  }

  protected addLink(): void {
    const name = this.name.trim();
    const url = this.url.trim();
    if (!name || !url || this.isSaving()) return;

    this.isSaving.set(true);
    this.addMessage.set('');
    this.addError.set('');
    this.errorMessage.set('');
    this.linkService.add(name, url).subscribe({
      next: (link) => {
        this.links.update((links) => [link, ...links]);
        this.name = '';
        this.url = '';
        this.addMessage.set('Success: Google Sheet tab connected.');
        this.isSaving.set(false);
      },
      error: (error: { error?: { detail?: string; message?: string } | string }) => {
        this.addError.set(this.apiErrorMessage(error, 'That sheet could not be saved.'));
        this.isSaving.set(false);
      }
    });
  }

  protected removeLink(link: GoogleSheetLink): void {
    if (this.deletingId() !== null) return;

    this.deletingId.set(link.id);
    this.errorMessage.set('');
    this.linkService.delete(link.id).subscribe({
      next: () => {
        this.links.update((links) => links.filter((item) => item.id !== link.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('The sheet could not be removed. Please try again.');
        this.deletingId.set(null);
      }
    });
  }

  protected loadInventoryData(): void {
    if (this.isSyncing() || this.links().length === 0) return;

    this.isSyncing.set(true);
    this.syncMessage.set('');
    this.syncError.set('');
    this.errorMessage.set('');
    this.linkService.loadInventoryData().subscribe({
      next: (result) => {
        this.syncMessage.set(
          `Success: loaded ${result.loadedItems} inventory items from ${result.loadedSheets} sheets.`
        );
        this.isSyncing.set(false);
      },
      error: (error: { error?: { detail?: string; message?: string } }) => {
        this.syncError.set(this.apiErrorMessage(error, 'Inventory data could not be loaded.'));
        this.isSyncing.set(false);
      }
    });
  }

  private apiErrorMessage(
    error: { error?: { detail?: string; message?: string } | string },
    fallback: string
  ): string {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (error.error && typeof error.error === 'object') {
      return error.error.detail ?? error.error.message ?? fallback;
    }
    return fallback;
  }
}