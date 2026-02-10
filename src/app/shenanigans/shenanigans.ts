import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-shenanigans',
  imports: [CommonModule, Navbar],
  templateUrl: './shenanigans.html',
  styleUrl: './shenanigans.css'
})
export class Shenanigans implements OnInit {
  constructor(private router: Router) {}
  @ViewChild('scrollAnim', { static: true }) scrollAnimRef!: ElementRef<HTMLImageElement>;

  // Provided assets
  startFrame = '/assets/images/scroll_start.png';
  endFrame = '/assets/images/scroll_end.png';
  forwardGif = '/assets/images/scroll.gif';
  reverseGif = '/assets/images/scroll_reverse.gif';

  // Default GIF play duration; adjust if needed
  gifDuration = 1500;

  private playing = false;
  private timer: any = null;
  // touch/long-press support
  private touchTimer: any = null;
  private longPressed = false;
  private touchThreshold = 350; // ms required for a long-press

  ngOnInit() {
    // Preload assets
    [this.startFrame, this.endFrame, this.forwardGif, this.reverseGif].forEach(s => {
      const i = new Image();
      i.src = s;
    });

    // Ensure initial image is the start frame
    if (this.scrollAnimRef && this.scrollAnimRef.nativeElement) {
      this.scrollAnimRef.nativeElement.src = this.startFrame;
    }
  }

  playForward() {
    if (this.playing) return;
    const imgEl = this.scrollAnimRef.nativeElement;
    this.playing = true;
    imgEl.src = this.forwardGif;
    this.clearTimer();
    this.timer = setTimeout(() => {
      imgEl.src = this.endFrame;
      this.playing = false;
    }, this.gifDuration);
  }

  // playReverse(force=true) will interrupt a running forward animation
  playReverse(force = false) {
    const imgEl = this.scrollAnimRef.nativeElement;
    if (this.playing && !force) return;
    if (this.playing && force) {
      // stop ongoing forward playback and immediately play reverse
      this.clearTimer();
    }
    this.playing = true;
    imgEl.src = this.reverseGif;
    this.clearTimer();
    this.timer = setTimeout(() => {
      imgEl.src = this.startFrame;
      this.playing = false;
    }, this.gifDuration);
  }

  // Touch handlers for long-press
  onTouchStart(ev: TouchEvent) {
    // Start a timer; only trigger forward play if press lasts long enough
    if (this.touchTimer) clearTimeout(this.touchTimer);
    this.longPressed = false;
    // don't block scrolling unless they long-press
    this.touchTimer = setTimeout(() => {
      this.longPressed = true;
      this.playForward();
    }, this.touchThreshold);
  }

  onTouchEnd(ev: TouchEvent) {
    // Cancel pending long-press if it didn't reach threshold
    if (this.touchTimer) { clearTimeout(this.touchTimer); this.touchTimer = null; }
    if (this.longPressed) {
      // If long-press was active, play reverse on release (force interrupt)
      this.longPressed = false;
      this.playReverse(true);
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // Handle text input submit: accept any form of "mr moon"
  onSubmit(value: string) {
    const url = 'https://forms.gle/6LAQADbwxDaLr43N8';
    if (!value) return;
    const normalized = value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (this.isMrMoon(normalized)) {
      window.open(url, '_blank');
    }
    else {
      this.flashNope();
    }
  }

  private isMrMoon(s: string): boolean {
    if (!s) return false;
    // direct matches: "mr moon", "mister moon", "mrmoon", "mrmoon"
    if (/\bmr\s*moon\b/.test(s)) return true;
    if (/\bmister\s*moon\b/.test(s)) return true;
    if (s.replace(/\s+/g, '') === 'mrmoon' || s.replace(/\s+/g, '') === 'mistermoon') return true;
    return false;
  }

  showNope = false;
  private nopeTimer: any = null;
  private flashNope() {
    this.showNope = true;
    if (this.nopeTimer) clearTimeout(this.nopeTimer);
    this.nopeTimer = setTimeout(() => { this.showNope = false; this.nopeTimer = null; }, 1200);
  }
}
