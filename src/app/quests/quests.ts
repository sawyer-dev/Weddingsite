import { Component } from '@angular/core';
import { QuestService } from './quest-service';
import { CommonModule } from '@angular/common';
import { QuestNavbar } from './quest-navbar';
import { QuestsGuilds } from './quests-guilds/quests-guilds';
import { QuestsLeaderboard } from './quests-leaderboard/quests-leaderboard';

@Component({
  selector: 'app-quests',
  imports: [CommonModule, QuestNavbar, QuestsGuilds, QuestsLeaderboard],
  templateUrl: './quests.html',
  styleUrls: ['./quests.css']
})
export class Quests {

  quest: string | null = null;
  questId: string | null = null;
  questXp: number | null = null;
  questRarity: string | null = null;
  loading = false;
  loadingText = 'Seeking adventure...';
  adventurerLoading = false;
  adventurerName: string | null = null;
  adventurerXp = 0;
  adventurerLevel = 1;
  adventurerTitle = 'New Arrival';
  adventurerGuild = '';
  adventurerQuestsCompleted = 0;
  proofLinkClicked = false;
  showGuildsPanel = false;
  showLeaderboardPanel = false;
  private adventurerReady = false;

  // Dialog state
  dialogVisible = false;
  dialogType: 'alert' | 'prompt' | 'confirm' = 'alert';
  dialogTitle = '';
  dialogMessage = '';
  dialogHighlight = '';
  dialogInput = '';
  dialogInputPlaceholder = '';
  private dialogCallback: ((value: string | null) => void) | null = null;

  private readonly XP_THRESHOLDS = [0, 20, 45, 75, 110, 150, 195, 245, 300, 360, 425, 495, 570, 650, 735, 825, 920, 1020, 1125, 1235];

  get xpPercent(): number {
    const idx = Math.max(0, Math.min(this.adventurerLevel - 1, this.XP_THRESHOLDS.length - 1));
    const current = this.XP_THRESHOLDS[idx];
    const next = this.XP_THRESHOLDS[idx + 1];
    if (next === undefined) return 100;
    return Math.min(100, Math.max(0, ((this.adventurerXp - current) / (next - current)) * 100));
  }

  get xpToNext(): number | null {
    const idx = Math.max(0, Math.min(this.adventurerLevel - 1, this.XP_THRESHOLDS.length - 1));
    return this.XP_THRESHOLDS[idx + 1] ?? null;
  }

  get adventurerTier(): string {
    if (this.adventurerLevel >= 16) return 'tier-legendary';
    if (this.adventurerLevel >= 11) return 'tier-epic';
    if (this.adventurerLevel >= 7)  return 'tier-rare';
    if (this.adventurerLevel >= 4)  return 'tier-uncommon';
    return '';
  }

  constructor(private questService: QuestService) {
    // Check if the adventurer name exists in localStorage
    const storedName = localStorage.getItem('adventurerName');
    if (storedName) {
      this.adventurerName = storedName;
      this.adventurerLoading = true;
      this.loadAdventurer(storedName);
    } else {
      this.promptForName();
    }
  }

  promptForName() {
    this.showPrompt(
      'Enter Thy Name',
      'What shall we call thee, adventurer?',
      'Thy name...',
      (name) => {
        if (name?.trim()) {
          this.adventurerName = name.trim();
          localStorage.setItem('adventurerName', name.trim());
          this.loadAdventurer(name.trim());
        }
      }
    );
  }

  loadAdventurer(name: string) {
    console.log('loadAdventurer: calling addAdventurer for', name);
    this.questService.addAdventurer(name).subscribe({
      next: (response) => {
        console.log('addAdventurer response:', response);
        if (response.success && response.adventurer) {
          const a = response.adventurer;
          this.adventurerXp = a.xp ?? 0;
          this.adventurerLevel = a.level ?? 1;
          this.adventurerTitle = a.title ?? 'New Arrival';
          this.adventurerGuild = a.guild ?? '';
          this.adventurerQuestsCompleted = a.questsCompleted ?? 0;
          this.adventurerReady = true;
          // Restore active quest if one was already assigned
          if (a.currentQuestId) {
            this.questId = String(a.currentQuestId);
            this.quest = a.currentQuest ?? null;
            this.questXp = Number(a.currentQuestXp) || 0;
            this.questRarity = a.currentQuestRarity ?? null;
          }
        } else {
          console.error('addAdventurer returned unexpected response:', response);
        }
        this.adventurerLoading = false;
      },
      error: (err) => {
        console.error('Failed to load/create adventurer:', err);
        this.adventurerLoading = false;
      }
    });
  }

  updateName() {
    this.promptForName();
  }

