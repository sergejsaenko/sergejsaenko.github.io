
import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements AfterViewInit {
  ngAfterViewInit() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    const deactivateNav = () => {
      nav?.classList.remove('nav-active');
      nav?.classList.remove('glass_effect');
      navLinks.forEach((link) => {
        (link as HTMLElement).style.animation = '';
      });
      burger?.classList.remove('toggle');
    };

    burger?.addEventListener('click', () => {
      nav?.classList.toggle('nav-active');
      nav?.classList.toggle('glass_effect');

      navLinks.forEach((link, index) => {
        const el = link as HTMLElement;
        if (el.style.animation) {
          el.style.animation = '';
        } else {
          el.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
      });

      burger.classList.toggle('toggle');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        deactivateNav();
      }
    });
  }
}
