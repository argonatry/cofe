// Прелоадер: вода «греется» 0→100°, шторка уходит вверх. Всего ~1.5 с.
// Счётчик стартует сразу при загрузке скрипта (startCount), пока догружаются шрифты;
// initPreloader достраивает уход шторки и появление hero.
let count = null;

export function startCount() {
  const { gsap } = window;
  const num = document.querySelector('.preloader__num');
  if (!num) return;
  const state = { v: 0 };
  count = gsap.to(state, {
    v: 100,
    duration: 0.85,
    ease: 'power2.inOut',
    onUpdate: () => { num.textContent = Math.round(state.v); },
  });
}

export function initPreloader() {
  const { gsap } = window;
  const el = document.querySelector('.preloader');
  const tl = gsap.timeline();

  if (!el) {
    tl.addLabel('reveal', 0);
    return tl;
  }

  // Ждём, пока счётчик дойдёт до 100
  const wait = count ? Math.max(0, count.duration() - count.time()) : 0;

  tl.to(el.querySelector('.preloader__inner'), { yPercent: -40, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, wait)
    .addLabel('reveal', '-=0.15')
    .to(el, { yPercent: -100, duration: 0.55, ease: 'power4.inOut' }, 'reveal');

  return tl;
}
