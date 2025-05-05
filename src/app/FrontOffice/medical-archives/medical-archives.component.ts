import { Component, OnInit, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { MedicalArchivesService } from 'src/app/services/medical-archives.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-archives',
  templateUrl: './medical-archives.component.html',
  styleUrls: ['./medical-archives.component.css']
})
export class MedicalArchivesComponent implements OnInit {
  // Structure de données pour stocker les archives médicales par joueur
  archives: { [key: string]: string[] } = {};

  // Dossier actuellement ouvert
  openedFolder: string | null = null;

  constructor(
    private medicalArchivesService: MedicalArchivesService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  // Récupère les clés d'un objet
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Bascule l'état d'ouverture/fermeture d'un dossier
  toggleFolder(player: string, event: MouseEvent) {
    event.stopPropagation();

    if (this.openedFolder === player) {
      this.closeFolder(event);
    } else {
      // Activer l'overlay pour assombrir le fond
      this.renderer.addClass(this.elementRef.nativeElement.querySelector('.archives-container'), 'overlay-active');
      this.openedFolder = player;
    }
  }

  // Ferme le dossier actuellement ouvert
  closeFolder(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }

    this.openedFolder = null;

    // Désactiver l'overlay
    this.renderer.removeClass(this.elementRef.nativeElement.querySelector('.archives-container'), 'overlay-active');
  }

  // Empêche la fermeture lors d'un clic à l'intérieur du popup
  onPopupClick(event: MouseEvent) {
    event.stopPropagation();
  }

  // Gestionnaire de touche Échap pour fermer le popup
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.openedFolder) {
      this.closeFolder();
    }
  }

  // Gestionnaire de clic global pour fermer le popup si on clique en dehors
  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    // Si aucun dossier n'est ouvert, rien à faire
    if (!this.openedFolder) return;

    const target = event.target as HTMLElement;

    // Si on clique sur un élément du popup ou du dossier, ne pas fermer
    if (target.closest('.file-list-container') || target.closest('.folder-icon')) {
      return;
    }

    // Si on arrive ici, on a cliqué en dehors
    this.closeFolder();
  }

  // Charge la liste des rapports depuis le service
  loadReports() {
    this.medicalArchivesService.getReportsList().subscribe({
      next: (data) => {
        this.archives = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rapports:', err);
        Swal.fire(
          'Error!',
          'Error loading reports',
          'error'
        );
      }
    });
  }

  // Télécharge un rapport spécifique
  downloadReport(player: string, filename: string, event: MouseEvent) {
    event.stopPropagation();

    this.medicalArchivesService.downloadReport(player, filename).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Création du lien de téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // Libération de l'URL objet
        setTimeout(() => URL.revokeObjectURL(url), 100);
      },
      error: (err) => {
        console.error(`Erreur lors du téléchargement du rapport ${filename}:`, err);
        Swal.fire(
          'Error!',
          'Error downloading report',
          'error'
        );
      }
    });
  }
}
