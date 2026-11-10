import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector(".clinic");
const gallery = section?.querySelector(".clinic__gallery");
const photos = gallery
  ? [...gallery.querySelectorAll(".clinic__photo")]
  : [];

const media = gsap.matchMedia();

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
            `+=${(total - 1) * window.innerHeight * 0.9}`,

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
  import.meta.hot.dispose(() => media.revert());
}