  getQuest() {
    if (!this.adventurerName) return;

    this.loadingText = 'Seeking adventure...';
    this.loading = true;

    this.questService.getQuest(this.adventurerName).subscribe({
      next: (response) => {
        this.quest = response.quest ?? null;
        this.questId = response.id != null ? String(response.id) : null;
        // Use null-safe parse: distinguish missing (undefined) from a real 0
        this.questXp = response.xp !== undefined && response.xp !== null ? Number(response.xp) : 0;
        this.questRarity = response.rarity ?? null;
        this.proofLinkClicked = false;
        this.loading = false;
        console.log('Quest received — id:', this.questId, 'xp:', this.questXp, 'raw response.xp:', response.xp);
        if (this.adventurerName && this.questId !== null && this.quest) {
          const nameSnap = this.adventurerName;
          const idSnap = this.questId;
          const questSnap = this.quest;
          const xpSnap = this.questXp;
          const raritySnap = this.questRarity ?? '';
          const doUpdate = () => {
            console.log('Calling updateCurrentQuest with xp:', xpSnap);
            this.questService.updateCurrentQuest(
              nameSnap,
              idSnap,
              questSnap,
              String(xpSnap),
              raritySnap
            ).subscribe({
              next: (r) => { console.log('updateCurrentQuest response:', r); if (!r.success) console.error('updateCurrentQuest failed:', r); },
              error: (err) => console.error('Failed to update current quest in adventurer sheet:', err)
            });
          };
          if (this.adventurerReady) {
            doUpdate();
          } else {
            // Adventurer API call may still be in-flight; wait briefly then retry
            setTimeout(doUpdate, 3000);
          }
        }
      },
      error: () => {
        this.showAlert('Something Went Wrong', 'Could not retrieve a quest. Please try again.');
        this.loading = false;
      }
    });
  }

  abandonQuest() {
    if (!this.quest || !this.questId) return;
    this.showConfirm(
      'Forsake Thy Quest?',
      'The quest shall be returned to the quest board, and thy deeds left unrecorded.',
      () => this.doAbandonQuest()
    );
  }

  private doAbandonQuest() {
    if (!this.quest || !this.questId) return;

    this.loadingText = 'Returning the quest to the board...';
    this.loading = true;

    this.questService.abandonQuest(this.questId).subscribe({
      next: (response) => {
        this.showAlert('Quest Abandoned', 'Thy quest has been relinquished. May the next path prove more worthy of thy valor.');
        this.quest = null;
        this.questId = null;
        this.questXp = null;
        this.questRarity = null;
        this.proofLinkClicked = false;
        this.loading = false;
        if (this.adventurerName) {
          this.questService.abandonQuestAdventurer(this.adventurerName).subscribe({
            error: (err) => console.error('Failed to update adventurer abandon:', err)
          });
        }
      },
      error: () => {
        this.showAlert('Something Went Wrong', 'Failed to abandon the quest. Please try again.');
        this.loading = false;
      }
    });
  }

  completeQuest() {
    if (!this.quest || !this.questId || !this.adventurerName) return;

    this.loading = true;

    this.questService.completeQuest(this.adventurerName, this.questId).subscribe({
      next: (response) => {
        if (response.success) {
          const leveledUp = response.title !== this.adventurerTitle;
          this.adventurerXp = response.newXp;
          this.adventurerLevel = response.level;
          this.adventurerTitle = response.title;
          this.adventurerQuestsCompleted = response.questsCompleted;
          this.showAlert(
            leveledUp ? 'Quest Complete — Level Up!' : 'Quest Complete!',
            leveledUp ? `You are now ${response.title}!` : `Well done, ${this.adventurerName}!`,
            `+${response.xpReward} XP`
          );
        }
        this.quest = null;
        this.questId = null;
        this.questXp = null;
        this.questRarity = null;
        this.proofLinkClicked = false;
        this.loading = false;
      },
      error: () => {
        this.showAlert('Something Went Wrong', 'Failed to record quest completion. Please try again.');
        this.loading = false;
      }
    });
  }

  onProofLinkClick() {
    setTimeout(() => { this.proofLinkClicked = true; }, 1000);
  }

  onGuildUpdated(guildName: string) {
    this.adventurerGuild = guildName;
    this.showGuildsPanel = false;
  }

  showConfirm(title: string, message: string, onConfirm: () => void) {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.dialogHighlight = '';
    this.dialogType = 'confirm';
    this.dialogCallback = (value) => { if (value === 'confirm') onConfirm(); };
    this.dialogVisible = true;
  }

  showAlert(title: string, message: string, highlight = '') {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.dialogHighlight = highlight;
    this.dialogType = 'alert';
    this.dialogCallback = null;
    this.dialogVisible = true;
  }

  showPrompt(title: string, message: string, placeholder: string, callback: (value: string | null) => void) {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.dialogInputPlaceholder = placeholder;
    this.dialogInput = '';
    this.dialogHighlight = '';
    this.dialogType = 'prompt';
    this.dialogCallback = callback;
    this.dialogVisible = true;
  }

  dismissDialog() {
    this.dialogVisible = false;
    if (this.dialogCallback) {
      this.dialogCallback(null);
      this.dialogCallback = null;
    }
  }

  confirmDialog() {
    this.dialogVisible = false;
    const cb = this.dialogCallback;
    this.dialogCallback = null;
    if (cb) cb(this.dialogType === 'prompt' ? this.dialogInput : 'confirm');
  }

  updateGuild() {
    if (!this.adventurerName) return;
    this.showGuildsPanel = true;
  }

}
