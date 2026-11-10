const services = [
  {
    name: "Implantes <em>dentários</em>",
    image: "image 3.png",
    description:
      "Conheça as possibilidades para substituir dentes ausentes, com planejamento individualizado.",
  },
  {
    name: "Ortodontia e ortopedia funcional <em>dos maxilares</em>",
    image: "image 4.png",
    description:
      "Avaliação do alinhamento dos dentes, da mordida e do desenvolvimento dos maxilares.",
  },
  {
    name: "Odontopediatria",
    image: "image 5.png",
    description:
      "Um cuidado acolhedor para acompanhar a saúde bucal das crianças em cada fase.",
  },
  {
    name: "Clareamento dental<br><em>e facetas</em>",
    image: "image 6.png",
    description:
      "Avaliação e orientação para clarear seu sorriso com acompanhamento profissional.",
  },
  {
    name: "Laserterapia",
    image: "image 7.png",
    description:
      "Conheça as aplicações da laserterapia como recurso complementar ao tratamento odontológico.",
  },
  {
    name: "Estética <em>facial</em>",
    image: "image 8.png",
    description:
      "Uma avaliação individual para conversar sobre seus objetivos e possibilidades de cuidado.",
  },
];

const grid = document.querySelector("#services-grid");

if (grid) {
  grid.innerHTML = services
    .map(
      (service, index) => `
        <article class="service-card">
          <button
            class="service-card__front"
            type="button"
            aria-expanded="false"
            aria-controls="service-panel-${index}"
          >
            <img
              src="/assets/img/${encodeURIComponent(service.image)}"
              alt=""
              loading="lazy"
              width="360"
              height="235"
            />

            <span class="service-card__name">
              ${service.name}
            </span>
            <span class="service-card__hint">Ver detalhes +</span>
          </button>

          <div
            class="service-card__panel"
            id="service-panel-${index}"
            inert
          >
            <button class="service-card__close" type="button" aria-label="Fechar detalhes">×</button>
            <a class="service-card__schedule" href="#contato">
              Agendar
              <span aria-hidden="true">→</span>
            </a>

            <div class="service-card__info">
              <h3>${service.name}</h3>
              <p>${service.description}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  grid.querySelectorAll(".service-card").forEach((card) => {
    const button = card.querySelector(".service-card__front");
    const panel = card.querySelector(".service-card__panel");
    const close = card.querySelector('.service-card__close');

    function setOpen(open) {
      card.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      panel.inert = !open;
    }

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        setOpen(true);
      }
    });

    card.addEventListener("pointerleave", (event) => {
      if (
        event.pointerType === "mouse" &&
        !card.contains(document.activeElement)
      ) {
        setOpen(false);
      }
    });

    button.addEventListener("click", (event) => {
      setOpen(event.pointerType === 'mouse' ? true : !card.classList.contains("is-open"));
    });
    close.addEventListener('click', () => {
      button.focus({ preventScroll: true });
      setOpen(false);
    });

    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) {
        setOpen(false);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        button.focus();
        setOpen(false);
      }
    });
  });
}
