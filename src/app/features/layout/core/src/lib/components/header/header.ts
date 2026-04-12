import { OnInit, OnDestroy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../../../features/auth/states/authFacade';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
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

  constructor(protected readonly auth: AuthService) {}

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
      this.closeMenu();
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflowX = '';
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
  }
}
