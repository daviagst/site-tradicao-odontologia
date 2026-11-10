import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const animations = gsap.matchMedia();
animations.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('#app > *', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out',
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => animations.revert());
}
