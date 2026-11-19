/* AKIOTOO — эффекты компьютерной версии (GSAP + ScrollTrigger + Lenis).
   Подгружается из main.js только на десктопе без prefers-reduced-motion.
   Всё обёрнуто в gsap.matchMedia: при сужении окна эффекты откатываются. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function init() {
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var root = document.documentElement;
    var mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
      root.classList.add('fx');
      var cleanups = [];

      /* ---- Инерционный скролл ---- */
      var lenis = null;
      if (Lenis) {
        lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        var raf = function (t) { lenis.raf(t * 1000); };
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        var stop = function () { lenis.stop(); };
        var start = function () { lenis.start(); };
        window.addEventListener('lightbox:open', stop);
        window.addEventListener('lightbox:close', start);

        // якорные ссылки — плавно через Lenis
        var onAnchor = function (e) {
          var a = e.target.closest && e.target.closest('a[href^="#"]');
          if (!a) return;
          var id = a.getAttribute('href');
          if (id.length < 2 && id !== '#') return;
          var target = id === '#top' || id === '#' ? 0 : $(id);
          if (target === null) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: target === 0 ? 0 : -70, duration: 1.6 });
        };
        document.addEventListener('click', onAnchor);

        cleanups.push(function () {
          gsap.ticker.remove(raf);
          window.removeEventListener('lightbox:open', stop);
          window.removeEventListener('lightbox:close', start);
          document.removeEventListener('click', onAnchor);
          lenis.destroy();
        });
      }

      cleanups.push(hero(gsap, ScrollTrigger, root));
      counters(gsap, ScrollTrigger);
      portfolio(gsap);
      about(gsap);
      ink(gsap, ScrollTrigger);
      cleanups.push(cursor(gsap));

      var refresh = function () { ScrollTrigger.refresh(); };
      window.addEventListener('load', refresh);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);

      return function () {
        window.removeEventListener('load', refresh);
        cleanups.forEach(function (fn) { if (fn) fn(); });
        root.classList.remove('fx', 'has-flying-logo');
        $$('.ink-pending').forEach(function (el) { el.classList.remove('ink-pending'); el.style.removeProperty('--ink'); });
      };
    });
  }

  /* ---------- HERO: слои, наклон за мышью, логотип улетает в шапку ---------- */
  function hero(gsap, ScrollTrigger, root) {
    var heroEl = $('.hero');
    if (!heroEl) return null;

    var logo = $('[data-flying-logo]', heroEl);
    var logoBox = $('.hero__logo-box', heroEl);
    var slot = $('.header__logo img');
    var stage = $('.hero__stage', heroEl);

    // вход
    gsap.from('.hero__layer--banner .hero__layer-inner', { scale: 1.18, duration: 2.4, ease: 'power3.out' });
    gsap.from('.hero__studio, .hero__city, .hero__cta, .hero__meta > *', { autoAlpha: 0, y: 30, duration: 1.2, stagger: 0.1, delay: 0.5, ease: 'power3.out' });
    gsap.set(stage, { transformPerspective: 1400 });

    // слои двигаются с разной скоростью (data-speed)
    $$('.hero__layer[data-speed]', heroEl).forEach(function (layer) {
      var sp = parseFloat(layer.dataset.speed) || 0;
      gsap.to(layer, {
        yPercent: sp * 45,
        ease: 'none',
        scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    gsap.fromTo('.hero__sub, .hero__cta-wrap, .hero__meta', { y: 0, autoAlpha: 1 }, {
      y: -80, autoAlpha: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: heroEl, start: 'top top', end: '35% top', scrub: true }
    });

    // логотип: фиксированный слой, стартует там, где был в hero, и улетает в шапку
    var flightProgress = 0;
    if (logo && logoBox && slot) {
      root.classList.add('has-flying-logo');
      var place = function () {
        gsap.set(logo, { clearProps: 'transform' });
        var r = logoBox.getBoundingClientRect();
        var top = r.top + window.scrollY;
        logo.style.left = r.left + 'px';
        logo.style.top = top + 'px';
        logo.style.width = r.width + 'px';
      };
      place();
      ScrollTrigger.addEventListener('refreshInit', place);

      gsap.set(logo, { transformOrigin: '0 0' });
      gsap.from(logo, { autoAlpha: 0, filter: 'blur(14px)', duration: 1.8, ease: 'power2.out', clearProps: 'filter' });
      var flight = function () {
        var s = slot.getBoundingClientRect();
        return {
          x: s.left - logo.offsetLeft,
          y: s.top - logo.offsetTop,
          scale: s.width / logo.offsetWidth
        };
      };
      gsap.fromTo(logo, { x: 0, y: 0, scale: 1 }, {
        x: function () { return flight().x; },
        y: function () { return flight().y; },
        scale: function () { return flight().scale; },
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: heroEl, start: 'top top',
          end: function () { return '+=' + window.innerHeight * 0.7; },
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: function (self) { flightProgress = self.progress; }
        }
      });
    }

    // наклон за мышью: слои с data-depth смещаются, сцена слегка поворачивается
    var depthEls = $$('[data-depth]', heroEl);
    var movers = depthEls.map(function (el) {
      return {
        d: parseFloat(el.dataset.depth) || 0,
        x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }),
        isLogo: !!el.closest('[data-flying-logo]')
      };
    });
    var rotX = gsap.quickTo(stage, 'rotationX', { duration: 1.2, ease: 'power3' });
    var rotY = gsap.quickTo(stage, 'rotationY', { duration: 1.2, ease: 'power3' });

    var onMove = function (e) {
      if (window.scrollY > window.innerHeight * 1.1) return;
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach(function (m) {
        var k = m.isLogo ? 1 - flightProgress : 1; // в шапке логотип не дёргается
        m.x(-nx * m.d * 46 * k);
        m.y(-ny * m.d * 30 * k);
      });
      rotY(nx * 3);
      rotX(-ny * 2.4);
    };
    window.addEventListener('pointermove', onMove);

    return function () {
      window.removeEventListener('pointermove', onMove);
      if (logo) { logo.removeAttribute('style'); }
    };
  }

  /* ---------- Цифры считаются от нуля ---------- */
  function counters(gsap) {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count) || 0;
      var o = { v: 0 };
      el.textContent = '0';
      gsap.to(o, {
        v: end,
        duration: end > 100 ? 2.4 : 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () { el.textContent = String(Math.round(o.v)); },
        onComplete: function () { el.textContent = String(end); }
      });
    });
  }

  /* ---------- Портфолио: закреплённая секция с горизонтальной прокруткой ---------- */
  function portfolio(gsap) {
    var sec = $('.portfolio');
    var track = $('.portfolio__track', sec || document);
    if (!sec || !track) return;
    var bar = $('[data-progress]', sec);

    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tween = gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
      }
    });

    // внутри карточек картинка чуть сдвигается — глубина
    $$('.work__media img', track).forEach(function (m) {
      gsap.fromTo(m, { xPercent: 5 }, {
        xPercent: -5, ease: 'none',
        scrollTrigger: { trigger: m.closest('.work'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
  }

  /* ---------- О мастере: фото отстаёт, огромное слово едет навстречу ---------- */
  function about(gsap) {
    var sec = $('.about');
    if (!sec) return;
    var st = { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.about__photo', { yPercent: -14 }, { yPercent: 14, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.about__photo-inner', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.about__word span', { xPercent: -4 }, { xPercent: -42, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.about__word', { yPercent: -30 }, { yPercent: -70, ease: 'none', scrollTrigger: st });
  }

  /* ---------- «Чернила»: блоки проявляются растекающейся кляксой ---------- */
  function ink(gsap) {
    $$('[data-ink]').forEach(function (el) {
      el.classList.add('ink-pending');
      el.style.setProperty('--ink', 0);
      gsap.to(el, {
        '--ink': 1,
        duration: 1.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: function () { el.classList.remove('ink-pending'); el.style.removeProperty('--ink'); }
      });
    });
  }

  /* ---------- Курсор-кружок «смотреть» ---------- */
  function cursor(gsap) {
    var c = document.createElement('div');
    c.className = 'cursor is-hidden';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span>смотреть</span>';
    document.body.appendChild(c);
    var xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });

    var move = function (e) { c.classList.remove('is-hidden'); xTo(e.clientX); yTo(e.clientY); };
    var over = function (e) { c.classList.toggle('is-view', !!(e.target.closest && e.target.closest('[data-cursor="view"]'))); };
    var leave = function () { c.classList.add('is-hidden'); };
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);

    return function () {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      c.remove();
    };
  }

  window.AKIOTOO_FX = { init: init };
})();
