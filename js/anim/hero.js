// Hero: буквы поднимаются как пар, при скролле — разлетаются вверх.
export function initHero(env, intro) {
  const { gsap, SplitText } = window;
  const html = document.documentElement;
  const hero = document.querySelector('.hero');
  if (!hero) return null;

  const chars = gsap.utils.toArray('.hero__char', hero);
  const inners = chars.map((c) => c.firstElementChild);
  const alreadyShown = html.classList.contains('is-ready');

  if (!alreadyShown) {
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: () => lead.revert(), // возвращаем обычный текст, чтобы он нормально переносился при ресайзе
    });

    tl.call(() => html.classList.add('is-ready'))
      .from(inners, {
        yPercent: 55,
        scaleY: 1.35,
        autoAlpha: 0,
        transformOrigin: '50% 100%',
        duration: 1.3,
        stagger: 0.09,
      }, 0.05)
      .from(lead.lines, { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.5)
      .from('.hero__actions > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.75)
      .from('.nav > *', { y: -20, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.6)
      .from('.hero__meta', { autoAlpha: 0, duration: 0.8 }, 0.9);

    intro.add(tl, 'reveal');
  }

  // Скролл: каждая буква улетает вверх со своей скоростью (на телефоне — мягче).
  const k = env.desktop ? 1 : 0.5;
  const drift = [-0.34, -0.6, -0.22, -0.48];
  const tilt = [-5, 4, -3, 6];
  gsap.to(chars, {
    y: (i) => drift[i % 4] * window.innerHeight * k,
    rotation: (i) => tilt[i % 4] * k,
    opacity: 0.12,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  gsap.to('.hero__side', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  return null;
}
