import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const media = gsap.matchMedia();

media.add("(prefers-reduced-motion: no-preference)", () => {
  const services = document.querySelector(".services__header");
  const clinic = document.querySelector(".clinic__heading");
  const footer = document.querySelector(".services__footer");

  let fillTitle = null;

  // SERVIÇOS: preenchimento dourado acompanhando a rolagem.
  if (services) {
    const title = services.querySelector("h2");
    const subtitle = services.querySelector("p");

    if (title) {
      fillTitle = title;
      title.classList.add("text-fill");

      gsap.fromTo(
        title,
        { "--fill": "0%" },
        {
          "--fill": "100%",
          ease: "none",
          scrollTrigger: {
            trigger: services,
            start: "top 85%",
            end: "top 50%",
            scrub: 0.6,
          },
        }
      );
    }

    if (subtitle) {
      gsap.from(subtitle, {
        y: 16,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: subtitle,
          start: "top 88%",
          once: true,
        },
      });
    }
  }

  // CLÍNICA: linhas reveladas em sequência.
  if (clinic) {
    const lines = clinic.querySelectorAll(".clinic-title-line");
    const subtitle = clinic.querySelector("p");
    const divider = clinic.querySelector(".clinic__line");

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: clinic,
        start: "top 82%",
        once: true,
      },
    });

    if (divider) {
      timeline.from(divider, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 0.7,
        ease: "power2.out",
      });
    }

    if (lines.length) {
      timeline.fromTo(
        lines,
        {
          y: 30,
          clipPath: "inset(0 -16px 100% -16px)",
        },
        {
          y: 0,
          clipPath: "inset(-16px -16px -16px -16px)",
          duration: 1.15,
          stagger: 0.22,
          ease: "power3.out",
          clearProps: "clipPath,transform",
        },
        0.2
      );
    }

    if (subtitle) {
      timeline.from(
        subtitle,
        {
          autoAlpha: 0,
          y: 10,
          filter: "blur(4px)",
          duration: 1,
          ease: "power2.out",
          clearProps: "filter",
        },
        0.75
      );
    }
  }

  // CHAMADA FINAL: título ganha presença com um zoom discreto.
  if (footer) {
    const title = footer.querySelector("h3");
    const subtitle = footer.querySelector("p");

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 85%",
        once: true,
      },
    });

    if (title) {
      timeline.from(title, {
        scale: 0.96,
        y: 18,
        autoAlpha: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "power3.out",
      });
    }

    if (subtitle) {
      timeline.from(
        subtitle,
        {
          autoAlpha: 0,
          duration: 0.9,
        },
        0.45
      );
    }
  }

  return () => {
    fillTitle?.classList.remove("text-fill");
  };
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => media.revert());
}