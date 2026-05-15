import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestService {

  private apiUrl =
    'https://script.google.com/macros/s/AKfycbxsWvZ-40OMl2GH8ktbHeU81Wb0ieuOPSzHno5lbLEf3R-fXC7TVc6ecOslsJYneT0/exec';

  constructor(private http: HttpClient) {}

  getQuest(): Observable<any> {
    console.log('Sending request to:', this.apiUrl);
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map(response => {
        console.log('Raw response:', response);
        try {
          return JSON.parse(response);
        } catch (error) {
          console.error('Failed to parse response as JSON:', response);
          throw error;
        }
      }),
      tap(parsedResponse => console.log('Parsed response:', parsedResponse)),
      catchError(error => {
        console.error('Error occurred:', error);
        throw error;
      })
    );
  }
}