(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- WhatsApp links ---------- */
  function initWhatsapp() {
    const wa = data.whatsapp;
    if (!wa || !wa.number) return;
    const href = `https://wa.me/${wa.number}?text=${encodeURIComponent(wa.message || "")}`;
    $$("[data-wa-link]").forEach(a => { a.href = href; });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const el = $("[data-year]");
    if (!el || !data.year) return;
    el.textContent = `© ${data.year} PicExpress. Todos los derechos reservados.`;
  }

  /* ---------- Nav scroll state + mobile menu ---------- */
  function initNav() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const onScroll = () => {
      if (scrollY > 60) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $("[data-nav-toggle]");
    const mobile = $("[data-nav-mobile]");
    if (!toggle || !mobile) return;
    const setOpen = (open) => {
      mobile.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => {
      setOpen(mobile.getAttribute("data-open") !== "true");
    });
    $$("[data-nav-mobile-link]", mobile).forEach(a => {
      a.addEventListener("click", () => setOpen(false));
    });
  }

  /* ---------- Smooth anchor scroll (native) ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navOffset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ---------- Tilt 3D + cursor halo on cards ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".has-tilt").forEach(card => {
      const MAX = 7;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (card.classList.contains("has-halo")) {
          card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        }
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(el => io.observe(el));

    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Showcase pinned horizontal scroll ---------- */
  function initShowcasePinned() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const sec = $("[data-showcase-section]");
    const track = $("[data-showcase-track]");
    if (!sec || !track) return;

    const setup = () => {
      ScrollTrigger.getAll().forEach(s => { if (s.vars.id === "showcase-pin") s.kill(); });
      gsap.set(track, { clearProps: "x" });
      const isDesktop = innerWidth >= 1024;
      sec.classList.toggle("is-pinned", isDesktop);
      if (!isDesktop) return;

      const trackRect = track.getBoundingClientRect();
      const distance = track.scrollWidth - innerWidth + trackRect.left + 24;
      if (distance <= 0) return;

      gsap.to(track, {
        x: () => -distance,
        ease: "none",
        scrollTrigger: {
          id: "showcase-pin",
          trigger: sec,
          start: "top top+=76",
          end: () => "+=" + (distance + innerHeight * 0.4),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    };

    setup();
    let to;
    window.addEventListener("resize", () => {
      clearTimeout(to);
      to = setTimeout(() => { ScrollTrigger.refresh(); setup(); }, 250);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(initWhatsapp, "initWhatsapp");
    safe(initYear, "initYear");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initTilt, "initTilt");
    safe(initReveals, "initReveals");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initShowcasePinned, "initShowcasePinned");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
