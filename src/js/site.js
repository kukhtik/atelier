// Носитель, режим досье, координаты указателя. Без зависимостей, ≤10 КБ.
(function () {
  var KEY = "atelier.medium";
  var root = document.documentElement;
  var NAMES = { void: "VOID", cyanotype: "CYANOTYPE", chiaroscuro: "CHIAROSCURO", vellum: "VELLUM" };

  function preferred() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "vellum"
      : "void";
  }
  function apply(medium) {
    root.setAttribute("data-medium", medium);
    var name = document.querySelector("[data-medium-name]");
    if (name) name.textContent = NAMES[medium] || medium;
    var btns = document.querySelectorAll("[data-medium-set]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-medium-set") === medium ? "true" : "false");
    }
  }
  function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    apply(saved || preferred());
    var btns = document.querySelectorAll("[data-medium-set]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (ev) {
        var m = ev.currentTarget.getAttribute("data-medium-set");
        apply(m);
        try { localStorage.setItem(KEY, m); } catch (e) {}
      });
    }
  }

  // Режим досье: Контекст / Конструктив
  function initMode() {
    var article = document.querySelector("[data-mode]");
    if (!article) return;
    var hash = location.hash.replace("#", "");
    if (hash === "constructive" || hash === "context") article.setAttribute("data-mode", hash);
    var btns = document.querySelectorAll("[data-mode-set]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (ev) {
        var m = ev.currentTarget.getAttribute("data-mode-set");
        article.setAttribute("data-mode", m);
        history.replaceState(null, "", "#" + m);
        sync(m);
      });
    }
    function sync(m) {
      for (var j = 0; j < btns.length; j++) {
        btns[j].setAttribute("aria-pressed", btns[j].getAttribute("data-mode-set") === m ? "true" : "false");
      }
    }
    sync(article.getAttribute("data-mode"));
  }

  // Координаты указателя на главной
  function initCoords() {
    var out = document.getElementById("coords");
    var fig = document.querySelector(".hero-figure");
    if (!out || !fig) return;
    var raf = 0, last = { x: 0, y: 0 };
    fig.addEventListener("pointermove", function (ev) {
      last.x = ev.clientX; last.y = ev.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        out.textContent = "X " + String(Math.round(last.x)).padStart(4, "0") + " · Y " + String(Math.round(last.y)).padStart(4, "0");
      });
    });
  }

  // Граф: подсветка связей узла
  function initGraph() {
    var svg = document.querySelector("svg.graph");
    if (!svg) return;
    var edges = svg.querySelectorAll(".edge");
    function clear() {
      svg.removeAttribute("data-dim");
      for (var i = 0; i < edges.length; i++) edges[i].classList.remove("is-active");
    }
    function hi(id) {
      clear();
      svg.setAttribute("data-dim", "1");
      for (var i = 0; i < edges.length; i++) {
        if (edges[i].getAttribute("data-a") === id || edges[i].getAttribute("data-b") === id)
          edges[i].classList.add("is-active");
      }
    }
    var nodes = svg.querySelectorAll(".node");
    for (var i = 0; i < nodes.length; i++) {
      (function (n) {
        var id = n.getAttribute("data-node");
        n.addEventListener("pointerenter", function () { hi(id); });
        n.addEventListener("focus", function () { hi(id); });
        n.addEventListener("pointerleave", clear);
        n.addEventListener("blur", clear);
      })(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); initMode(); initCoords(); initGraph(); });
  } else { init(); initMode(); initCoords(); initGraph(); }
})();
