import { Component } from '@angular/core';
import { QuestService } from './quest-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quests',
  imports: [CommonModule],
  templateUrl: './quests.html',
  styleUrls: ['./quests.css']
})
export class Quests {

  quest: string | null = null;
  loading = false;

  constructor(private questService: QuestService) {}

  getQuest() {
    this.loading = true;

    this.questService.getQuest().subscribe({
      next: (response) => {
        this.quest = response.quest;
        this.loading = false;
      },
      error: () => {
        this.quest = 'Something went wrong.';
        this.loading = false;
      }
    });
  }

}
