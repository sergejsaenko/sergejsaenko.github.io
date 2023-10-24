const navSlide = () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");
  const deactivateNav = () => {
    nav.classList.remove("nav-active");
    nav.classList.remove("glass_effect");
    navLinks.forEach((link) => {
      link.style.animation = "";
    });
    burger.classList.remove("toggle");
  };

  burger.addEventListener("click", () => {
    //Toggle Nav
    nav.classList.toggle("nav-active");
    nav.classList.toggle("glass_effect");

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

  // Listen for the window resize event & deactivate nav when size > 768px
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      deactivateNav();
    }
  });
};

navSlide();
