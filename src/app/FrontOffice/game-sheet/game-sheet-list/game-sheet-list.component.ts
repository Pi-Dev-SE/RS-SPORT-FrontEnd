import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSheetService } from '../../../services/game-sheet.service';
import { GameSheet } from '../../../Models/GameSheet';

@Component({
  selector: 'app-game-sheet-list',
  templateUrl: './game-sheet-list.component.html',
  styleUrls: ['./game-sheet-list.component.css']
})
export class GameSheetListComponent implements OnInit {
  gameSheets: GameSheet[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  searchTerm: string = '';
  filteredGameSheets: GameSheet[] = [];

  constructor(
    private gameSheetService: GameSheetService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGameSheets();
  }

  loadGameSheets(): void {
    this.loading = true;
    this.gameSheetService.getAllGameSheets().subscribe({
      next: (response) => {
        // Ensure we're handling the response properly, initialize as empty array if null/undefined
        this.gameSheets = Array.isArray(response) ? response : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading game sheets:', err);
        this.error = 'Failed to load game sheets. Please try again later.';
        this.loading = false;
        this.gameSheets = []; // Initialize as empty array on error
        this.applyFilters(); // Still call applyFilters to clear any previous data
      }
    });
  }

  applyFilters(): void {
    // Make sure gameSheets is an array before attempting to filter
    if (!Array.isArray(this.gameSheets)) {
      this.gameSheets = [];
    }

    // Apply search term if any
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredGameSheets = this.gameSheets.filter(sheet => 
        sheet?.homeTeam?.teamName?.toLowerCase().includes(term) || 
        sheet?.awayTeam?.teamName?.toLowerCase().includes(term)
      );
    } else {
      this.filteredGameSheets = [...this.gameSheets];
    }
    
    this.totalItems = this.filteredGameSheets.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewGameSheetDetails(gameSheetId: number | undefined): void {
    if (gameSheetId) {
      this.router.navigate(['/game-sheets/detail', gameSheetId]);
    }
  }

  editGameSheet(gameSheetId: number | undefined): void {
    if (gameSheetId) {
      this.router.navigate(['/game-sheets/edit', gameSheetId]);
    }
  }

  deleteGameSheet(gameSheetId: number | undefined): void {
    if (!gameSheetId) return;
    
    if (confirm('Are you sure you want to delete this game sheet?')) {
      this.loading = true;
      this.gameSheetService.deleteGameSheet(gameSheetId).subscribe({
        next: () => {
          this.gameSheets = this.gameSheets.filter(gs => gs.gameSheetId !== gameSheetId);
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting game sheet:', err);
          this.error = 'Failed to delete game sheet. Please try again later.';
          this.loading = false;
        }
      });
    }
  }

  addNewGameSheet(): void {
    this.router.navigate(['/game-sheets/add']);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  calculateWinner(gameSheet: GameSheet): string {
    if (!gameSheet) return 'draw';
    
    if (gameSheet.homegoal > gameSheet.awaygoal) {
      return 'home';
    } else if (gameSheet.homegoal < gameSheet.awaygoal) {
      return 'away';
    } else {
      return 'draw';
    }
  }

  getScoreClass(gameSheet: GameSheet): string {
    const winner = this.calculateWinner(gameSheet);
    return winner === 'draw' ? 'text-info' : (winner === 'home' ? 'text-success' : 'text-danger');
  }
}