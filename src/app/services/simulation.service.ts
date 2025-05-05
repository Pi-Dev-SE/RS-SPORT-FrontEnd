import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  private apiUrl = 'http://localhost:8088/spr01/api/simulation';

  constructor(private http: HttpClient) {}

  getSimulationResult(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}
