// Скриншоты для самопроверки: node scripts/shots.mjs [url]
// Перед запуском поднять сервер: python -m http.server 8000
// Плавно прокручивает страницу (чтобы сработали все ScrollTrigger) и по пути снимает кадры
// на ширине 375, 768 и 1440 px. Плюс полная страница в режиме reduced motion и список ошибок консоли.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:8000/';
const outDir = 'shots';
const sizes = [
  { name: '375', width: 375, height: 740 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const size of sizes) {
  // --- С анимациями: кадры по ходу скролла ---
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    hasTouch: size.width < 900,
    isMobile: size.width < 900,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${size.name}] console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${size.name}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`[${size.name}] failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${size.name}] ${r.status()}: ${r.url()}`); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200); // прелоадер + появление hero
  await page.screenshot({ path: `${outDir}/${size.name}-00.png` });

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(size.height * 0.85);
  let n = 1;
  for (let y = step; y < total; y += step) {
    // Крутим колесом небольшими порциями, как человек
    for (let k = 0; k < 5; k++) {
      await page.evaluate((dy) => window.scrollBy(0, dy), step / 5);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${size.name}-${String(n).padStart(2, '0')}.png` });
    n += 1;
    if (n > 40) break;
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) problems.push(`[${size.name}] горизонтальный скролл: +${overflow}px`);
  await ctx.close();

  // --- Reduced motion: всё должно быть видно сразу, одной полной страницей ---
  const ctxR = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    reducedMotion: 'reduce',
  });
  const pageR = await ctxR.newPage();
  await pageR.goto(url, { waitUntil: 'networkidle' });
  // Прогружаем ленивые картинки
  await pageR.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await pageR.waitForTimeout(800);
  await pageR.screenshot({ path: `${outDir}/${size.name}-reduced-full.png`, fullPage: true });
  await ctxR.close();
}

await browser.close();

if (problems.length) {
  console.log('Проблемы:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
  process.exitCode = 1;
} else {
  console.log('Ошибок в консоли и 404 нет, горизонтального скролла нет.');
}
console.log(`Скриншоты: ${outDir}/`);
