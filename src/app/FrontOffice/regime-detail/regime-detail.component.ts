import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecoveryRegimeService } from '../../services/recovery-regime.service';
import { TypeStatusRegime } from '../../Models/type-status-regime';
import { RecoveryRegime } from '../../Models/RecoveryRegime';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-regime-detail',
  templateUrl: './regime-detail.component.html',
  styleUrl: './regime-detail.component.css'
})
export class RegimeDetailComponent {
  
  constructor(private route: ActivatedRoute,private regimeService: RecoveryRegimeService){}
  regimeId:number | undefined;
  TypeStatusRegime = TypeStatusRegime;
  regime: RecoveryRegime | undefined;
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.regimeId = +id; // Convertir en nombre
        this.loadRegimetData(this.regimeId);
      }
    });

}

loadRegimetData(id: number) {
  this.regimeService.getRegimeById(id).subscribe(data => {
    this.regime= data;
  });
}
generatePDF() {
  const doc = new jsPDF();
   
  doc.addImage('assets/FrontOffice/images/logo.png', 'PNG', 10, 10, 20, 20);
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Recovery Regime', 105, 25, { align: 'center' });
  
  doc.setLineWidth(0.5);
  doc.line(15, 35, 195, 35);
  
  // Date de génération et référence
  const generatedDate = new Date().toLocaleDateString('fr-FR');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Regime generated at: ${generatedDate}`, 140, 42);
  
  
  // Vérification des données
  if (!this.regime) {
    doc.setFontSize(12);
    doc.text('Aucune donnée disponible.', 15, 55);
    doc.save('regime_medical.pdf');
    return;
  }
  
  // Récupération des données
  const {
  firstname,
  generatedAt,
  dailyDuration,
  recommendedExercise,
  exerciseIntensity,
  dietRecommendation,
  physiotherapyRequired,
  progressTracking,
  status,
  
} = this.regime;
  
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
  doc.text(`Player's name: ${firstname}`, 25, 70);
  doc.text(`Generated Date: ${new Date(generatedAt).toLocaleDateString('fr-FR')}`, 25, 80);
  doc.text(`Actuel Status: ${status}`, 25 + colWidth, 70);
  
  
  // Corps du rapport
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.setFont('helvetica', 'bold');
  doc.text('REGIME SUMMARY', 105, 110, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  // Paragraphe principal bien formaté
 const regimeText = `The player ${firstname} has been assigned a personalized training and recovery regime as of ${new Date(generatedAt).toLocaleDateString()}. `
+ `The daily duration of the program is set to ${dailyDuration} minutes, focusing on progressive improvement. `
+ `The recommended exercises are tailored to the player's condition and should be performed with "${exerciseIntensity}" intensity. `
+ `In addition to physical activity, the player is advised to follow this dietary guideline: "${dietRecommendation}". `
+ `Physiotherapy sessions are ${physiotherapyRequired ? 'required' : 'not required'} as part of the recovery plan. `
+ `Progress is being monitored through: "${progressTracking}". `
+ `Currently, the player's overall recovery status is "${status}".`;

  
  const paragraphs = [regimeText];
  let yPosition = 120;
  
  paragraphs.forEach(paragraph => {
    const textLines = doc.splitTextToSize(paragraph, 170);
    doc.text(textLines, 20, yPosition);
    yPosition += textLines.length * 6 + 5;
  });
  
  
  
  doc.setFont('helvetica', 'normal');
  const signatureY = yPosition + 60; // Adjust the value as needed
  doc.text('Doctor’s Signature:', 120, signatureY);
  doc.line(120, signatureY + 10, 180, signatureY + 10);
  
  // Pied de page avec numéro de page
  doc.setFontSize(8);
  doc.text(`Page 1/1 | Référence: MED-${this.regimeId}`, 105, 285, { align: 'center' });
  
  // Sauvegarde du document
  doc.save(`Recovery_Regime_${firstname.toLowerCase()}_${this.regimeId}.pdf`);
}
 

}
