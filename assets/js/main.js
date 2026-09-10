(function () {
  "use strict";
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  function closeNav() {
    if (!toggle || !nav) return;
    nav.classList.remove("open"); toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "打开导航菜单");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation(); var opening = !nav.classList.contains("open"); closeNav();
      if (opening) { nav.classList.add("open"); toggle.classList.add("open"); toggle.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-label", "关闭导航菜单"); }
    });
    nav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeNav); });
    document.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeNav(); });
  }
  var revealItems = document.querySelectorAll(".reveal");
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); } });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else { revealItems.forEach(function (item) { item.classList.add("in"); }); }
  document.querySelectorAll("[data-download]").forEach(function (link) {
    link.addEventListener("click", function () { link.classList.add("is-downloading"); window.setTimeout(function () { link.classList.remove("is-downloading"); }, 900); });
  });
  fetch("download/latest.json", { cache: "no-store" }).then(function (response) {
    if (!response.ok) throw new Error("release metadata unavailable"); return response.json();
  }).then(function (release) {
    if (typeof release.version === "string" && /^\d+\.\d+\.\d+$/.test(release.version)) document.querySelectorAll("[data-release-version]").forEach(function (node) { node.textContent = "v" + release.version; });
    if (typeof release.fileSizeBytes === "number" && release.fileSizeBytes > 0) {
      var size = (release.fileSizeBytes / 1024 / 1024).toFixed(2) + " MB";
      document.querySelectorAll("[data-release-size]").forEach(function (node) { node.textContent = size; });
    }
  }).catch(function () { /* 保留页面中的版本兜底信息。 */ });
})();
