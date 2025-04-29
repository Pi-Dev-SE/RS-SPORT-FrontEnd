import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TacticsBoardService } from './tactics-board.service';
import { TacticsBoard } from 'src/app/core/models/TacticsBoard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenRecordingService } from './screen-recording.service';


interface Position {
  x: number;
  y: number;
}

interface PlayerIcon {
  id: number;
  jerseyNumber: number;
  jerseyColor: string;
  position: Position;
  role?: string;
}

interface Ball {
  id: number;
  position: Position;
}

@Component({
  selector: 'app-tactic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tactic.component.html',
  styleUrl: './tactic.component.css'
})
export class TacticComponent implements OnInit, AfterViewInit {
  // View states
  showListView = true;
  showDetailsView = false;

  // List View Properties
  tacticsBoards: TacticsBoard[] = [];

  // Detail View Properties
  @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private previewCtx!: CanvasRenderingContext2D;

  // Drawing properties
  isDrawingMode = false;
  currentTool = 'pen';
  currentColor = '#000000';
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  showDrawingTools = false;

  // Player Management
  players: PlayerIcon[] = [];
  opposingPlayers: PlayerIcon[] = [];
  availablePlayers: PlayerIcon[] = [];
  selectedExistingPlayer: PlayerIcon | null = null;
  newPlayer: PlayerIcon = {
    id: 0,
    jerseyNumber: 0,
    jerseyColor: 'Red',
    position: { x: 0, y: 0 },
    role: ''
  };
  playerToUpdate: PlayerIcon = {
    id: 0,
    jerseyNumber: 0,
    jerseyColor: 'Red',
    position: { x: 0, y: 0 },
    role: ''
  };
  playerToDelete: PlayerIcon = {
    id: 0,
    jerseyNumber: 0,
    jerseyColor: 'Red',
    position: { x: 0, y: 0 },
    role: ''
  };
  playerRoles: string[] = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'STRIKER'];

  // Board Management
  selectedBoard: TacticsBoard | null = null;
  newTacticsBoard = { name: '' };
  updateTacticsBoardName = '';
  deleteTacticsBoardName = '';

  // UI Controls
  showSidebar = true;
  showTacticsOptions = false;
  showTacticsBoardsList = false;
  showFormations = false;
  showFormationsListFlag = false;
  showPlayersOptions = false;
  showBalls = false;
  showAnimationOptions = false;
  showStatisticsOptions = false;
  showAddPlayerForm = false;
  showUpdatePlayerForm = false;
  showDeletePlayerForm = false;
  showAddTacticsBoardForm = false;
  showUpdateTacticsBoardForm = false;
  showDeleteTacticsBoardForm = false;

  // Field Elements
  balls: Ball[] = [];
  selectedPlayer: PlayerIcon | null = null;
  showGoalMessage: string | boolean = false;
  targetPosition: Position | null = null;
  firstPlayer: PlayerIcon | null = null;

  // Animation Control
  private isAnimationInProgress = false;
  private initialPositions: { [key: number]: Position } = {};
  currentAnimationMode: 'pass' | 'shoot' | 'run' | null = null;
  private selectedPlayerForAnimation: PlayerIcon | null = null;
  private ballAnimationInProgress = false;

  // Drag properties
  private offsetX = 0;
  private offsetY = 0;

  isRecording = false;

  constructor(
    private tacticsService: TacticsBoardService,
    private router: Router,
    private route: ActivatedRoute,
    private screenRecordingService: ScreenRecordingService
  ) {}

  ngOnInit(): void {
    this.loadTacticsBoards();

    // Check if we're viewing a specific board
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.viewBoardDetails(id);
    }
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const canvas = this.drawingCanvas?.nativeElement;
    const previewCanvas = this.previewCanvas?.nativeElement;

    if (canvas) {
      this.ctx = canvas.getContext('2d')!;
      canvas.width = 600;
      canvas.height = 400;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = this.currentColor;
    }

    if (previewCanvas) {
      this.previewCtx = previewCanvas.getContext('2d')!;
      previewCanvas.width = 600;
      previewCanvas.height = 400;
      this.previewCtx.lineWidth = 2;
      this.previewCtx.lineCap = 'round';
    }
  }

  // ========== LIST VIEW METHODS ==========
  loadTacticsBoards(): void {
    this.tacticsService.getTacticsBoards().subscribe({
      next: (boards) => this.tacticsBoards = boards,
      error: (err) => console.error('Failed to load boards:', err)
    });
  }

  viewBoardDetails(id: number): void {
    this.showListView = false;
    this.showDetailsView = true;

    this.tacticsService.getTacticsBoard(id).subscribe({
      next: (board) => {
        this.selectedBoard = board;
        this.loadPlayers(id);
        this.setupCanvas();
      },
      error: (err) => console.error('Failed to load board:', err)
    });
  }

  createNewBoard(): void {
    if (!this.newTacticsBoard.name) {
      alert('Please enter a board name.');
      return;
    }

    // Vérifier si le nom du tableau tactique est unique
    const nameExists = this.tacticsBoards.some(board =>
      board.name.toLowerCase() === this.newTacticsBoard.name.toLowerCase()
    );

    if (nameExists) {
      alert('This name already exists. Please choose another name.');
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
        this.tacticsBoards.push(board);
        this.newTacticsBoard.name = '';
        this.showAddTacticsBoardForm = false;
        this.viewBoardDetails(board.idTactic!);
      },
      error: (err) => {
        if (err.error && err.error.message && err.error.message.includes('name already exists')) {
          alert('This name already exists. Please choose another name..');
        } else {
          console.error('Failed to create board:', err);
          alert('Échec de la création du tableau tactique.');
        }
      }
    });
  }

  // ========== DETAIL VIEW METHODS ==========
  loadPlayers(boardId: number): void {
    this.tacticsService.getPlayersByTacticsBoard(boardId).subscribe({
        next: (players) => {
            this.players = players.map(p => ({
                ...p,
                position: p.position || { x: 0, y: 0 }
            }));
            // Stocker les positions actuelles comme positions initiales
            this.players.forEach(player => {
                this.initialPositions[player.jerseyNumber] = { ...player.position };
            });
        },
        error: (err) => console.error('Failed to load players:', err)
    });
}

  loadAvailablePlayers(): void {
    this.tacticsService.getAvailablePlayers().subscribe({
      next: (players) => this.availablePlayers = players,
      error: (err) => console.error('Failed to load available players:', err)
    });
  }

  selectTacticsBoard(board: TacticsBoard): void {
    if (!board || !board.idTactic) {
      console.error('Invalid board or board ID');
      return;
    }

    this.selectedBoard = board;
    this.loadPlayers(board.idTactic);
  }

  // ========== PLAYER MANAGEMENT ==========
  addPlayer(): void {
    if (!this.selectedBoard) {
      alert('Please select a tactics board first.');
      return;
    }

    if (!this.newPlayer.jerseyNumber) {
      alert('Please enter a jersey number.');
      return;
    }

    // Vérifier que le numéro de maillot est supérieur ou égal à 1
    if (this.newPlayer.jerseyNumber < 1) {
      alert('Jersey number must be greater than or equal to 1.');
      return;
    }

    if (!this.newPlayer.jerseyColor) {
      alert('Please select a jersey color.');
      return;
    }

    if (!this.selectedBoard.formation) {
      this.selectedBoard.formation = {};
    }

    const fieldWidth = 600;
    const fieldHeight = 400;
    const margin = 30;

    const x = this.newPlayer.position?.x !== undefined && this.newPlayer.position?.x !== null
      ? Math.max(margin, Math.min(this.newPlayer.position.x, fieldWidth - margin))
      : fieldWidth / 2;

    const y = this.newPlayer.position?.y !== undefined && this.newPlayer.position?.y !== null
      ? Math.max(margin, Math.min(this.newPlayer.position.y, fieldHeight - margin))
      : fieldHeight / 2;

    const playerToAdd = {
      ...this.newPlayer,
      position: { x, y }
    };

    this.selectedBoard.formation[playerToAdd.jerseyNumber.toString()] = { x, y };

    this.tacticsService.addPlayer(playerToAdd, this.selectedBoard.idTactic!).subscribe({
      next: (player) => {
        this.players.push({ ...player, position: { x, y } });
        this.updateBoardFormation();
        this.resetNewPlayerForm();
        this.storeInitialPositions();
      },
      error: (err) => alert('Failed to add player: ' + err.message)
    });
  }


  updatePlayer(): void {
    if (!this.selectedBoard?.idTactic) {
      alert('No tactics board selected');
      return;
    }

    // Vérifier que le numéro de maillot est supérieur ou égal à 1
    if (this.playerToUpdate.jerseyNumber < 1) {
      alert('Jersey number must be greater than or equal to 1.');
      return;
    }

    const playerIndex = this.players.findIndex(p => p.jerseyNumber === this.playerToUpdate.jerseyNumber);
    if (playerIndex !== -1) {
      const updatedPlayer = {
        ...this.players[playerIndex],
        jerseyColor: this.playerToUpdate.jerseyColor,
        position: this.playerToUpdate.position
      };

      this.tacticsService.updatePlayer(updatedPlayer, this.selectedBoard.idTactic).subscribe({
        next: (player) => {
          this.players[playerIndex] = player;
          this.showUpdatePlayerForm = false;
          this.updateBoardFormation();
          alert('Player updated successfully');
        },
        error: (err) => {
          console.error('Failed to update player:', err);
          alert('Failed to update player: ' + err.message);
        }
      });
    }
  }

  deletePlayer(): void {
    const number = this.playerToDelete.jerseyNumber;
    if (!number || !this.selectedBoard?.idTactic) {
      return;
    }

    // Vérifier que le numéro de maillot est supérieur ou égal à 1
    if (number < 1) {
      alert('Jersey number must be greater than or equal to 1.');
      return;
    }

    // Remove the player from the local players array
    this.players = this.players.filter(p => p.jerseyNumber !== number);

    // Update the formation in the selected board
    if (this.selectedBoard.formation) {
      delete this.selectedBoard.formation[number.toString()];
      this.tacticsService.updateTacticsBoard(this.selectedBoard.idTactic!, this.selectedBoard).subscribe({
        next: () => {
          this.showDeletePlayerForm = false;
          this.playerToDelete = {
            id: 0,
            jerseyNumber: 0,
            jerseyColor: 'Red',
            position: { x: 0, y: 0 },
            role: ''
          };
        },
        error: (err: Error) => console.error('Failed to update board formation:', err)
      });
    }
  }

  private resetNewPlayerForm(): void {
    this.newPlayer = {
      id: 0,
      jerseyNumber: 0,
      jerseyColor: 'Red',
      position: { x: 0, y: 0 },
      role: ''
    };
    this.showAddPlayerForm = false;
    this.selectedExistingPlayer = null;
  }

  onPlayerSelect(player: PlayerIcon | null): void {
    if (player) {
      this.newPlayer.jerseyNumber = player.jerseyNumber;
      this.newPlayer.role = player.role;
    } else {
      this.newPlayer.jerseyNumber = 0;
      this.newPlayer.role = '';
    }
  }

  // ========== BOARD MANAGEMENT ==========
  updateTacticsBoard(): void {
    if (!this.selectedBoard) {
      alert('Please select a tactics board first.');
      return;
    }

    if (!this.updateTacticsBoardName) {
      alert('Please enter a new name for the tactics board.');
      return;
    }

    // Vérifier si le nouveau nom est unique (sauf s'il s'agit du même tableau)
    const nameExists = this.tacticsBoards.some(board =>
      board.name.toLowerCase() === this.updateTacticsBoardName.toLowerCase() &&
      board.idTactic !== this.selectedBoard?.idTactic
    );

    if (nameExists) {
      alert('This name already exists. Please choose another name.');
      return;
    }

    const updatedBoard: TacticsBoard = {
      ...this.selectedBoard,
      name: this.updateTacticsBoardName,
      formation: this.players.reduce((acc, player) => {
        acc[player.jerseyNumber.toString()] = player.position;
        return acc;
      }, {} as { [key: string]: Position })
    };

    this.tacticsService.updateTacticsBoard(this.selectedBoard.idTactic!, updatedBoard).subscribe({
      next: () => {
        this.loadTacticsBoards();
        this.selectedBoard = updatedBoard;
        this.updateTacticsBoardName = '';
        this.showUpdateTacticsBoardForm = false;
      },
      error: (err) => alert('Update failed: ' + err.message)
    });
  }

  deleteTacticsBoard(): void {
    if (!this.selectedBoard) {
      alert('Please select a tactics board first.');
      return;
    }

    if (!this.deleteTacticsBoardName) {
      alert('Please enter the board name to confirm deletion.');
      return;
    }

    if (this.deleteTacticsBoardName !== this.selectedBoard.name) {
      alert('The entered name does not match the selected board name.');
      return;
    }

    if (this.selectedBoard.idTactic !== undefined) {
      this.tacticsService.deleteTacticsBoard(this.selectedBoard.idTactic).subscribe({
        next: () => {
          this.loadTacticsBoards();
          this.backToList();
          alert('Tactics board deleted successfully!');
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  private updateBoardFormation(): void {
    if (this.selectedBoard) {
      this.tacticsService.updateTacticsBoard(this.selectedBoard.idTactic!, this.selectedBoard).subscribe({
        error: (err) => console.error('Failed to update board formation:', err)
      });
    }
  }

  // ========== DRAWING METHODS ==========
  setDrawingMode(mode: string): void {
    this.currentTool = mode;
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = mode === 'eraser' ? 20 : 2;
    this.ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over';
  }

  toggleDrawing(): void {
    this.showDrawingTools = !this.showDrawingTools;
    this.isDrawingMode = this.showDrawingTools;
    const canvas = this.drawingCanvas.nativeElement;
    canvas.classList.toggle('active', this.isDrawingMode);
  }

  startDrawing(event: MouseEvent): void {
    if (!this.isDrawingMode) return;
    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
    this.isDrawing = true;

    if (this.currentTool === 'line' || this.currentTool === 'arrow') {
      this.previewCtx.beginPath();
      this.previewCtx.moveTo(this.lastX, this.lastY);
    }
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.isDrawingMode) return;
    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    switch (this.currentTool) {
      case 'pen':
        this.drawFreehand(currentX, currentY);
        break;
      case 'line':
        this.drawLine(currentX, currentY);
        break;
      case 'arrow':
        this.drawArrow(currentX, currentY);
        break;
      case 'eraser':
        this.erase(currentX, currentY);
        break;
    }
    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing(): void {
    if (!this.previewCtx) return;

    if (this.isDrawing) {
      if (this.currentTool === 'line' || this.currentTool === 'arrow') {
        this.ctx.drawImage(this.previewCanvas.nativeElement, 0, 0);
        this.previewCtx.clearRect(0, 0, 600, 400);
      }
    }
    this.isDrawing = false;
  }

  private drawFreehand(currentX: number, currentY: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
  }

  private drawLine(currentX: number, currentY: number): void {
    this.previewCtx.clearRect(0, 0, 600, 400);
    this.previewCtx.beginPath();
    this.previewCtx.moveTo(this.lastX, this.lastY);
    this.previewCtx.lineTo(currentX, currentY);
    this.previewCtx.stroke();
  }

  private drawArrow(currentX: number, currentY: number): void {
    this.previewCtx.clearRect(0, 0, 600, 400);
    const angle = Math.atan2(currentY - this.lastY, currentX - this.lastX);
    const headLength = 15;

    this.previewCtx.beginPath();
    this.previewCtx.moveTo(this.lastX, this.lastY);
    this.previewCtx.lineTo(currentX, currentY);

    this.previewCtx.moveTo(currentX, currentY);
    this.previewCtx.lineTo(
      currentX - headLength * Math.cos(angle - Math.PI / 6),
      currentY - headLength * Math.sin(angle - Math.PI / 6)
    );

    this.previewCtx.moveTo(currentX, currentY);
    this.previewCtx.lineTo(
      currentX - headLength * Math.cos(angle + Math.PI / 6),
      currentY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.previewCtx.stroke();
  }

  private erase(currentX: number, currentY: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  clearDrawing(): void {
    this.ctx.clearRect(0, 0,
      this.drawingCanvas.nativeElement.width,
      this.drawingCanvas.nativeElement.height);
  }

  // ========== BALL MANAGEMENT ==========
  toggleBalls(): void {
    this.showBalls = !this.showBalls;
  }

  addBall(): void {
    const newBall = {
      id: this.balls.length + 1,
      position: { x: 390, y: 255 }
    };
    this.balls.push(newBall);
  }

  deleteBall(): void {
    if (this.balls.length > 0) {
      this.balls.pop();
    }
  }

  // ========== DRAG & DROP ==========
  startDrag(event: MouseEvent, player: PlayerIcon): void {
    if (!player.position) {
      player.position = { x: 0, y: 0 };
    }
    this.selectedPlayer = player;
    this.offsetX = event.clientX - (player.position.x || 0);
    this.offsetY = event.clientY - (player.position.y || 0);
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.endDrag);
  }

  startDragBall(event: MouseEvent, ball: Ball): void {
    this.offsetX = event.clientX - ball.position.x;
    this.offsetY = event.clientY - ball.position.y;
    const dragBall = (e: MouseEvent) => this.dragBall(e, ball);
    const endDragBall = () => this.endDragBall(dragBall, endDragBall);
    document.addEventListener('mousemove', dragBall);
    document.addEventListener('mouseup', endDragBall);
  }

  private dragBall(event: MouseEvent, ball: Ball): void {
    ball.position.x = event.clientX - this.offsetX;
    ball.position.y = event.clientY - this.offsetY;
  }

  private endDragBall(dragBall: (e: MouseEvent) => void, endDragBall: () => void): void {
    document.removeEventListener('mousemove', dragBall);
    document.removeEventListener('mouseup', endDragBall);
  }

  private drag = (event: MouseEvent): void => {
    if (this.selectedPlayer && this.selectedBoard) {
      const fieldWidth = 1000;
      const fieldHeight = 600;
      const margin = 30;

      const newX = Math.max(margin, Math.min(event.clientX - this.offsetX, fieldWidth - margin));
      const newY = Math.max(margin, Math.min(event.clientY - this.offsetY, fieldHeight - margin));

      this.selectedPlayer.position.x = newX;
      this.selectedPlayer.position.y = newY;

      if (this.selectedBoard.formation) {
        this.selectedBoard.formation[this.selectedPlayer.jerseyNumber.toString()] = { x: newX, y: newY };
      }
    }
  };

  private endDrag = (): void => {
    if (this.selectedPlayer && this.selectedBoard) {
        // Mettre à jour la position initiale
        this.initialPositions[this.selectedPlayer.jerseyNumber] = {
            ...this.selectedPlayer.position
        };

        // Sauvegarder dans le backend
        this.updateBoardFormation();
    }
    this.selectedPlayer = null;
    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('mouseup', this.endDrag);
};

  // ========== POSITION MANAGEMENT ==========
  private storeInitialPositions(): void {
    this.players.forEach(player => {
      this.initialPositions[player.jerseyNumber] = { ...player.position };
    });
  }

  private resetToInitialPositions(): void {
    this.players.forEach(player => {
      const initialPosition = this.initialPositions[player.jerseyNumber];
      if (initialPosition) {
        player.position = { ...initialPosition };
      }
    });
  }

  // ========== ANIMATION METHODS ==========
  setAnimationMode(mode: 'pass' | 'shoot' | 'run'): void {
    if (this.currentAnimationMode === mode) {
      this.currentAnimationMode = null;
    } else {
      this.currentAnimationMode = mode;
    }
    this.selectedPlayerForAnimation = null;
  }

  handleFieldClick(event: MouseEvent): void {
    if (this.currentAnimationMode === 'run' && this.selectedPlayer) {
      const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
      this.targetPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      this.run(this.selectedPlayer, this.targetPosition);
      this.selectedPlayer = null;
      this.targetPosition = null;
    }
  }

  handlePlayerClick(player: PlayerIcon): void {
    if (this.currentAnimationMode === 'shoot') {
      this.moveBallToPlayer(player, () => {
        setTimeout(() => {
          this.shootToGoal(player);
        }, 700);
      });
    } else if (this.currentAnimationMode === 'run') {
      this.selectedPlayer = player;
    } else if (this.currentAnimationMode === 'pass') {
      if (!this.firstPlayer) {
        this.firstPlayer = player;
      } else {
        this.pass(this.firstPlayer, player);
        this.firstPlayer = null;
      }
    }
  }

  moveBallToPlayer(player: PlayerIcon, callback: () => void): void {
    if (this.balls.length === 0 || this.ballAnimationInProgress) return;

    this.ballAnimationInProgress = true;
    const ball = this.balls[0];
    const initialBallX = ball.position.x;
    const initialBallY = ball.position.y;

    let progress = 0;
    const moveToPlayer = () => {
      progress += 0.01;
      if (progress >= 1) {
        ball.position = { x: player.position.x, y: player.position.y };
        this.ballAnimationInProgress = false;
        callback();
        return;
      }

      ball.position.x = initialBallX + (player.position.x - initialBallX) * progress;
      ball.position.y = initialBallY + (player.position.y - initialBallY) * progress;
      requestAnimationFrame(moveToPlayer);
    };

    moveToPlayer();
  }

  shootToGoal(player: PlayerIcon): void {
    if (this.balls.length === 0 || this.ballAnimationInProgress) return;

    this.ballAnimationInProgress = true;
    const ball = this.balls[0];
    const initialBallX = ball.position.x;
    const initialBallY = ball.position.y;

    let progress = 0;
    const shootToGoal = () => {
      progress += 0.01;
      if (progress >= 1) {
        ball.position = { x: 780, y: 250 };
        this.ballAnimationInProgress = false;
        this.showGoalMessage = 'Goooool!';
        setTimeout(() => this.showGoalMessage = false, 3000);
        return;
      }

      ball.position.x = player.position.x + (580 - player.position.x) * progress;
      ball.position.y = player.position.y + (190 - player.position.y) * progress;
      requestAnimationFrame(shootToGoal);
    };

    shootToGoal();
  }

  run(player: PlayerIcon, targetPosition: Position): void {
    const startX = player.position.x;
    const startY = player.position.y;
    const endX = targetPosition.x;
    const endY = targetPosition.y;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      player.position.x = startX + (endX - startX) * progress;
      player.position.y = startY + (endY - startY) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  pass(fromPlayer: PlayerIcon, toPlayer: PlayerIcon): void {
    const ball = this.balls[0];
    ball.position = { ...toPlayer.position };
  }

  // ========== UI TOGGLES ==========
  togglePlayers(): void {
    this.showPlayersOptions = !this.showPlayersOptions;
    if (this.showPlayersOptions) {
      this.showTacticsOptions = false;
      this.showBalls = false;
      this.showAnimationOptions = false;
      this.showStatisticsOptions = false;
      this.showFormations = false;
    }
  }

  toggleTactics(): void {
    this.showTacticsOptions = !this.showTacticsOptions;
  }

  toggleAnimationsOptions(): void {
    this.showAnimationOptions = !this.showAnimationOptions;
  }

  toggleStatisticsOptions(): void {
    this.showStatisticsOptions = !this.showStatisticsOptions;
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  // ========== NAVIGATION ==========
  backToList(): void {
    this.showListView = true;
    this.showDetailsView = false;
    this.selectedBoard = null;
    this.players = [];
    this.balls = [];
    this.router.navigate(['/list']);
  }

  // ========== PAGINATION, SEARCH & SORT ==========
  currentPage: number = 1;
  pageSize: number = 6; // nombre de cartes par page
  searchQuery: string = '';
  sortOption: string = 'newest';

  // Réinitialiser la pagination lorsque la recherche ou le tri change
  onSearchChange(): void {
    this.currentPage = 1;
  }

  onSortChange(): void {
    this.currentPage = 1;
  }

  get filteredTacticsBoards() {
    return this.tacticsBoards
      .filter(board => {
        if (!this.searchQuery) return true;
        return board.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (this.sortOption === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else {
          return new Date(a.createdAt|| 0).getTime() - new Date(b.createdAt|| 0).getTime();
        }
      });
  }

  get paginatedTacticsBoards() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTacticsBoards.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTacticsBoards.length / this.pageSize);
  }

  // ========== RECORD VIDEO ==========

  async startRecording() {
    try {
      const fieldElement = document.querySelector('.football-field') as HTMLElement;
      if (!fieldElement) throw new Error('Field element not found');

      const canvas = document.createElement('canvas');
      canvas.width = fieldElement.offsetWidth;
      canvas.height = fieldElement.offsetHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      await this.screenRecordingService.startRecording(canvas);
      this.isRecording = true;

      const captureFrame = async () => {
        if (!this.isRecording) return;
        const html2canvas = (await import('html2canvas')).default;
        const fieldCanvas = await html2canvas(fieldElement, {
          logging: false,
          useCORS: true,
          allowTaint: true,
          background: false,
          ignoreElements: (el: Element) => el.classList.contains('coordinate-axis')
        } as any);
        context.drawImage(fieldCanvas, 0, 0);
        requestAnimationFrame(captureFrame);
      };

      captureFrame();
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isRecording = false;
    }
  }

  async stopRecording() {
    try {
      const recordedBlob = await this.screenRecordingService.stopRecording();
      // this.screenRecordingService.downloadRecording(recordedBlob);

      if (this.selectedBoard && this.selectedBoard.idTactic) {
        await this.screenRecordingService.uploadRecording(
          recordedBlob,
          this.selectedBoard.idTactic,
          this.players
        );
      }
      this.isRecording = false;
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
    }
  }



}
