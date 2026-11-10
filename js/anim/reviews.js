// Відгуки: карточки прилипают стопкой (position: sticky в CSS),
// на десктопе нижняя карточка чуть уменьшается, когда на неё наезжает следующая.
export function initReviews(env) {
  const { gsap } = window;
  const cards = gsap.utils.toArray('.review');
  if (!cards.length || !env.desktop) return null;

  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.9 + i * 0.015,
      ease: 'none',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: 'top 15%',
        scrub: true,
      },
    });
  });

  return null;
}
