// Контакти: карта раскрывается кругом из центра, строки контактов выезжают по очереди сбоку.
export function initContacts() {
  const { gsap, ScrollTrigger } = window;
  const section = document.querySelector('.contacts');
  if (!section) return null;

  const frame = section.querySelector('.contacts__map iframe');
  gsap.fromTo(frame, { clipPath: 'circle(0% at 50% 50%)' }, {
    clipPath: 'circle(75% at 50% 50%)',
    duration: 1.5,
    ease: 'power3.inOut',
    clearProps: 'clipPath',
    scrollTrigger: { trigger: frame, start: 'top 80%', once: true },
  });

  gsap.from(section.querySelectorAll('.contacts__list li'), {
    x: -40,
    autoAlpha: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.contacts__list', start: 'top 85%', once: true },
  });

  // Плавающая кнопка Telegram появляется после первого экрана.
  const fab = document.querySelector('.fab');
  const st = ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 60%',
    onEnter: () => fab.classList.add('is-visible'),
    onLeaveBack: () => fab.classList.remove('is-visible'),
  });

  return () => {
    st.kill();
    fab.classList.remove('is-visible');
  };
}
