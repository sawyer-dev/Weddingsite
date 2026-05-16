import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestService {

  private apiUrl =
    'https://script.google.com/macros/s/AKfycbxGZUmopyOfLbdpw9yvOQnM55GnVtl_P0Qg5lZC7LF3nLK7wD9_ndYP2_8PYzrMkNKz/exec';

  // TODO: Replace with deployed URL after publishing WeddingQuestsAdventurerManagement script
  private adventurerApiUrl =
    'https://script.google.com/macros/s/AKfycbybZIZ9rlHL9Gy_e5q5Trn1bZU6UcAMK9c-F5fw7OU1pWsGEyGjHH-VVpcl6tbty5ZN/exec';

  constructor(private http: HttpClient) {}

  getQuest(adventurerName: string): Observable<any> {
    console.log('Sending request to:', this.apiUrl);
    const params = { adventurerName }; // Add adventurerName as a query parameter
    return this.http.get(this.apiUrl, { params, responseType: 'text' }).pipe(
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

  abandonQuest(questId: string): Observable<any> {
    const params = { action: 'abandon', questId };
    return this.http.get(this.apiUrl, { params, responseType: 'text' }).pipe(
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

  addAdventurer(adventurerName: string): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'addAdventurer', adventurerName }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  updateCurrentQuest(adventurerName: string, questId: string, quest: string, questXp: string, questRarity: string): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'updateCurrentQuest', adventurerName, questId, quest, questXp, questRarity }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  completeQuest(adventurerName: string, questId: string): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'completeQuest', adventurerName, questId }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  abandonQuestAdventurer(adventurerName: string): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'abandonQuest', adventurerName }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  updateGuild(adventurerName: string, guildName: string): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'updateGuild', adventurerName, guildName }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  getGuilds(): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'getGuilds' }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(this.adventurerApiUrl, { params: { action: 'getLeaderboard' }, responseType: 'text' }).pipe(
      map(r => { try { return JSON.parse(r); } catch { throw new Error('Parse error'); } }),
      catchError(error => { console.error('Adventurer API error:', error); throw error; })
    );
  }
}