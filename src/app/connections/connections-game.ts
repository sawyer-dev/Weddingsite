import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

type GameState = 'playing' | 'won' | 'lost';

interface Word {
  text: string;
  group: number;
  selected: boolean;
  solved: boolean;
  animating: boolean;
  focus: boolean;
}

interface Group {
  name: string;
  color: string;
  difficulty: number; // 0 = easiest, 3 = hardest
}

@Component({
  selector: 'connections-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connections-game.html',
  styleUrls: ['./connections-game.css']
})
export class ConnectionsGame {
  words: Word[] = [];
  groups: Group[] = [];
  gridSize = 4;
  selectedIndices: number[] = [];
  foundGroups: { group: number; indices: number[]; order: number }[] = [];
  mistakes = 0;
  maxMistakes = 4;
  state: GameState = 'playing';
  shake = false;
  collapseAnimating: number[] = [];
  focusIndex = 0;
  solvedOrder = 0;
  mode: 'easy' | 'hard' = 'easy';
  lastOneAway = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.initGame();
  }

  setMode(mode: 'easy' | 'hard') {
    this.mode = mode;
    this.initGame();
  }

  initGame() {
    if (this.mode === 'easy') {
      this.groups = [
        { name: 'Citrus Fruit', color: '#f7e07e', difficulty: 0 },
        { name: 'Shades of Green', color: '#b5d682', difficulty: 1 },
        { name: 'Names That Are Also Professions', color: '#b5c7f7', difficulty: 2 },
        { name: 'Misspelled DnD Classes', color: '#f9b5d1', difficulty: 3 }
      ];
      const wordList = [
        { text: 'Lime', group: 0 }, { text: 'Orange', group: 0 }, { text: 'Mandarin', group: 0 }, { text: 'Pomelo', group: 0 },
        { text: 'Mint', group: 1 }, { text: 'Kelly', group: 1 }, { text: 'Sage', group: 1 }, { text: 'Olive', group: 1 },
        { text: 'Smith', group: 2 }, { text: 'Sawyer', group: 2 }, { text: 'Carter', group: 2 }, { text: 'Mason', group: 2 },
        { text: 'Rouge', group: 3 }, { text: 'Brad', group: 3 }, { text: 'Palladium', group: 3 }, { text: 'Clerk', group: 3 }
      ];
      this.words = this.shuffle(wordList).map(w => ({
        ...w,
        selected: false,
        solved: false,
        animating: false,
        focus: false
      }));
    } else {
      this.groups = [
        { name: 'Food/drink found at our wedding', color: '#f7e07e', difficulty: 0 },
        { name: 'Things Grace owns that are red', color: '#f9b5d1', difficulty: 1 },
        { name: 'Things Sawyer owns that are green', color: '#b5d682', difficulty: 2 },
        { name: 'Words pronounced the same in Chinese', color: '#b5c7f7', difficulty: 3 }
      ];
      const wordList = [
        { text: 'Hot dogs', group: 0 }, { text: 'Cake', group: 0 }, { text: 'Champagne', group: 0 }, { text: 'Moscow Mule', group: 0 },
        { text: 'Dress', group: 1 }, { text: 'Ring', group: 1 }, { text: 'Phone case', group: 1 }, { text: 'Wool coat', group: 1 },
        { text: 'Cloak', group: 2 }, { text: 'Leather jacket', group: 2 }, { text: 'Dice', group: 2 }, { text: 'Username', group: 2 },
        { text: 'Mango', group: 3 }, { text: 'Coffee', group: 3 }, { text: 'Pizza', group: 3 }, { text: 'Chocolate', group: 3 }
      ];
      this.words = this.shuffle(wordList).map(w => ({
        ...w,
        selected: false,
        solved: false,
        animating: false,
        focus: false
      }));
    }
    this.selectedIndices = [];
    this.foundGroups = [];
    this.mistakes = 0;
    this.state = 'playing';
    this.shake = false;
    this.collapseAnimating = [];
    this.focusIndex = 0;
    this.solvedOrder = 0;
    this.words[0].focus = true;
  }

  shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  toggleSelect(idx: number) {
    if (this.state !== 'playing' || this.words[idx].solved || this.words[idx].animating) return;
    if (this.words[idx].selected) {
      this.words[idx].selected = false;
      this.selectedIndices = this.selectedIndices.filter(i => i !== idx);
    } else if (this.selectedIndices.length < 4) {
      this.words[idx].selected = true;
      this.selectedIndices.push(idx);
    }
    this.cdr.detectChanges();
  }

  deselectAll() {
    this.selectedIndices.forEach(i => this.words[i].selected = false);
    this.selectedIndices = [];
    this.cdr.detectChanges();
  }

  canSubmit() {
    return this.selectedIndices.length === 4 && this.state === 'playing' && !this.collapseAnimating.length;
  }

  submit() {
    if (!this.canSubmit()) return;
    const groupNum = this.words[this.selectedIndices[0]].group;
    const isCorrect = this.selectedIndices.every(i => this.words[i].group === groupNum) &&
      !this.foundGroups.some(g => g.group === groupNum);

    // Check for one-away before clearing selection
    this.lastOneAway = false;
    if (!isCorrect) {
      const groupCounts: Record<number, number> = {};
      for (const i of this.selectedIndices) {
        const group = this.words[i].group;
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      }
      if (Object.values(groupCounts).includes(3)) {
        this.lastOneAway = true;
        setTimeout(() => {
          this.lastOneAway = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    }

    if (isCorrect) {
      this.collapseAnimating = [...this.selectedIndices];
      this.selectedIndices.forEach(i => {
        this.words[i].animating = true;
        this.words[i].selected = false;
      });
      this.cdr.detectChanges();
      setTimeout(() => {
        this.collapseAnimating.forEach(i => {
          this.words[i].solved = true;
          this.words[i].animating = false;
        });
        this.foundGroups.push({
          group: groupNum,
          indices: [...this.collapseAnimating],
          order: this.solvedOrder++
        });
        this.selectedIndices = [];
        this.collapseAnimating = [];
        if (this.foundGroups.length === 4) {
          this.state = 'won';
        }
        this.cdr.detectChanges();
      }, 700);
    } else {
      this.shake = true;
      setTimeout(() => {
        this.shake = false;
        this.selectedIndices.forEach(i => this.words[i].selected = false);
        this.selectedIndices = [];
        this.cdr.detectChanges();
      }, 500);
      this.mistakes++;
      if (this.mistakes >= this.maxMistakes) {
        this.state = 'lost';
        this.selectedIndices = [];
        this.cdr.detectChanges();
      }
    }
  }

  shuffleWords() {
    if (this.state !== 'playing' || this.collapseAnimating.length) return;
    const unsolved = this.words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => !w.solved)
      .map(({ i }) => i);
    const shuffled = this.shuffle(unsolved);
    let j = 0;
    for (let i = 0; i < this.words.length; i++) {
      if (!this.words[i].solved) {
        const swapIdx = shuffled[j++];
        [this.words[i], this.words[swapIdx]] = [this.words[swapIdx], this.words[i]];
      }
    }
    this.deselectAll();
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (this.state !== 'playing') return;
    const row = Math.floor(this.focusIndex / this.gridSize);
    const col = this.focusIndex % this.gridSize;
    let newIndex = this.focusIndex;
    switch (event.key) {
      case 'ArrowRight':
        newIndex = (col < this.gridSize - 1) ? this.focusIndex + 1 : this.focusIndex - col;
        break;
      case 'ArrowLeft':
        newIndex = (col > 0) ? this.focusIndex - 1 : this.focusIndex + (this.gridSize - 1 - col);
        break;
      case 'ArrowDown':
        newIndex = (row < this.gridSize - 1) ? this.focusIndex + this.gridSize : col;
        break;
      case 'ArrowUp':
        newIndex = (row > 0) ? this.focusIndex - this.gridSize : (this.gridSize * (this.gridSize - 1)) + col;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.toggleSelect(this.focusIndex);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.setFocus(newIndex);
  }

  setFocus(idx: number) {
    if (this.words[idx] && !this.words[idx].solved) {
      this.words[this.focusIndex].focus = false;
      this.focusIndex = idx;
      this.words[this.focusIndex].focus = true;
      this.cdr.detectChanges();
    }
  }

  getAriaLabel(idx: number): string {
    const w = this.words[idx];
    let label = w.text;
    if (w.selected) label += ', selected';
    if (w.solved) label += ', solved';
    return label;
  }

  getUnsolvedGroups(): { group: number; indices: number[] }[] {
    const unsolved: { [key: number]: number[] } = {};
    this.words.forEach((w, i) => {
      if (!w.solved) {
        if (!unsolved[w.group]) unsolved[w.group] = [];
        unsolved[w.group].push(i);
      }
    });
    return Object.entries(unsolved).map(([group, indices]) => ({
      group: +group,
      indices
    }));
  }

  skip() {
    if (this.state !== 'playing') return;
    this.state = 'lost';
    this.selectedIndices = [];
    this.cdr.detectChanges();
  }

  // Returns true if the game is over (win or skip/lose)
  isGameComplete(): boolean {
    return this.state === 'won' || this.state === 'lost';
  }

  playAgain(hard: boolean = false) {
    this.setMode(hard ? 'hard' : 'easy');
  }

  getWordsForGroup(gIdx: number): Word[] {
    // Collect all words (solved and unsolved) that belong to group gIdx
    return this.words.filter(w => w.group === gIdx);
  }

  getFontSize(text: string): string {
    // Clamp font size between 0.7rem and 1.1rem, scale down more for longer words
    const base = 1.1;
    const min = 0.7;
    // Find the longest word in the string
    const words = text.split(/\s+/);
    const maxWordLen = words.reduce((max, w) => Math.max(max, w.length), 0);
    // For words longer than 8, scale down more aggressively
    let size = base - Math.max(0, (maxWordLen - 8) * 0.07);
    if (size < min) size = min;
    return size + 'rem';
  }

  /**
   * Returns an array of group indices: first the ones guessed (in the order solved), then the unguessed ones (in original order)
   */
  getEndgameGroupOrder(): number[] {
    // Get the order of solved groups
    const solved = this.foundGroups
      .sort((a, b) => a.order - b.order)
      .map(fg => fg.group);
    // Add unsolved group indices
    const all = Array.from({ length: this.groups.length }, (_, i) => i);
    const unsolved = all.filter(idx => !solved.includes(idx));
    return [...solved, ...unsolved];
  }

  /**
   * Returns true if the current selection is one word away from a correct group (i.e., 3 of the same group, 1 not).
   */
  isOneAway(): boolean {
    if (this.state !== 'playing' || this.selectedIndices.length !== 4) return false;
    const groupCounts: Record<number, number> = {};
    for (const i of this.selectedIndices) {
      const group = this.words[i].group;
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    }
    // Look for a group with exactly 3 selected, and the other is not that group
    return Object.values(groupCounts).includes(3);
  }

}