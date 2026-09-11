(function () {
  "use strict";
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function renderCredits() {
    const list = document.querySelector("[data-credits]");
    if (!list) return;
    fetch("assets/credits.json")
      .then(r => r.json())
      .then(credits => {
        list.innerHTML = Object.values(credits).map(c => `
          <li>
            <strong>${c.title}</strong> —
            ${c.creator_url ? `<a href="${c.creator_url}" target="_blank" rel="noopener">${c.creator}</a>` : c.creator} ·
            <a href="${c.license_url}" target="_blank" rel="noopener">${c.license.toUpperCase()} ${c.license_version || ""}</a> ·
            <a href="${c.foreign_landing_url}" target="_blank" rel="noopener">Ver original ↗</a>
          </li>
        `).join("");
      })
      .catch(() => { list.innerHTML = "<li>No se pudieron cargar los créditos.</li>"; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => safe(renderCredits, "renderCredits"));
  } else {
    safe(renderCredits, "renderCredits");
  }
})();
