import { ScrollTrigger } from "gsap/ScrollTrigger";

const header = document.querySelector('.header');
const toggle = header.querySelector('.menu-toggle');
const nav = header.querySelector('.nav');
const smallScreen = window.matchMedia('(max-width: 767px)');
const listeners = new AbortController();
const options = { signal: listeners.signal };
header.classList.add('has-menu');

function setOpen(open, restoreFocus = false) {
  header.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-toggle__label').textContent = open ? 'Fechar' : 'Menu';
  nav.inert = smallScreen.matches && !open;
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'), options);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) setOpen(false, true);
}, options);
document.addEventListener('pointerdown', event => {
  if (!header.contains(event.target)) setOpen(false);
}, options);
header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) setOpen(false);
}, options);
nav.addEventListener('click', event => {
  if (event.target.closest('a')) setOpen(false);
}, options);
smallScreen.addEventListener('change', () => setOpen(false), options);
setOpen(false);

// Native anchors need the scroll position of pinned sections.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const pin = ScrollTrigger.getAll().find(trigger => trigger.pin && trigger.trigger === target);
  const top = pin ? pin.start + 1 : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: 'instant' });
  history.replaceState(null, '', `#${id}`);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}, options);

document.fonts.ready.then(() => {
  if (!listeners.signal.aborted) ScrollTrigger.refresh();
});
if (import.meta.hot) import.meta.hot.dispose(() => {
  listeners.abort();
  nav.inert = false;
  header.classList.remove('has-menu', 'menu-open');
});
