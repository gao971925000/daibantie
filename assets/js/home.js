(function () {
  'use strict';
  var root = document.getElementById('dbt-web-preview');
  if (!root) return;
  var returnFocus = new WeakMap();
  function lockPage() {
    document.documentElement.classList.toggle('site-dialog-open', Boolean(root.querySelector('dialog[open]')));
  }
  function openReader(dialog, trigger) {
    root.querySelectorAll('dialog[open]').forEach(function (other) { if (other !== dialog) other.close(); });
    if (trigger) returnFocus.set(dialog, trigger);
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
  function showDownloads(event) {
    if (event) event.preventDefault();
    var downloads = document.getElementById('download');
    var top = innerWidth >= 600 ? 0 : Math.max(0, downloads.getBoundingClientRect().top + scrollY - 20);
    window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  root.querySelectorAll('a[href="#download"]').forEach(function (link) { link.addEventListener('click', showDownloads); });
  function restoreSharedLink() {
    var id = location.hash.slice(1);
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
      window.setTimeout(function () { link.classList.remove('is-downloading'); }, 900);
    });
  });
})();
