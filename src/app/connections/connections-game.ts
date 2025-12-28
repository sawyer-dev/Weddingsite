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

  constructor(private cdr: ChangeDetectorRef) {
    this.initGame();
  }

  initGame() {
    this.groups = [
      { name: 'Colors', color: '#b5d682', difficulty: 0 },
      { name: 'Fruits', color: '#f7e07e', difficulty: 1 },
      { name: 'Animals', color: '#f9b5d1', difficulty: 2 },
      { name: 'Cities', color: '#b5c7f7', difficulty: 3 }
    ];
    const wordList = [
      { text: 'Red', group: 0 }, { text: 'Blue', group: 0 }, { text: 'Green', group: 0 }, { text: 'Yellow', group: 0 },
      { text: 'Apple', group: 1 }, { text: 'Banana', group: 1 }, { text: 'Lime', group: 1 }, { text: 'Grape', group: 1 },
      { text: 'Dog', group: 2 }, { text: 'Cat', group: 2 }, { text: 'Horse', group: 2 }, { text: 'Mouse', group: 2 },
      { text: 'Paris', group: 3 }, { text: 'London', group: 3 }, { text: 'Tokyo', group: 3 }, { text: 'Rome', group: 3 }
    ];
    this.words = this.shuffle(wordList).map(w => ({
      ...w,
      selected: false,
      solved: false,
      animating: false,
      focus: false
    }));
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
}