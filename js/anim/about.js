// Про нас: слова абзаца «проявляются» по мере скролла, фото раскрываются через clip-path
// с лёгким параллаксом, цифры досчитываются.
export function initAbout(env) {
  const { gsap, SplitText } = window;
  const section = document.querySelector('.about');
  if (!section) return null;

  // 1. Слова подсвечиваются по скроллу
  const statement = section.querySelector('[data-words]');
  SplitText.create(statement, {
    type: 'words',
    autoSplit: true,
    onSplit(self) {
      return gsap.fromTo(self.words, { opacity: 0.14 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: {
          trigger: statement,
          start: 'top 82%',
          end: 'bottom 45%',
          scrub: true,
        },
      });
    },
  });

  // 2. Фото: шторка clip-path + лёгкий параллакс внутри рамки
  gsap.utils.toArray('.reveal-img', section).forEach((frame, i) => {
    const img = frame.querySelector('img');
    const from = i % 2 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)';

    gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
      .fromTo(frame, { clipPath: from }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.4,
        ease: 'power4.inOut',
        onStart: () => { frame.style.willChange = 'clip-path'; },
        onComplete: () => { frame.style.willChange = ''; },
      })
      .fromTo(img, { scale: 1.4 }, { scale: 1.14, duration: 1.6, ease: 'power3.out' }, 0);

    if (env.desktop) {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  // 3. Счётчики
  gsap.utils.toArray('[data-count]', section).forEach((el) => {
    const end = Number(el.dataset.count);
    const state = { v: 0 };
    el.textContent = '0';
    gsap.to(state, {
      v: end,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(state.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  return () => {
    section.querySelectorAll('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
  };
}
