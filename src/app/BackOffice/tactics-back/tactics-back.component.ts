import { Component, OnInit } from '@angular/core';
import { TacticsBoardService } from '../../FrontOffice/tactic/tactics-board.service';
import { TacticsBoard } from '../../core/models/TacticsBoard';

@Component({
  selector: 'app-tactics-back',
  standalone: false,
  templateUrl: './tactics-back.component.html',
  styleUrl: './tactics-back.component.css'
})
export class TacticsBackComponent implements OnInit {
  // Tableaux tactiques
  tacticsBoards: TacticsBoard[] = [];
  selectedBoard: TacticsBoard | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;

  // Recherche et tri
  searchQuery: string = '';
  sortOption: string = 'newest';

  // Formulaires
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showDeleteConfirm: boolean = false;
  newTacticsBoard = { name: '' };
  updateTacticsBoardName: string = '';
  deleteTacticsBoardName: string = '';

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' | '' = '';

  constructor(private tacticsService: TacticsBoardService) {}

  ngOnInit(): void {
    this.loadTacticsBoards(this.currentPage);
  }

  loadTacticsBoards(page: number): void {
    const sort = this.sortOption === 'newest' ? 'desc' : 'asc';

    this.tacticsService.getTacticsBoards(page - 1, this.pageSize, this.searchQuery, sort).subscribe({
      next: (response) => {
        this.tacticsBoards = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
      },
      error: (err) => {
        this.showAlert('Error loading tactics boards', 'danger');
        console.error('Error loading tactical displayboards:', err);
      }
    });
  }

  onSearchChange(): void {
    this.loadTacticsBoards(1); // Retour à la première page lors d'une recherche
  }

  onSortChange(): void {
    this.loadTacticsBoards(this.currentPage);
  }

  selectBoard(board: TacticsBoard): void {
    this.selectedBoard = board;
    this.updateTacticsBoardName = board.name;
  }

  createNewBoard(): void {
    if (!this.newTacticsBoard.name.trim()) {
      this.showAlert('Please enter a name for the tactics board', 'warning');
      return;
    }

    const newBoard: TacticsBoard = {
      name: this.newTacticsBoard.name,
      formation: {},
      version: 1,
      createdAt: new Date()
    };

    this.tacticsService.createTacticsBoard(newBoard).subscribe({
      next: (board) => {
        this.loadTacticsBoards(this.currentPage);
        this.newTacticsBoard.name = '';
        this.showAddForm = false;
        this.showAlert('Successfully created tactics board', 'success');
      },
      error: (err) => {
        if (err.message && err.message.includes('already exists')) {
          this.showAlert('This name already exists for the tactics board', 'warning');
        } else {
          this.showAlert('Error when creating the tactics board', 'danger');
          console.error('Error when creating the tactics board:', err);
        }
      }
    });
  }

  updateTacticsBoard(): void {
    if (!this.selectedBoard) {
      this.showAlert('No tactics board selected', 'warning');
      return;
    }

    if (!this.updateTacticsBoardName.trim()) {
      this.showAlert('Please enter a name for the tactics board', 'warning');
      return;
    }

    const updatedBoard: TacticsBoard = {
      ...this.selectedBoard,
      name: this.updateTacticsBoardName
    };

    this.tacticsService.updateTacticsBoard(this.selectedBoard.idTactic!, updatedBoard).subscribe({
      next: () => {
        this.loadTacticsBoards(this.currentPage);
        this.showUpdateForm = false;
        this.selectedBoard = null;
        this.showAlert('Tactics board successfully updated', 'success');
      },
      error: (err) => {
        if (err.message && err.message.includes('already exists')) {
          this.showAlert('This name already exists for the tactics board', 'warning');
        } else {
          this.showAlert('Error updating the tactics board', 'danger');
          console.error('Error updating the tactical table:', err);
        }
      }
    });
  }

  deleteTacticsBoard(): void {
    if (!this.selectedBoard) {
      this.showAlert('No tactics board selected', 'warning');
      return;
    }

    if (this.deleteTacticsBoardName !== this.selectedBoard.name) {
      this.showAlert('The name entered does not correspond to the selected tactics board.', 'warning');
      return;
    }

    this.tacticsService.deleteTacticsBoard(this.selectedBoard.idTactic!).subscribe({
      next: () => {
        this.loadTacticsBoards(this.currentPage);
        this.showDeleteConfirm = false;
        this.selectedBoard = null;
        this.deleteTacticsBoardName = '';
        this.showAlert('The tactics board has been successfully removed', 'success');
      },
      error: (err) => {
        this.showAlert('Error when deleting the tactical board', 'danger');
        console.error('Error when deleting tactical board:', err);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTacticsBoardName = '';
  }

  cancelUpdate(): void {
    this.showUpdateForm = false;
    this.updateTacticsBoardName = '';
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newTacticsBoard.name = '';
  }

  showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
    }, 5000);
  }
}
