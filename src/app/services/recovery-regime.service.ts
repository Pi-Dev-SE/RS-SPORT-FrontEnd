import { Injectable } from '@angular/core';
import { RecoveryRegime } from '../Models/RecoveryRegime';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecoveryRegimeService {

  private apiUrl = 'http://localhost:8088/spr01/RecoveryRegime';
  

  constructor(private http: HttpClient) {}

 /* getRegimes(): Observable<RecoveryRegime[]> {
    return this.http.get<RecoveryRegime[]>(`${this.apiUrl}/retrieve-all-regime`);
  }*/
    getRegimes(page: number, size: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
    }
  

  addRegime(regime: RecoveryRegime): Observable<RecoveryRegime> {
    return this.http.post<RecoveryRegime>(`${this.apiUrl}/addRegime`, regime);
  }

getRegimeById(id:number): Observable<RecoveryRegime>{
   return this.http.get<RecoveryRegime> (`${this.apiUrl}/retrieve-regime/${id}`)
}
updateRegime(id: number, report: RecoveryRegime): Observable<RecoveryRegime> {
  return this.http.put<RecoveryRegime>(`${this.apiUrl}/update-regime/${id}`, report);
}


  deleteRegime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-regime/${id}`);
  }
  getRemainingDay(id:number): Observable<number>{
    return this.http.get<number>(`${this.apiUrl}/dayRemaining/${id}`);
  }
}
