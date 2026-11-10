import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector(".team");
const stack = section?.querySelector(".team__stack");

const people = [
  {
    name: "Pessoa 1",
    description:
      "Em breve, você conhecerá a trajetória, a área de atuação e os cuidados oferecidos por este profissional.",
  },
  {
    name: "Pessoa 2",
    description:
      "Em breve, você conhecerá a trajetória, a área de atuação e os cuidados oferecidos por este profissional.",
  },
  {
    name: "Pessoa 3",
    description:
      "Em breve, você conhecerá a trajetória, a área de atuação e os cuidados oferecidos por este profissional.",
  },
];

const userIcon = `
  <svg viewBox="0 0 180 210" aria-hidden="true">
    <circle cx="90" cy="48" r="43" />
    <path
      d="M60 110h60c33 0 56 26 56 58v22
         c0 11-9 20-20 20H24c-11 0-20-9-20-20v-22
         c0-32 23-58 56-58Z"
    />
  </svg>
`;

const media = gsap.matchMedia();

if (section && stack) {
  stack.innerHTML = people
    .map(
      (person) => `
        <article class="team-card">
          <span class="team-card__watermark" aria-hidden="true">
            ${person.name.toUpperCase()}
          </span>

          <div class="team-card__content">
            <h3 class="team-card__name">
              ${person.name.toUpperCase()}
            </h3>

            <p class="team-card__description">
              ${person.description}
            </p>
          </div>

          <div class="team-card__portrait" aria-hidden="true">
            ${userIcon}
          </div>
        </article>
      `
    )
    .join("");

  const cards = [...stack.querySelectorAll(".team-card")];
  const titleLines = section.querySelectorAll(".team__title > span");

  media.add(
    {
      desktop: "(min-height: 700px)",
      motion: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { desktop, motion } = context.conditions;

      if (!motion) return;

      // Celular ou tela baixa: entrada simples, sem prender a página.
      if (!desktop) {
        gsap.from(titleLines, {
          y: 24,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });

        cards.forEach((card) => {
          gsap.from(card, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              once: true,
            },
          });
        });

        return;
      }

      section.classList.add("is-stacked");

      gsap.set(cards, {
        zIndex: (index) => index + 1,
      });

      // Os próximos cards começam abaixo da tela.
      gsap.set(cards.slice(1), {
        y: () => window.innerHeight,
        autoAlpha: 0,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${section.clientHeight * cards.length * (window.innerWidth < 768 ? 0.7 : 1)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Entrada do título.
      timeline.from(titleLines, {
        y: 30,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "power3.out",
      });

      // Entrada do primeiro card.
      timeline.from(
        cards[0],
        {
          y: 70,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        0.25
      );

      // Pequeno intervalo para leitura.
      timeline.to({}, { duration: 0.35 });

      cards.slice(1).forEach((card, offset) => {
        const index = offset + 1;
        const position = timeline.duration();

        // Novo card sobe e fica um pouco abaixo do anterior.
        timeline.to(
          card,
          {
            y: index * 26,
            autoAlpha: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          position
        );

        // Os anteriores diminuem, formando a pilha.
        cards.slice(0, index).forEach((previous, previousIndex) => {
          timeline.to(
            previous,
            {
              scale: 1 - (index - previousIndex) * 0.045,
              duration: 1,
              ease: "power2.inOut",
            },
            position
          );
        });

        timeline.to({}, { duration: 0.4 });
      });

      return () => {
        section.classList.remove("is-stacked");
      };
    }
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => media.revert());
}
