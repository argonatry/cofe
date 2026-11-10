# Пара — лендинг кав'ярні

Одностраничный сайт кофейни-обжарочной «Пара» (Днепр) с анимациями: чистый HTML + CSS + JS, без сборщика.
GSAP + ScrollTrigger + SplitText и Lenis подключены с CDN. Название, адрес, телефон, цены и отзывы — заглушки
(в `index.html` помечены `<!-- TODO -->`).

## Запуск
```bash
python -m http.server 8000
```
Открыть http://localhost:8000 (через `file://` не откроется — скрипты подключены как модули).

## Проверка
```bash
npm install                      # один раз, ставит Playwright
npx playwright install chromium  # один раз
node scripts/shots.mjs           # сервер должен быть запущен
```
Скрипт прокручивает страницу на ширине 375 / 768 / 1440 px, складывает кадры в `shots/`
и печатает ошибки консоли, 404 и горизонтальный скролл, если они есть.

## Публикация на GitHub Pages
Сайт: https://argonatry.github.io/cofe/ — репозиторий `argonatry/cofe`, Pages собирается из ветки `main`, папка `/ (root)`.
Обновить сайт: `git push` — через минуту-две изменения появятся.

## Структура
- `index.html` — вся разметка и тексты
- `css/tokens.css` — цвета, шрифты, размеры; `css/base.css` — общее; `css/sections.css` — секции
- `js/main.js` — точка входа; `js/anim/*.js` — по файлу на секцию; `js/cursor.js` — курсор и магнитные кнопки
- `assets/img/` — фото в WebP; источники — в `CREDITS.md`
