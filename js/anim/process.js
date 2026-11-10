// Процес: на десктопе секция «запинена», шаги сменяются по скроллу,
// каждое следующее фото «стирает» предыдущее своей фигурой clip-path.
// На телефоне — обычный список, фото просто раскрываются.
const SHAPES = [
  ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
  ['polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'],
  ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
];

export function initProcess(env) {
  const { gsap } = window;
  const section = document.querySelector('.process');
  if (!section) return null;
  const steps = gsap.utils.toArray('.step', section);

  if (!env.desktop) {
    steps.forEach((step) => {
      const media = step.querySelector('.step__media');
      gsap.fromTo(media, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: media, start: 'top 85%', once: true },
      });
    });
    return null;
  }

  section.classList.add('is-pinned');
  const stage = section.querySelector('.process__stage');
  const n = steps.length;

  steps.forEach((step, i) => {
    if (i === 0) return;
    gsap.set(step.querySelector('.step__text'), { autoAlpha: 0, yPercent: 14 });
    gsap.set(step.querySelector('.step__media'), { clipPath: SHAPES[(i - 1) % SHAPES.length][0] });
  });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      pin: true,
      start: 'top top',
      end: () => '+=' + window.innerHeight * n * 0.8,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  tl.to('.process__bar', { scaleX: 1, duration: n - 1 }, 0);

  steps.forEach((step, i) => {
    if (i === 0) return;
    const prev = steps[i - 1];
    const [, to] = SHAPES[(i - 1) % SHAPES.length];
    const at = i - 1;

    tl.to(prev.querySelector('.step__text'), { autoAlpha: 0, yPercent: -14, duration: 0.2 }, at + 0.1)
      .to(step.querySelector('.step__media'), { clipPath: to, duration: 0.5, ease: 'power1.inOut' }, at + 0.1)
      .fromTo(step.querySelector('.step__media img'), { scale: 1.3 }, { scale: 1, duration: 0.5 }, at + 0.1)
      .to(step.querySelector('.step__text'), { autoAlpha: 1, yPercent: 0, duration: 0.2 }, at + 0.4);
  });

  tl.to({}, { duration: 0.35 }); // пауза на последнем шаге перед отпусканием пина

  return () => section.classList.remove('is-pinned');
}
