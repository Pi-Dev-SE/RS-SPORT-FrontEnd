
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MedicalReportService } from '../../services/medical-report.service';
import { ActivatedRoute } from '@angular/router';
import { HealthReport } from '../../Models/HealthReport';
import { TypeStatusHealth } from '../../Models/type-status-health';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import autoTable from 'jspdf-autotable';
import { MedicalArchivesService } from '../../services/medical-archives.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent {

  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private isDrawing = false;
  constructor(private reportService: MedicalReportService,
    private route: ActivatedRoute , private medicalArchivesService: MedicalArchivesService) {}

  healthId: number | undefined;
  report: HealthReport | undefined;
  TypeStatusHealth = TypeStatusHealth;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.healthId = +id;
        this.loadReporttData(this.healthId);
      }
    });
  }

  loadReporttData(id: number) {
    this.reportService.getReportById(id).subscribe(data => {
      this.report = data;
    });
  }



  ngAfterViewInit() {
    const canvas = this.signatureCanvas.nativeElement;
    this.context = canvas.getContext('2d')!;
    this.context.strokeStyle = '#000';
    this.context.lineWidth = 2;

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.context.beginPath();
    this.context.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    this.context.lineTo(event.offsetX, event.offsetY);
    this.context.stroke();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.context.closePath();
      this.isDrawing = false;
    }
  }

  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
  }

  generatePDF() {
    const doc = new jsPDF();

    const canvas = this.signatureCanvas.nativeElement;
    const signatureImage = canvas.toDataURL('image/png');

    doc.addImage('assets/FrontOffice/images/logo.png', 'PNG', 10, 10, 20, 20);

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Report', 105, 25, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);

    // Date de génération et référence
    const generatedDate = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report generated at: ${generatedDate}`, 140, 42);
    //doc.text(`Référence: MED-${this.healthId}`, 15, 42);

    // Vérification des données
    if (!this.report) {
      doc.setFontSize(12);
      doc.text('Aucune donnée disponible.', 15, 55);
      doc.save('rapport_medical.pdf');
      return;
    }

    // Récupération des données
    const {
      firstNamePlay,
      injuryType,
      injurySeverity,
      diagnosisDate,
      expectedRecoveryDate,
      recoveryPlan,
      fitnessLevel,
      medicalNotes,
      status,
      firstNameMed
    } = this.report;

    // Informations du joueur dans un cadre élégant
    doc.setDrawColor(70, 130, 180); // Couleur bleu acier pour le cadre
    doc.setFillColor(240, 248, 255); // Couleur bleu très clair pour le fond
    doc.roundedRect(15, 50, 180, 45, 3, 3, 'FD');

    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102); // Bleu foncé pour les titres
    doc.setFont('helvetica', 'bold');
    doc.text('PLAYER INFORMATION', 105, 60, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // Noir pour le texte
    doc.setFont('helvetica', 'normal');

    const colWidth = 85;
    doc.text(`Player's name: ${firstNamePlay}`, 25, 70);
    doc.text(`Diagnosis Date: ${new Date(diagnosisDate).toLocaleDateString('fr-FR')}`, 25, 80);
    doc.text(`Actuel Status: ${status}`, 25 + colWidth, 70);
    doc.text(`Fitness Level: ${fitnessLevel}`, 25 + colWidth, 80);

    // Corps du rapport
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL SUMMARY', 105, 110, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Paragraphe principal bien formaté
    let reportText = `Following the clinical evaluation conducted on ${new Date(diagnosisDate).toLocaleDateString('en-US')}, ` +
  `player ${firstNamePlay} was diagnosed with a "${injuryType}" type injury ` +
  `of "${injurySeverity}" severity.`;

if (recoveryPlan) {
  reportText += ` A personalized recovery plan has been implemented: "${recoveryPlan}".`;
}

if (expectedRecoveryDate) {
  reportText += ` The expected recovery date is set for ${new Date(expectedRecoveryDate).toLocaleDateString('en-US')}.`;
}
const medicalDetails = `Additional medical observations indicate: ${medicalNotes}. ` +
`The player's current fitness level is assessed as "${fitnessLevel}". The general health ` +
`status is considered to be "${status}".`;

    const paragraphs = [reportText, medicalDetails];
    let yPosition = 120;

    paragraphs.forEach(paragraph => {
      const textLines = doc.splitTextToSize(paragraph, 170);
      doc.text(textLines, 20, yPosition);
      yPosition += textLines.length * 6 + 5;
    });



    // Section signature
    const signatureY = yPosition + 60;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Report prepared by:', 15, signatureY);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${firstNameMed}`, 15, signatureY + 7);

    doc.setFont('helvetica', 'normal');
    doc.text('Doctor’s Signature:', 120, signatureY);
    doc.addImage(signatureImage, 'PNG', 120, signatureY + 2, 60, 30);
    doc.line(120, signatureY + 10, 180, signatureY + 10);

    // Pied de page avec numéro de page
    doc.setFontSize(8);
    doc.text(`Page 1/1 | Référence: MED-${this.healthId}`, 105, 285, { align: 'center' });

    // Sauvegarde du document
    doc.save(`rapport_medical_${firstNamePlay.toLowerCase()}_${this.healthId}.pdf`);


  const fileName = `rapport_medical_${firstNamePlay.toLowerCase()}_${this.healthId}.pdf`;
  const pdfBlob = doc.output('blob'); // Create a Blob from the PDF data
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  // 📌 Appel du service pour uploader
  this.medicalArchivesService.uploadReport(pdfFile, firstNamePlay).subscribe({
    next: (res) => {
      console.log('Upload réussi', res);
      alert('Rapport médical enregistré avec succès !');
    },
    error: (err) => {
      console.error('Erreur lors de l\'upload', err);
      alert('Échec de l\'enregistrement du rapport médical.');
    }
  });
  }

}
