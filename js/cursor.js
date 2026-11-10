// Кастомный курсор с подписью и «магнитные» кнопки.
// Вызывается только при (hover: hover) and (pointer: fine) — на телефонах выключено.
// Системный курсор не прячем: точка с подписью идёт следом за ним.
export function initCursor() {
  const { gsap } = window;
  const html = document.documentElement;
  const cursor = document.querySelector('.cursor');
  if (!cursor) return null;
  const label = cursor.querySelector('.cursor__label');

  html.classList.add('has-cursor');
  cursor.classList.add('is-hidden');

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

  const onMove = (e) => {
    cursor.classList.remove('is-hidden');
    xTo(e.clientX);
    yTo(e.clientY);
  };

  const onOver = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const labelled = target && target.closest('[data-cursor]');
    const link = target && target.closest('a, button');
    if (labelled) {
      label.textContent = labelled.dataset.cursor;
      cursor.classList.add('has-label');
    } else {
      cursor.classList.remove('has-label');
    }
    cursor.classList.toggle('is-link', !labelled && !!link);
  };

  const onLeave = () => cursor.classList.add('is-hidden');

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onOver, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);

  // Магнитные кнопки: тянутся к курсору и пружинят обратно.
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

  return () => {
    html.classList.remove('has-cursor');
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    magnets.forEach((off) => off());
  };
}
