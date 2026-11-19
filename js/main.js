/* AKIOTOO — общий скрипт (мобильная и компьютерная версии).
   Данные берутся из js/config.js. Десктопные эффекты — в js/desktop.js,
   он подгружается только на больших экранах с мышью и без prefers-reduced-motion. */
(function () {
  'use strict';

  var cfg = window.AKIOTOO_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Ссылки и контакты ---------- */
  var waUrl = 'https://wa.me/' + String(cfg.whatsappNumber || '').replace(/\D/g, '') +
    '?text=' + encodeURIComponent(cfg.whatsappText || 'Здравствуйте, хочу записаться на тату');

  function setLink(selector, url) {
    $$(selector).forEach(function (a) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  setLink('[data-wa]', waUrl);
  setLink('[data-ig]', cfg.instagram || '#');
  setLink('[data-tg]', cfg.telegram || '#');
  setLink('[data-2gis]', (cfg.twoGis && cfg.twoGis.link) || 'https://2gis.kz/kostanay');

  $$('[data-address]').forEach(function (el) { el.textContent = cfg.address || ''; });
  $$('[data-address-note]').forEach(function (el) { el.textContent = cfg.addressNote || ''; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Карточки работ ---------- */
  var works = cfg.works || [];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function workCard(w, i, extra) {
    var a = document.createElement('a');
    a.className = 'work' + (extra ? ' is-extra' : '');
    a.href = w.src;
    a.dataset.index = i;
    a.dataset.cursor = 'view';
    a.setAttribute('aria-label', 'Открыть: ' + (w.alt || 'работа ' + pad(i + 1)));
    a.innerHTML =
      '<span class="work__media"><img src="' + w.src + '" alt="' + (w.alt || '').replace(/"/g, '&quot;') +
      '" width="1000" height="1250" loading="lazy" decoding="async"></span>' +
      '<span class="work__num">' + pad(i + 1) + '</span>';
    return a;
  }

  var homeTrack = $('[data-works-home]');
  if (homeTrack) {
    var nDesk = Math.min(cfg.homeWorksDesktop || 8, works.length);
    var nMob = cfg.homeWorksMobile || 3;
    works.slice(0, nDesk).forEach(function (w, i) { homeTrack.appendChild(workCard(w, i, i >= nMob)); });
    var all = document.createElement('a');
    all.className = 'work work--all';
    all.href = 'works.html';
    all.innerHTML = '<div><span>Все работы</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></div>';
    homeTrack.appendChild(all);
  }

  var grid = $('[data-works-grid]');
  if (grid) works.forEach(function (w, i) { grid.appendChild(workCard(w, i, false)); });

  /* ---------- Лайтбокс ---------- */
  var lb, lbImg, lbCount, lbIndex = 0, lastFocus = null;
  var closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  var nextIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Просмотр работы');
    lb.innerHTML =
      '<span class="lightbox__count"></span>' +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""></figure>' +
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Закрыть">' + closeIcon + '</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Предыдущая">' + nextIcon + '</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Следующая">' + nextIcon + '</button>';
    document.body.appendChild(lb);
    lbImg = $('.lightbox__img', lb);
    lbCount = $('.lightbox__count', lb);

    $('.lightbox__close', lb).addEventListener('click', closeLightbox);
    $('.lightbox__prev', lb).addEventListener('click', function () { show(lbIndex - 1); });
    $('.lightbox__next', lb).addEventListener('click', function () { show(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLightbox(); });

    // свайп на телефоне
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  function show(i) {
    if (!works.length) return;
    lbIndex = (i + works.length) % works.length;
    var w = works[lbIndex];
    lbImg.style.opacity = 0;
    lbImg.onload = function () { lbImg.style.opacity = 1; };
    lbImg.src = w.src;
    lbImg.alt = w.alt || '';
    lbCount.textContent = pad(lbIndex + 1) + ' / ' + pad(works.length);
  }

  function openLightbox(i) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.body.classList.add('lb-open');
    window.dispatchEvent(new CustomEvent('lightbox:open'));
    $('.lightbox__close', lb).focus();
  }

  function closeLightbox() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('lb-open');
    window.dispatchEvent(new CustomEvent('lightbox:close'));
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest && e.target.closest('.work[data-index]');
    if (!card || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    openLightbox(+card.dataset.index);
  });

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') show(lbIndex + 1);
    else if (e.key === 'ArrowLeft') show(lbIndex - 1);
    else if (e.key === 'Tab') { // держим фокус внутри
      var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Карта 2GIS (Leaflet + тайлы 2GIS, грузится при приближении) ----------
     Старый iframe-виджет 2GIS «Фирмы на карте» отвечает ошибкой, а новый (MapGL)
     требует API-ключ, поэтому карта собрана на открытых тайлах 2GIS. */
  var map = $('[data-map]');
  if (map) {
    var g = cfg.twoGis || {};
    var mapLoaded = false;
    var loadMap = function () {
      if (mapLoaded) return;
      mapLoaded = true;
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(css);
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js').then(function () {
        var L = window.L;
        var touch = window.matchMedia('(hover: none)').matches;
        var m = L.map(map, {
          center: [g.lat, g.lon], zoom: g.zoom || 16,
          scrollWheelZoom: false, dragging: !touch, tap: false,
          zoomControl: !touch, attributionControl: true
        });
        m.attributionControl.setPrefix(false);
        L.tileLayer('https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1', {
          subdomains: '0123', maxZoom: 18,
          attribution: '<a href="https://2gis.kz" target="_blank" rel="noopener">© 2GIS</a>'
        }).addTo(m);
        var icon = L.divIcon({ className: 'map-pin', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
        L.marker([g.lat, g.lon], { icon: icon, title: 'AKIOTOO', keyboard: false }).addTo(m)
          .on('click', function () { window.open(g.link || 'https://2gis.kz/kostanay', '_blank', 'noopener'); });
        map.setAttribute('aria-label', 'Карта 2GIS: ' + (cfg.address || 'AKIOTOO'));
      }).catch(function () { mapLoaded = false; });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { loadMap(); io.disconnect(); }
      }, { rootMargin: '600px' });
      io.observe(map);
    } else loadMap();
  }

  /* ---------- Рваные шипастые края (рисуются случайно, видны только на десктопе) ---------- */
  function tearPath() {
    var W = 1440, H = 56, x = 0, d = 'M0 ' + H + ' L0 ' + (H - 14);
    while (x < W) {
      x += 10 + Math.random() * 34;
      var spike = Math.random();
      var y = spike > 0.86 ? Math.random() * 10 : spike > 0.55 ? 16 + Math.random() * 18 : 34 + Math.random() * 16;
      var xm = x - 4 - Math.random() * 8;
      d += ' L' + xm.toFixed(1) + ' ' + (H - 10 - Math.random() * 10).toFixed(1) + ' L' + Math.min(x, W).toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + ' L' + W + ' ' + H + ' Z';
  }
  $$('[data-tear]').forEach(function (el) {
    el.innerHTML = '<svg viewBox="0 0 1440 56" preserveAspectRatio="none"><path fill="currentColor" d="' + tearPath() + '"/></svg>';
  });

  /* ---------- Шапка: фон после начала прокрутки ---------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Десктопные эффекты ---------- */
  var mqDesk = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  var fxStarted = false;
  function startFx() {
    if (fxStarted || !mqDesk.matches || mqReduce.matches) return;
    fxStarted = true;
    var CDN = 'https://cdn.jsdelivr.net/npm/';
    loadScript(CDN + 'gsap@3.12.5/dist/gsap.min.js')
      .then(function () {
        return Promise.all([
          loadScript(CDN + 'gsap@3.12.5/dist/ScrollTrigger.min.js'),
          loadScript(CDN + 'lenis@1.1.13/dist/lenis.min.js'),
          loadScript('js/desktop.js')
        ]);
      })
      .then(function () {
        if (window.AKIOTOO_FX) window.AKIOTOO_FX.init();
      })
      .catch(function () { /* без CDN сайт просто работает без анимаций */ });
  }
  startFx();
  // если окно расширили до десктопа — включаем эффекты; при сужении — перезагрузка не нужна,
  // эффекты остаются, но мобильная вёрстка их скрывает только после перезагрузки
  if (mqDesk.addEventListener) mqDesk.addEventListener('change', startFx);
})();
