(function () {
  "use strict";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function pinTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
  pinTop();
  window.addEventListener("load", pinTop, { once: true });
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
  var guide = document.getElementById("installGuideDialog");
  var guideTrigger = null;
  if (guide && typeof guide.showModal === "function") {
    document.querySelectorAll("[data-install-guide]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        closeNav();
        guideTrigger = link;
        guide.querySelectorAll("img[data-src]").forEach(function (image) {
          image.src = image.dataset.src;
          image.removeAttribute("data-src");
        });
        guide.showModal();
        guide.querySelector(".install-guide-pages").scrollTop = 0;
        document.body.classList.add("install-guide-open");
      });
    });
    guide.querySelector(".install-guide-close").addEventListener("click", function () { guide.close(); });
    guide.addEventListener("click", function (event) { if (event.target === guide) guide.close(); });
    guide.addEventListener("close", function () {
      document.body.classList.remove("install-guide-open");
      if (guideTrigger) guideTrigger.focus({ preventScroll: true });
    });
  }
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
  function loadRelease(url, versionSelector, sizeSelector, platform) {
  fetch(url, { cache: "no-store" }).then(function (response) {
    if (!response.ok) throw new Error("release metadata unavailable"); return response.json();
  }).then(function (release) {
    if (platform !== "windows" && (release.platform !== "macos" || release.arch !== platform.slice(6))) return;
    if (platform === "windows" && release.platform && release.platform !== "windows") return;
    // Metadata stays on Pages; installer bytes prefer the existing static API
    // download service. Never proxy installer streams through the login API.
    if (typeof release.downloadUrl === "string" && /^[a-f0-9]{64}$/.test(release.sha256 || "")) {
      var original = new URL(release.downloadUrl, location.href);
      var suffix = platform === "windows" ? "-x64-setup.exe" : platform === "macos-aarch64" ? "-arm64.dmg" : "-x86_64.dmg";
      if (original.protocol === "https:" && !original.username && !original.password &&
          ["www.daibantie.com", "daibantie.com", "api.daibantie.com"].indexOf(original.hostname) !== -1 &&
          original.pathname.indexOf("/download/releases/v" + release.version + "/") === 0 &&
          original.pathname.endsWith(suffix) && original.pathname.indexOf(release.sha256) !== -1 &&
          !original.search && !original.hash) {
        document.querySelectorAll('[data-download-platform="' + platform + '"]').forEach(function (link) { link.href = "https://api.daibantie.com" + original.pathname; });
        document.querySelectorAll('[data-download-backup="' + platform + '"]').forEach(function (link) { link.href = "https://www.daibantie.com" + original.pathname; });
      }
    }
    if (typeof release.version === "string" && /^\d+\.\d+\.\d+$/.test(release.version)) document.querySelectorAll(versionSelector).forEach(function (node) { node.textContent = "v" + release.version; });
    if (typeof release.fileSizeBytes === "number" && release.fileSizeBytes > 0) {
      var size = (release.fileSizeBytes / 1024 / 1024).toFixed(2) + " MB";
      document.querySelectorAll(sizeSelector).forEach(function (node) { node.textContent = size; });
    }
  }).catch(function () { /* 保留页面中的版本兜底信息与可直接下载的链接。 */ });
  }
  loadRelease("download/latest.json", "[data-release-version]", "[data-release-size]", "windows");
  loadRelease("download/macos-latest.json", "[data-mac-release-version]", "[data-mac-release-size]", "macos-aarch64");
  loadRelease("download/macos-intel-latest.json", "[data-mac-intel-release-version]", "[data-mac-intel-release-size]", "macos-x86_64");
})();
