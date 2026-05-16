import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-service';

export interface Adventurer {
  name: string;
  xp: number;
  level: number;
  title: string;
  guild: string;
  questsCompleted: number;
}

export interface GuildSummary {
  name: string;
  totalXp: number;
  totalQuests: number;
  members: Adventurer[];
  expanded: boolean;
}

@Component({
  selector: 'app-quests-leaderboard',
  imports: [CommonModule],
  templateUrl: './quests-leaderboard.html',
  styleUrl: './quests-leaderboard.css'
})
export class QuestsLeaderboard implements OnInit {
  @Output() closed = new EventEmitter<void>();

  activeTab: 'adventurers' | 'guilds' = 'adventurers';
  loading = false;
  closing = false;

  adventurers: Adventurer[] = [];
  guilds: GuildSummary[] = [];

  constructor(private questService: QuestService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.questService.getLeaderboard().subscribe({
      next: (response) => {
        const all: Adventurer[] = (response.adventurers ?? []).map((a: any) => ({
          name: a.name ?? '',
          xp: Number(a.xp) || 0,
          level: Number(a.level) || 1,
          title: a.title ?? '',
          guild: a.guild ?? '',
          questsCompleted: Number(a.questsCompleted) || 0
        }));

        this.adventurers = [...all].sort((a, b) => b.xp - a.xp);

        const guildMap = new Map<string, GuildSummary>();
        for (const adv of all) {
          const g = adv.guild?.trim() || 'No Guild';
          if (!guildMap.has(g)) {
            guildMap.set(g, { name: g, totalXp: 0, totalQuests: 0, members: [], expanded: false });
          }
          const entry = guildMap.get(g)!;
          entry.totalXp += adv.xp;
          entry.totalQuests += adv.questsCompleted;
          entry.members.push(adv);
        }

        this.guilds = Array.from(guildMap.values())
          .filter(g => g.name !== 'No Guild')
          .sort((a, b) => b.totalXp - a.totalXp);

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleGuild(guild: GuildSummary) {
    guild.expanded = !guild.expanded;
  }

  close() {
    this.closing = true;
    setTimeout(() => this.closed.emit(), 220);
  }
}
