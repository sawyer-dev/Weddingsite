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
      this.showHiddenSection = false;
    }
  }
}
