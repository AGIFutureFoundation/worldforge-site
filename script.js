/* ============ AGI Future Foundation — shared site script ============ */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Lazy embed activation ----
     Clicking a facade swaps in the iframe only when needed.
     To use: set data-youtube-id="VIDEO_ID" on .embed-card elements. */
  document.querySelectorAll(".embed-card").forEach(function (card) {
    var facade = card.querySelector(".embed-facade");
    if (!facade) return;
    facade.addEventListener("click", function () {
      var id = card.getAttribute("data-youtube-id");
      if (!id) return; // no video configured yet
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
      iframe.title = "Embedded video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      card.innerHTML = "";
      card.appendChild(iframe);
    });
  });

  /* ---- Contact form ----
     TODO: wire this to your backend / Formspree / Vercel function.
     For now it validates and shows an acknowledgement message. */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("formNote");
      if (note) note.hidden = false;
      form.reset();
    });
  }

  /* ---- Reveal on scroll ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".card, .tier, .embed-card, .article-row").forEach(function (el) {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      io.observe(el);
    });
    // CSS hook applied by JS after reveal
    var style = document.createElement("style");
    style.textContent = ".revealed { opacity: 1 !important; transform: none !important; }";
    document.head.appendChild(style);
  }
})();
