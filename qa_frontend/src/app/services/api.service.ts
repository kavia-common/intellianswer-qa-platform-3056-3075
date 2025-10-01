import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

export interface AskRequest {
  question: string;
}
export interface AskResponse {
  answer: string;
  id?: string;
  metadata?: any;
}

/**
 * ApiService
 * Handles RESTful interactions with the LLM backend.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // PUBLIC_INTERFACE
  /**
   * Sends a question to the backend via POST /ask
   * @param req AskRequest containing the user question
   * @returns Observable of AskResponse
   */
  ask(req: AskRequest): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.baseUrl}/ask`, req).pipe(
      catchError((err) => {
        console.error('ApiService.ask error:', err);
        return throwError(() => err);
      })
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Retrieves conversation history via GET /history
   * @returns Observable of items
   */
  history(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`).pipe(
      catchError((err) => {
        console.error('ApiService.history error:', err);
        return throwError(() => err);
      })
    );
  }
}
