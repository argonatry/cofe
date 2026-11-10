// Точка входа: плагины, Lenis, прелоадер, запуск анимаций секций.
import { initSteam } from './anim/steam.js';
import { initPreloader, startCount } from './anim/preloader.js';
import { initHero } from './anim/hero.js';
import { initMarquee } from './anim/marquee.js';
import { initAbout } from './anim/about.js';
import { initProcess } from './anim/process.js';
import { initMenu } from './anim/menu.js';
import { initGallery } from './anim/gallery.js';
import { initReviews } from './anim/reviews.js';
import { initContacts } from './anim/contacts.js';
import { initFooter } from './anim/footer.js';
import { initHeadings } from './anim/headings.js';
import { initCursor } from './cursor.js';

const html = document.documentElement;
const MOTION_KEY = 'para-motion';

function savedMotion() {
  try { return localStorage.getItem(MOTION_KEY); } catch (e) { return null; }
}

// Кнопка «Вимкнути анімації»: запоминаем выбор и перезагружаем страницу.
function initMotionToggle(isReduced) {
  const btn = document.querySelector('.motion-toggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(isReduced));
  btn.querySelector('.motion-toggle__text').textContent = isReduced ? 'Увімкнути анімації' : 'Вимкнути анімації';
  btn.addEventListener('click', () => {
    try { localStorage.setItem(MOTION_KEY, isReduced ? 'on' : 'off'); } catch (e) { /* без сохранения */ }
    window.scrollTo(0, 0);
    location.reload();
  });
}

// Карта: включается по клику, чтобы не перехватывать колесо мыши.
function initMapGuard() {
  const map = document.querySelector('.contacts__map');
  if (!map) return;
  map.addEventListener('click', () => map.classList.add('is-active'));
  map.addEventListener('mouseleave', () => map.classList.remove('is-active'));
}

function showEverything() {
  html.classList.add('reduced', 'is-ready', 'is-loaded');
}

async function boot() {
  initMapGuard();

  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger || !SplitText) {
    // CDN не загрузился — оставляем статичную страницу.
    showEverything();
    initMotionToggle(true);
    return;
  }
  clearTimeout(window.__paraFailsafe);
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const saved = savedMotion();
  const osReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const userReduced = () => (saved ? saved === 'off' : osReduce.matches);
  initMotionToggle(userReduced());

  // Плавный скролл — только когда анимации включены.
  let lenis = null;
  if (!userReduced() && Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  // Счётчик прелоадера идёт, пока догружаются шрифты (SplitText меряет строки — шрифты нужны).
  if (!userReduced()) startCount();
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]);

  let introPlayed = false;
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: '(min-width: 900px)',
      mobile: '(max-width: 899px)',
      reduce: '(prefers-reduced-motion: reduce)',
      fine: '(hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const c = ctx.conditions;
      const reduce = saved ? saved === 'off' : c.reduce;
      const cleanups = [];

      if (reduce) {
        // Ветка reduced motion: движения нет, весь контент сразу виден.
        showEverything();
        cleanups.push(initSteam({ animate: false }));
        return () => cleanups.forEach((fn) => fn && fn());
      }

      html.classList.remove('reduced');
      const env = { desktop: c.desktop, mobile: c.mobile, fine: c.fine, lenis };

      // Прелоадер играет один раз; при смене брейкпоинта — сразу готовое состояние.
      let intro;
      if (!introPlayed) {
        introPlayed = true;
        if (lenis) lenis.stop();
        intro = initPreloader();
        // Шторка ушла — убираем прелоадер и разрешаем скролл (буквы hero ещё доигрывают)
        intro.call(() => {
          html.classList.add('is-loaded');
          if (lenis) lenis.start();
        }, null, 'reveal+=0.55');
      } else {
        html.classList.add('is-ready', 'is-loaded');
        intro = gsap.timeline();
        intro.addLabel('reveal', 0);
      }

      cleanups.push(
        initSteam({ animate: true, lowRes: c.mobile }),
        initHero(env, intro),
        initHeadings(env),
        initMarquee(env),
        initAbout(env),
        initProcess(env),
        initMenu(env),
        initGallery(env),
        initReviews(env),
        initContacts(env),
        initFooter(env),
        c.fine ? initCursor() : null,
      );

      return () => cleanups.forEach((fn) => fn && fn());
    },
  );

  // Картинки ленивые: после загрузки высоты меняются — пересчитываем триггеры.
  let refreshTimer;
  const queueRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', queueRefresh, { once: true });
  });
  window.addEventListener('load', queueRefresh, { once: true });
}

boot().catch((err) => {
  console.error(err);
  showEverything();
});
