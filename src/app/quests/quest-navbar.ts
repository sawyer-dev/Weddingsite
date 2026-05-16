import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quest-navbar',
  standalone: true,
  templateUrl: './quest-navbar.html',
  styleUrls: ['./quest-navbar.css']
})
export class QuestNavbar {
  @Output() guildClicked = new EventEmitter<void>();
  @Output() leaderboardClicked = new EventEmitter<void>();
}
