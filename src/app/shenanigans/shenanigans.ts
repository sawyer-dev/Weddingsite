import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-shenanigans',
  imports: [CommonModule, Navbar],
  templateUrl: './shenanigans.html',
  styleUrl: './shenanigans.css'
})
export class Shenanigans implements OnInit, AfterViewInit {
  constructor(private router: Router) {}
  @ViewChild('scrollAnim', { static: true }) scrollAnimRef!: ElementRef<HTMLImageElement>;

  // Provided assets
  startFrame = '/assets/images/scroll_start.png';
  endFrame = '/assets/images/scroll_end.png';
  forwardGif = '/assets/images/scroll.gif';
  reverseGif = '/assets/images/scroll_reverse.gif';

  // Default GIF play duration; adjust if needed
  gifDuration = 1500;

  isMobile = false;
  private playing = false;
  private timer: any = null;
  // touch/long-press support removed — hover retained for desktop, autoplay on mobile

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


  ngAfterViewInit() {
    // Use touch capability or viewport width to detect mobile-like environments.
    try {
      const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator && (navigator.maxTouchPoints || 0) > 0));
      const narrow = typeof window !== 'undefined' && window.innerWidth <= 768;
      this.isMobile = !!hasTouch || !!narrow;
      if (this.isMobile) {
        // autoplay once and leave at end frame
        // ensure element exists
        if (this.scrollAnimRef && this.scrollAnimRef.nativeElement) {
          this.playForward();
        }
      }
    } catch (e) {
      this.isMobile = false;
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
    // On mobile we want the animation to remain at the end frame — do not play reverse
    if (this.isMobile) return;
    const imgEl = this.scrollAnimRef.nativeElement;
    if (this.playing && !force) return;
    if (this.playing && force) {
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

  // long-press handlers removed; hover remains for desktop and autoplay remains for mobile

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
