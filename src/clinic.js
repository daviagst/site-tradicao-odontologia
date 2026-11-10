import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector(".clinic");
const gallery = section?.querySelector(".clinic__gallery");
const photos = gallery
  ? [...gallery.querySelectorAll(".clinic__photo")]
  : [];

const media = gsap.matchMedia();

// Touch/keyboard controls for the horizontal fallback on short screens.
let controls;
let observer;
const controller = new AbortController();
if (gallery && photos.length > 1) {
  gallery.tabIndex = 0;
  controls = document.createElement('div');
  controls.className = 'clinic__controls';
  controls.innerHTML = '<button type="button" aria-label="Foto anterior">←</button><span aria-live="polite"></span><button type="button" aria-label="Próxima foto">→</button>';
  gallery.after(controls);
  const [previous, next] = controls.querySelectorAll('button');
  const status = controls.querySelector('span');
  let current = 0;
  const update = () => {
    if (section.classList.contains('is-scroll-gallery')) return;
    const center = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
    current = photos.reduce((best, photo, index) => {
      const bounds = photo.getBoundingClientRect();
      const old = photos[best].getBoundingClientRect();
      return Math.abs(bounds.left + bounds.width / 2 - center) < Math.abs(old.left + old.width / 2 - center) ? index : best;
    }, 0);
    status.textContent = `${current + 1} / ${photos.length}`;
    previous.disabled = current === 0;
    next.disabled = current === photos.length - 1;
  };
  const go = direction => {
    const target = photos[Math.max(0, Math.min(photos.length - 1, current + direction))];
    gallery.scrollBy({ left: target.getBoundingClientRect().left + target.clientWidth / 2 - gallery.getBoundingClientRect().left - gallery.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => go(-1), { signal: controller.signal });
  next.addEventListener('click', () => go(1), { signal: controller.signal });
  gallery.addEventListener('scroll', update, { passive: true, signal: controller.signal });
  observer = new ResizeObserver(update);
  observer.observe(gallery);
  update();
}

if (section && gallery && photos.length > 1) {
  media.add(
    "(prefers-reduced-motion: no-preference) and (min-height: 650px)",
    () => {
      section.classList.add("is-scroll-gallery");

      const total = photos.length;
      const state = { position: 0 };

      // Mantém as fotos circulando entre esquerda, centro e direita.
      const wrap = gsap.utils.wrap(-total / 2, total / 2);

      gsap.set(photos, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center",
        opacity: 1,
        zIndex: 0,
      });

      // Atualizadores rápidos para acompanhar a rolagem.
      const setters = photos.map((photo) => ({
        x: gsap.quickSetter(photo, "x", "px"),
        scale: gsap.quickSetter(photo, "scale"),
        opacity: gsap.quickSetter(photo, "opacity"),
        zIndex: gsap.quickSetter(photo, "zIndex"),
      }));

      let spacing = 0;

      function render() {
        photos.forEach((photo, index) => {
          const distance = wrap(index - state.position);
          const absolute = Math.abs(distance);

          // Central maior; laterais menores.
          const scale = 1 - Math.min(absolute, 1) * 0.55;

          // Oculta as imagens que estão fora das laterais.
          const opacity =
            absolute <= 1
              ? 1
              : Math.max(0, 1 - (absolute - 1) / 0.45);

          setters[index].x(distance * spacing);
          setters[index].scale(scale);
          setters[index].opacity(opacity);
          setters[index].zIndex(Math.round(100 - absolute * 10));
        });
      }

      function measure() {
        spacing = Math.min(gallery.clientWidth * 0.34, 480);
        render();
      }

      measure();

      gsap.to(state, {
        position: total - 1,
        ease: "none",
        onUpdate: render,

        scrollTrigger: {
          trigger: section,
          start: "top top",

          // Mais fotos = mais distância de rolagem.
          end: () =>
            `+=${(total - 1) * section.clientHeight * 0.8}`,

          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
        },
      });

      // Recalcula após o carregamento das imagens.
      const refresh = () => ScrollTrigger.refresh();

      const pendingImages = [
        ...gallery.querySelectorAll("img"),
      ].filter((image) => !image.complete);

      pendingImages.forEach((image) => {
        image.addEventListener("load", refresh);
        image.addEventListener("error", refresh);
      });

      return () => {
        section.classList.remove("is-scroll-gallery");

        pendingImages.forEach((image) => {
          image.removeEventListener("load", refresh);
          image.removeEventListener("error", refresh);
        });
      };
    }
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    media.revert();
    controller.abort();
    observer?.disconnect();
    controls?.remove();
  });
}
