// «Магнитные» кнопки: тянутся к указателю и пружинят обратно.
// Вызывается только при (hover: hover) and (pointer: fine) — на телефонах выключено.
export function initMagnetic() {
  const { gsap } = window;

  const magnets = [...document.querySelectorAll('[data-magnetic]')].map((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.3);
      my((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'transform' });
    };
  });

  return () => magnets.forEach((off) => off());
}
