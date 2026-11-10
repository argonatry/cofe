// Галерея: на десктопе вертикальный скролл двигает ленту горизонтально,
// фото внутри рамок слегка смещаются (параллакс). На телефоне — обычный свайп.
export function initGallery(env) {
  const { gsap } = window;
  const section = document.querySelector('.gallery');
  if (!section || !env.desktop) return null;

  const track = section.querySelector('.gallery__track');
  section.classList.add('is-horizontal');
  track.scrollLeft = 0;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: 'top top',
      end: () => '+=' + distance(),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray('.shot__frame', section).forEach((frame) => {
    gsap.fromTo(frame.querySelector('img'), { xPercent: -7, scale: 1.16 }, {
      xPercent: 7,
      scale: 1.16,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        containerAnimation: scroll,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    });
  });

  return () => section.classList.remove('is-horizontal');
}
