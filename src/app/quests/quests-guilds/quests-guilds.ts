import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-quests-guilds',
  imports: [CommonModule, FormsModule],
  templateUrl: './quests-guilds.html',
  styleUrl: './quests-guilds.css'
})
export class QuestsGuilds implements OnInit {
  @Input() adventurerName = '';
  @Input() currentGuild = '';
  @Output() guildUpdated = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  guilds: string[] = [];
  loading = false;
  joining = false;
  joinSuccessGuild = '';
  joinSuccessVisible = false;

  createDialogVisible = false;
  newGuildName = '';
  closing = false;

  constructor(private questService: QuestService) {}

  ngOnInit() {
    this.loadGuilds();
  }

  loadGuilds() {
    this.loading = true;
    this.questService.getGuilds().subscribe({
      next: (response) => {
        this.guilds = response.guilds ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  joinGuild(guildName: string) {
    if (!this.adventurerName || this.joining) return;
    this.joining = true;
    this.questService.updateGuild(this.adventurerName, guildName).subscribe({
      next: (response) => {
        this.joining = false;
        if (response.success) {
          this.joinSuccessGuild = guildName;
          this.joinSuccessVisible = true;
        }
      },
      error: () => { this.joining = false; }
    });
  }

  dismissJoinSuccess() {
    this.joinSuccessVisible = false;
    this.guildUpdated.emit(this.joinSuccessGuild);
  }

  openCreateDialog() {
    this.newGuildName = '';
    this.createDialogVisible = true;
  }

  dismissCreateDialog() {
    this.createDialogVisible = false;
  }

  confirmCreate() {
    const name = this.newGuildName.trim();
    if (!name) return;
    this.createDialogVisible = false;
    this.joinGuild(name);
  }

  close() {
    this.closing = true;
    setTimeout(() => this.closed.emit(), 220);
  }
}
