import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const year = document.querySelector("#footer-year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const media = gsap.matchMedia();

media.add("(prefers-reduced-motion: no-preference)", () => {
  const heading = document.querySelector(".testimonials__heading");

  if (heading) {
    gsap.from(heading.children, {
      y: 24,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.16,
      ease: "power3.out",

      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        once: true,
      },
    });
  }

  const photo = document.querySelector(".testimonials__photo");

  if (photo) {
    gsap.fromTo(
      photo,
      {
        clipPath: "inset(0 0 100% 0 round 24px)",
      },
      {
        clipPath: "inset(0 0 0% 0 round 24px)",
        duration: 1.2,
        ease: "power3.inOut",

        scrollTrigger: {
          trigger: photo,
          start: "top 90%",
          once: true,
        },
      }
    );
  }

  // Anima só os depoimentos que estiverem entrando na tela.
  const reviews = gsap.utils.toArray(".review");

  if (reviews.length) {
    gsap.set(reviews, {
      y: 32,
      autoAlpha: 0,
    });

    ScrollTrigger.batch(reviews, {
      start: "top 92%",
      once: true,
      interval: 0.12,

      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          overwrite: "auto",
        });
      },
    });
  }

  const footer = document.querySelector(".footer__main");

  if (footer) {
    gsap.from(footer.children, {
      y: 20,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.14,
      ease: "power3.out",

      scrollTrigger: {
        trigger: footer,
        start: "top 95%",
        once: true,
      },
    });
  }
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => media.revert());
}