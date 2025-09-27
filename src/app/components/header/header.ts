import { OnInit, OnDestroy } from '@angular/core';

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  menuOpen = false;
  isMobile = window.innerWidth <= 768;
  private resizeListener = () => {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.menuOpen = false;
      document.body.style.overflowX = '';
    }
  };

  ngOnInit() {
    window.addEventListener('resize', this.resizeListener);
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflowX = this.menuOpen ? 'hidden' : '';
  }

  closeMenuOnOverlay(event: Event) {
    if ((event.target as HTMLElement).classList.contains('header-container')) {
      this.menuOpen = false;
      document.body.style.overflowX = '';
    }
  }
}
