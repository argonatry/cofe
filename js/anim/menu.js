// Меню: линии прочерчиваются, названия и цены съезжаются навстречу.
// Сама анимация — CSS-переходы (см. sections.css), JS только ставит класс .is-in.
export function initMenu() {
  const { ScrollTrigger } = window;
  const groups = document.querySelectorAll('.menu__group');

  const triggers = [...groups].map((group) => {
    group.querySelectorAll('.dish').forEach((dish, i) => dish.style.setProperty('--i', i));
    return ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () => group.classList.add('is-in'),
    });
  });

  return () => {
    triggers.forEach((t) => t.kill());
    groups.forEach((g) => g.classList.add('is-in'));
  };
}
