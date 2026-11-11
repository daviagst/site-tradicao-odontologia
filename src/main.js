import "./style.css";
import "./responsive.css";
import { gsap } from "gsap";
import "./services.js";
import "./booking.js";
import "./clinic.js"
import "./section-texts.js";
import "./team.js";
import "./closing.js";
import "./navigation.js";

const lines = [...document.querySelectorAll("#hero-title .title-line")];
const originalHTML = lines.map((line) => line.innerHTML);

// Separa as letras, preservando espaços e palavras.
lines.forEach((line) => {
  const fragment = document.createDocumentFragment();
  const parts = line.textContent.match(/\S+|\s+/g) || [];

  parts.forEach((part) => {
    if (/^\s+$/.test(part)) {
      fragment.appendChild(document.createTextNode(part));
      return;
    }

    const word = document.createElement("span");
    word.className = "hero-word";

    Array.from(part).forEach((character) => {
      const letter = document.createElement("span");
      letter.className = "hero-letter";
      letter.textContent = character;

      word.appendChild(letter);
    });

    fragment.appendChild(word);
  });

  line.replaceChildren(fragment);
});

const media = gsap.matchMedia();

media.add("(prefers-reduced-motion: no-preference)", () => {
  const entrada = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  entrada
    .from(".brand", {
      opacity: 0,
      y: -10,
      duration: 0.8,
    })
    .from(
      ".nav a",
      {
        opacity: 0,
        y: -10,
        duration: 0.8,
        stagger: 0.045,
      },
      0.15
    )
    .from(
      ".hero__eyebrow",
      {
        opacity: 0,
        y: 16,
        duration: 0.8,
      },
      0.3
    );

  let inicio = 0.5;

  lines.forEach((line) => {
    const letters = line.querySelectorAll(".hero-letter");

    if (!letters.length) return;

    entrada.fromTo(
      letters,
      {
        yPercent: 115,
        opacity: 0,
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.025,
      },
      inicio
    );

    // A próxima linha começa enquanto a anterior termina.
    inicio += letters.length * 0.045 + 0.3;
  });

  entrada.from(
    ".hero__actions .button",
    {
      opacity: 0,
      y: 18,
      duration: 0.8,
      stagger: 0.12,
      clearProps: "transform,opacity",
    },
    inicio
  );
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    media.revert();

    lines.forEach((line, index) => {
      line.innerHTML = originalHTML[index];
    });
  });
}
