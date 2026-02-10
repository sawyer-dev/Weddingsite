import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { ConnectionsGame } from '../connections/connections-game';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, Navbar, ConnectionsGame],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage {
  showHiddenSection = false;
  scrollCount = 0;
  touchStartY = 0;
  // Fixed badge numbers to display when an icon is clicked
  fixedBadgeNumbers: { home: number; hidden: number; rsvp: number; info: number; timeline: number; photo: number } = {
    hidden: 0,
    home: 6,
    rsvp: 0,
    info: 1,
    timeline: 1,
    photo: 8
  };

  // Which badges are currently shown (null = not shown)
  iconBadges: { home: number | null; hidden: number | null; rsvp: number | null; info: number | null; timeline: number | null; photo: number | null } = {
    home: null,
    hidden: null,
    rsvp: null,
    info: null,
    timeline: null,
    photo: null
  };

  // Sequence of digits collected from icon clicks (max length 6)
  clickedSequence: number[] = [];

  // Secret 6-digit combination to unlock the hidden phrase. Change as needed.
  secretCombination = '060118';
  // Whether the secret phrase has been revealed
  revealed = false;
  // Message shown under the PIN UI (errors / success)
  pinMessage = '';
  // The secret phrase to reveal when the combination is correct
  secretPhrase = "Congratulations!\n\nBut your quest has only just begun.\nOpen the photo album and look carefully at Sawyer's cape while being knighted...";

  // Listen for wheel events to detect "scroll up" at the top
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0 && event.deltaY < 0) {
      this.scrollCount++;
      if (this.scrollCount >= 5) {
        this.showHiddenSection = true;
        // this.revealHiddenSection();
      }
    }
    else if (event.deltaY > 0 && this.showHiddenSection === false) {
      // Reset the count if the user scrolls down
      this.scrollCount = 0;
    }
  }

  // MOBILE HIDDEN SECITION TOGGLE
  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const currentY = event.touches[0].clientY;
    // Swipe down = currentY > touchStartY, Swipe up = currentY < touchStartY
    if (scrollTop === 0 && currentY > this.touchStartY) {
      this.scrollCount++;
      if (this.scrollCount >= 50) {
        this.showHiddenSection = true;
        // this.revealHiddenSection();
      }
    } else if (currentY < this.touchStartY) {
      this.scrollCount = 0;
      // this.showHiddenSection = false;
    }
  }

  // Listen for mobile header icon clicks dispatched from the navbar
  @HostListener('window:headerIconClicked', ['$event'])
  onHeaderIconClicked(event: Event) {
    this.showHiddenSection = true;
    // show the fixed badge for the hidden section when opened via header
    // this.iconBadges.hidden = this.fixedBadgeNumbers.hidden;
  }

  // Called when a section divider icon is clicked: show the fixed badge number
  iconClick(section: 'home' | 'hidden' | 'rsvp' | 'info' | 'timeline' | 'photo') {
    const val = this.fixedBadgeNumbers[section];
    this.iconBadges[section] = typeof val === 'number' ? val : null;
  }

  // (No JS positioning for corner icons — they are positioned by CSS inside each section.)

  // Clear the current entered sequence
  clearSequence() {
    this.clickedSequence = [];
    this.pinMessage = '';
  }

  // Submit the 6-digit combination
  submitCombination() {
    const entered = this.clickedSequence.join('');
    if (entered.length !== 6) {
      this.pinMessage = 'Please enter exactly 6 digits using the numpad.';
      return;
    }
    if (entered === this.secretCombination) {
      this.revealed = true;
      // this.pinMessage = 'Secret revealed!';
      // keep the hidden section visible
      this.showHiddenSection = true;
    } else {
      this.pinMessage = 'Incorrect combination. Try again.';
      // optionally clear after wrong attempt
      this.clickedSequence = [];
    }
  }

  // Add a digit via the on-screen numpad
  pressDigit(digit: number) {
    if (this.revealed) return;
    if (this.clickedSequence.length >= 6) return;
    if (typeof digit === 'number') {
      this.clickedSequence.push(digit);
      this.pinMessage = '';
    }
  }

  // Remove the last entered digit
  backspace() {
    if (this.revealed) return;
    this.clickedSequence.pop();
    this.pinMessage = '';
  }
}
