import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(private httpClient: HttpClient) {}

  // Put into separate service
  postRequest(url: any, data: any): Observable<any> {
    return this.httpClient.post<any>(url, data, { withCredentials: true });
  }

  // Put into separate service
  getRequest(url: any): Observable<any> {
    return this.httpClient.get<any>(url, { withCredentials: true });
  }

  putRequest(url: any, data: any): Observable<any> {
    return this.httpClient.put<any>(url, data, { withCredentials: true });
  }
}
