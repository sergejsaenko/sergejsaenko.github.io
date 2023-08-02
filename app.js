const navSlide = () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  burger.addEventListener("click", () => {
    //Toggle Nav
    nav.classList.toggle("nav-active");

    //Animate Links
    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = "";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.3
        }s`;
      }
    });

    //Burger Animation
    burger.classList.toggle("toggle");
  });
};

// JavaScript, um die .html Erweiterung aus den Links zu entfernen
window.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.endsWith(".html")) {
      link.setAttribute("href", href.slice(0, -5)); // Entfernt die letzten 5 Zeichen (.html)
    }
  });
});

navSlide();
