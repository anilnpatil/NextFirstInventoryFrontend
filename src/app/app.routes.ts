import { Routes } from '@angular/router';
import { GoogleSheetLinksComponent } from './google-sheet-links/google-sheet-links.component';
import { InventoryComponent } from './inventory/inventory.component';

export const routes: Routes = [
	{ path: '', component: GoogleSheetLinksComponent, title: 'Google Sheets | NextFirst Inventory' },
	{ path: 'inventory', component: InventoryComponent, title: 'Inventory | NextFirst Inventory' },
	{ path: '**', redirectTo: '' }
];
