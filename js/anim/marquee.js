// Бегущая строка: скорость и направление зависят от скролла.
export function initMarquee() {
  const { gsap, ScrollTrigger } = window;
  const track = document.querySelector('.marquee__track');
  if (!track) return null;

  // Дублируем группу, чтобы лента была бесшовной (-50% = ровно одна группа... из двух пар).
  const group = track.querySelector('.marquee__group');
  const clones = [];
  for (let i = 0; i < 3; i++) {
    const clone = group.cloneNode(true);
    track.appendChild(clone);
    clones.push(clone);
  }

  const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 36, repeat: -1 });
  tween.totalTime(36 * 50); // запас, чтобы лента могла ехать и назад

  let dir = 1;
  let settle;
  const st = ScrollTrigger.create({
    onUpdate(self) {
      const v = self.getVelocity();
      if (Math.abs(v) < 20) return;
      dir = v < 0 ? -1 : 1;
      const boost = Math.min(Math.abs(v) / 400, 5);
      if (settle) settle.kill();
      settle = gsap.timeline()
        .to(tween, { timeScale: dir * (1 + boost), duration: 0.2, ease: 'power1.out' })
        .to(tween, { timeScale: dir, duration: 1.2, ease: 'power2.out' });
    },
  });

  return () => {
    st.kill();
    if (settle) settle.kill();
    tween.kill();
    gsap.set(track, { clearProps: 'transform' });
    clones.forEach((c) => c.remove());
  };
}
