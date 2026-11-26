(function () {
  'use strict';
  var root = document.getElementById('dbt-web-preview');
  if (!root) return;
  var returnFocus = new WeakMap();
  function lockPage() {
    document.documentElement.classList.toggle('site-dialog-open', Boolean(root.querySelector('dialog[open]')));
  }
  function openReader(dialog, trigger) {
    var parentReader = trigger && trigger.closest('dialog');
    var focusTarget = parentReader ? returnFocus.get(parentReader) : trigger;
    root.querySelectorAll('dialog[open]').forEach(function (other) { if (other !== dialog) other.close(); });
    if (focusTarget) returnFocus.set(dialog, focusTarget);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    var close = dialog.querySelector('.close');
    if (close) close.focus({ preventScroll: true });
    lockPage();
  }
  // A JS enhancement keeps reader buttons working in browsers without commandfor.
  root.addEventListener('click', function (event) {
    var button = event.target.closest('button[commandfor]');
    if (!button) return;
    var dialog = document.getElementById(button.getAttribute('commandfor'));
    if (!dialog || dialog.tagName !== 'DIALOG') return;
    event.preventDefault();
    if (button.getAttribute('command') === 'close') dialog.close();
    else openReader(dialog, button);
  });
  root.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', function () {
      lockPage();
      var trigger = returnFocus.get(dialog);
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
      returnFocus.delete(dialog);
    });
    dialog.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var section = dialog.querySelector(link.getAttribute('href'));
        if (!section) return;
        event.preventDefault();
        var head = dialog.querySelector('.reader-head');
        dialog.scrollTop += section.getBoundingClientRect().top - dialog.getBoundingClientRect().top - (head ? head.getBoundingClientRect().height : 0) - 15;
      });
    });
  });
  var guide = document.getElementById('usage-guide');
  var selectGuide = function () { return false; };
  if (guide) {
    var guideTabs = Array.from(guide.querySelectorAll('.guide-tab'));
    var guideContent = guide.querySelector('.reader-content');
    var compactGuide = matchMedia('(max-width: 760px)');
    function orientGuide() {
      guide.querySelector('[role=tablist]').setAttribute('aria-orientation', compactGuide.matches ? 'horizontal' : 'vertical');
      var active = guide.querySelector('.guide-tab[aria-selected=true]');
      if (guide.open && active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    orientGuide();
    compactGuide.addEventListener('change', orientGuide);
    selectGuide = function (key, focusTab) {
      var target = document.getElementById('guide-' + key);
      if (!target || !guide.contains(target) || target.getAttribute('role') !== 'tabpanel') return false;
      guideTabs.forEach(function (tab) {
        var selected = tab.getAttribute('aria-controls') === target.id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected) {
          if (focusTab) tab.focus({ preventScroll: true });
          // The selected topic stays visible in the scrolling desktop/mobile directory.
          tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
      guide.querySelectorAll('[role=tabpanel]').forEach(function (panel) { panel.hidden = panel !== target; });
      guideContent.scrollTop = 0;
      return true;
    };
    guide.addEventListener('click', function (event) {
      var tab = event.target.closest('.guide-tab');
      var related = event.target.closest('[data-guide-target]');
      if (tab) selectGuide(tab.getAttribute('aria-controls').slice(6), false);
      else if (related) selectGuide(related.getAttribute('data-guide-target'), true);
    });
    guide.addEventListener('keydown', function (event) {
      var tab = event.target.closest('.guide-tab');
      if (!tab) return;
      var index = guideTabs.indexOf(tab);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = guideTabs.length - 1;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') index = (index + 1) % guideTabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') index = (index + guideTabs.length - 1) % guideTabs.length;
      else return;
      event.preventDefault();
      selectGuide(guideTabs[index].getAttribute('aria-controls').slice(6), true);
    });
  }
  var downloadHighlightTimer;
  function showDownloads(event) {
    if (event) event.preventDefault();
    var downloads = document.getElementById('download');
    var top = innerWidth >= 600 ? 0 : Math.max(0, downloads.getBoundingClientRect().top + scrollY - 20);
    window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    downloads.classList.add('is-highlighted');
    window.clearTimeout(downloadHighlightTimer);
    downloadHighlightTimer = window.setTimeout(function () { downloads.classList.remove('is-highlighted'); }, 3000);
    var selected = downloads.querySelector('input:checked');
    var platform = selected && selected.id.slice('platform-'.length);
    var card = platform && downloads.querySelector('.platform-' + platform + ' a[data-download]');
    if (card) card.focus({ preventScroll: true });
  }
  root.querySelectorAll('a[href="#download"]').forEach(function (link) { link.addEventListener('click', showDownloads); });
  function restoreSharedLink() {
    var id = location.hash.slice(1);
    if (guide && id.indexOf('guide-') === 0 && document.getElementById(id)) {
      openReader(guide, null);
      selectGuide(id.slice(6), false);
      return;
    }
    var dialog = document.getElementById(id);
    if (dialog && dialog.tagName === 'DIALOG') { openReader(dialog, null); return; }
    if (id === 'downloads' || id === 'download') { showDownloads(); return; }
    var aliases = { questions: 'faq', preview: 'appearance', top: 'dbt-top', main: 'dbt-top' };
    var target = aliases[id] && document.getElementById(aliases[id]);
    if (target) target.scrollIntoView();
  }
  window.addEventListener('hashchange', restoreSharedLink);
  if (location.hash) requestAnimationFrame(restoreSharedLink);
  root.querySelectorAll('[data-download]').forEach(function (link) {
    link.addEventListener('click', function () {
      link.classList.add('is-downloading');
      var caption = link.querySelector('[data-download-caption]');
      if (caption) caption.textContent = '已请求下载';
      window.setTimeout(function () { link.classList.remove('is-downloading'); }, 900);
    });
  });
})();
