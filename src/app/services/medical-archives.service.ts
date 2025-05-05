// src/app/medical-archives.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicalArchivesService {
  private apiUrl = 'http://localhost:8088/spr01/HealthReport/medical-reports'; // L'URL de ton API backend

  constructor(private http: HttpClient) {}

  // Méthode pour uploader un rapport médical
  uploadReport(file: File, playerName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('playerName', playerName);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Méthode pour récupérer la liste des rapports (dossiers des joueurs)
  getReportsList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  // Méthode pour télécharger un rapport médical
  downloadReport(player: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${player}/${filename}`, {
      headers: new HttpHeaders(),
      responseType: 'blob',
    });
  }
}
