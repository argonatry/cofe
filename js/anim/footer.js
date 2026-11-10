// Футер: буквы «ПАРА» поднимаются по мере того, как футер выезжает снизу (привязано к скроллу).
export function initFooter() {
  const { gsap } = window;
  const word = document.querySelector('.footer__word');
  if (!word) return null;

  gsap.from(word.querySelectorAll('.footer__char'), {
    yPercent: (i) => [70, 110, 50, 90][i % 4],
    opacity: 0.1,
    ease: 'none',
    stagger: 0.05,
    scrollTrigger: {
      trigger: word,
      start: 'top bottom',
      end: 'bottom bottom-=40',
      scrub: 0.5,
    },
  });

  return null;
}
