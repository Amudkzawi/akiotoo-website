# AKIOTOO — сайт тату-студии (Костанай)

Статический сайт: HTML + CSS + JS, хостинг — GitHub Pages. Сборка не нужна.

## Что где менять

| Что | Где |
|---|---|
| Номер WhatsApp, Instagram, Telegram, адрес, 2GIS | `js/config.js` (всё помечено `TODO`) |
| Фото работ | заменить файлы `assets/works/work-01.webp … work-12.webp` (вертикальные 4:5, ~1000×1250) |
| Добавить работу | положить `work-13.webp` и дописать строку в `works` в `js/config.js` |
| Тексты | `index.html` |
| Цвета, шрифты | начало `css/style.css` (`:root`) |
| Вернуть тёмную тему | в `<html lang="ru">` добавить `data-theme="dark"` (в обоих HTML) |

Карта: Leaflet + тайлы 2GIS с меткой по координатам из `config.js` (старый iframe-виджет 2GIS отвечает ошибкой, новый MapGL требует API-ключ).

## Слои параллакса (hero, компьютер)

В `index.html` внутри `.hero__stage` каждый слой — это:

```html
<div class="hero__layer" data-speed="0.25">          <!-- скорость при скролле -->
  <div class="hero__layer-inner" data-depth="0.4">  <!-- сила сдвига за мышью -->
    <img src="assets/img/....webp" alt="">
  </div>
</div>
```

Когда появятся отдельные слои (текстура / рука с волком на прозрачном фоне) — добавьте блоки в место с комментарием `НОВЫЕ СЛОИ ДОБАВЛЯТЬ СЮДА`.
Сейчас баннер — один слой (`assets/img/hero-*.webp`, из него убран вшитый логотип), логотип — отдельный слой поверх.

## Структура

```
index.html, works.html
css/style.css          мобильная версия + @media (min-width:1024px) + эффекты (.fx)
js/config.js           данные
js/main.js             ссылки, карточки работ, лайтбокс, карта 2GIS
js/desktop.js          GSAP + ScrollTrigger + Lenis (только десктоп, без reduced-motion)
assets/source/         оригиналы заказчика
assets/img/            сжатые WebP
assets/works/          фото работ (сейчас заглушки)
```
