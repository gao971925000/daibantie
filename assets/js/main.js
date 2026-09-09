/* 待办 DeskTodo · 下载官网 —— 交互脚本 */
(function () {
  "use strict";

  /* 移动端导航开关 */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function () {
      if (links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    /* 点导航链接后收起 */
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* 滚动显现 */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.07 + "s";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* 下载按钮的轻量反馈（该页为静态下载链接，仅记录一次交互） */
  document.querySelectorAll("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.add("downloading");
      setTimeout(function () { btn.classList.remove("downloading"); }, 900);
    });
  });

  /* 发布脚本写入 latest.json；读取失败时保留页面内的兜底文案。 */
  var releaseSize = document.querySelector("[data-release-size]");
  if (releaseSize && "fetch" in window) {
    fetch("download/latest.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) { throw new Error("release metadata unavailable"); }
        return response.json();
      })
      .then(function (release) {
        if (typeof release.fileSizeBytes !== "number" || release.fileSizeBytes <= 0) { return; }
        releaseSize.textContent = (release.fileSizeBytes / 1024 / 1024).toFixed(2) + " MB";
      })
      .catch(function () { /* 首次正式发布前没有 latest.json，静默使用兜底体积。 */ });
  }
})();
