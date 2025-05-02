import { User } from './../Models/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthReport } from '../Models/HealthReport';

@Injectable({
  providedIn: 'root'
})
export class MedicalReportService {
  private apiUrl = 'http://localhost:8089/spr01/HealthReport';


  constructor(private http: HttpClient) {}

  getReports(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }


  getMedicalStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staffmedical`);
  }

  getPlayers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/players`);
  }

  addReport(report: HealthReport): Observable<HealthReport> {
    return this.http.post<HealthReport>(`${this.apiUrl}/addReport`, report);
  }

getReportById(id:number): Observable<HealthReport>{
   return this.http.get<HealthReport> (`${this.apiUrl}/retrieve-report/${id}`)
}
updateReport(id: number, report: HealthReport): Observable<HealthReport> {
  return this.http.put<HealthReport>(`${this.apiUrl}/update-report/${id}`, report);
}


  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-report/${id}`);
  }
}
