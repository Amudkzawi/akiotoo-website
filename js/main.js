/* AKIOTOO — единственный скрипт сайта. Без библиотек:
   ссылки из config.js, карточки работ, лайтбокс, карта 2GIS (Leaflet грузится
   только при подходе к карте), появление блоков и параллакс баннера на ПК. */
(function () {
  'use strict';

  var cfg = window.AKIOTOO_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ссылки и контакты ---------- */
  var waUrl = 'https://wa.me/' + String(cfg.whatsappNumber || '').replace(/\D/g, '') +
    '?text=' + encodeURIComponent(cfg.whatsappText || 'Здравствуйте, хочу записаться на тату');

  function setLink(selector, url) {
    $$(selector).forEach(function (a) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; });
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
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function workCard(w, i, extra) {
    var a = document.createElement('a');
    a.className = 'work' + (extra ? ' is-extra' : '');
    a.href = w.src;
    a.dataset.index = i;
    a.setAttribute('aria-label', 'Открыть: ' + (w.alt || 'работа ' + pad(i + 1)));
    a.innerHTML = '<img src="' + esc(w.src) + '" alt="' + esc(w.alt) + '" width="1000" height="1250" loading="lazy" decoding="async">';
    return a;
  }

  var homeGrid = $('[data-works-home]');
  if (homeGrid) {
    var n = Math.min(cfg.homeWorks || 6, works.length);
    var nMob = cfg.homeWorksMobile || 3;
    works.slice(0, n).forEach(function (w, i) {
      homeGrid.appendChild(workCard(w, i, i >= nMob));
    });
  }
  var allGrid = $('[data-works-grid]');
  if (allGrid) works.forEach(function (w, i) { allGrid.appendChild(workCard(w, i, false)); });

  /* ---------- Лайтбокс ---------- */
  var lb, lbImg, lbCount, lbIndex = 0, lastFocus = null;
  var arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var cross = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Просмотр работы');
    lb.innerHTML =
      '<span class="lightbox__count"></span>' +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""></figure>' +
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Закрыть">' + cross + '</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Предыдущая">' + arrow + '</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Следующая">' + arrow + '</button>';
    document.body.appendChild(lb);
    lbImg = $('.lightbox__img', lb);
    lbCount = $('.lightbox__count', lb);
    $('.lightbox__close', lb).addEventListener('click', closeLightbox);
    $('.lightbox__prev', lb).addEventListener('click', function () { show(lbIndex - 1); });
    $('.lightbox__next', lb).addEventListener('click', function () { show(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLightbox(); });
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
    $('.lightbox__close', lb).focus();
  }

  function closeLightbox() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('lb-open');
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
    else if (e.key === 'Tab') {
      var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Карта 2GIS (Leaflet + тайлы 2GIS, грузится при подходе) ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

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
          center: [g.lat, g.lon], zoom: g.zoom || 17,
          scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: !touch
        });
        m.attributionControl.setPrefix(false);
        L.tileLayer('https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1', {
          subdomains: '0123', maxZoom: 18,
          attribution: '<a href="https://2gis.kz" target="_blank" rel="noopener">© 2GIS</a>'
        }).addTo(m);
        var icon = L.divIcon({ className: 'map-pin', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
        L.marker([g.lat, g.lon], { icon: icon, title: 'AKIOTOO', keyboard: false }).addTo(m)
          .on('click', function () { window.open(g.link || 'https://2gis.kz/kostanay', '_blank', 'noopener'); });
      }).catch(function () { mapLoaded = false; });
    };
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { loadMap(); mio.disconnect(); }
      }, { rootMargin: '400px' });
      mio.observe(map);
    } else loadMap();
  }

  /* ---------- Появление блоков: один раз, fade + 20px ---------- */
  var reveal = $$('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveal.forEach(function (el) { rio.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Параллакс баннера (только ПК, без reduced-motion) ---------- */
  var hero = $('.hero');
  var layers = $$('.hero [data-speed]');
  var desk = window.matchMedia('(min-width: 1024px) and (hover: hover)');
  if (hero && layers.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      ticking = false;
      if (!desk.matches) { layers.forEach(function (l) { l.style.transform = ''; }); return; }
      var y = window.scrollY;
      if (y > hero.offsetTop + hero.offsetHeight) return;
      layers.forEach(function (l) {
        l.style.transform = 'translate3d(0,' + (y * (parseFloat(l.dataset.speed) || 0)).toFixed(1) + 'px,0)';
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
