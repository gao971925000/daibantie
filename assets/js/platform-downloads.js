(function () {
  'use strict';
  var root = document.getElementById('downloads');
  if (!root) return;
  var tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  function resetHeroScroll() {
    var hero = root.closest('.hero');
    if (hero) hero.scrollTop = 0;
  }
  // The previous #downloads link scrolled the hero image behind the sticky header.
  // Return to the original page top instead of repositioning the hero mid-section.
  function restoreLegacyDownloadAnchor() {
    if (location.hash !== '#downloads') return;
    history.replaceState(null, '', location.pathname + location.search);
    resetHeroScroll();
    window.scrollTo(0, 0);
  }
  restoreLegacyDownloadAnchor();
  window.addEventListener('hashchange', restoreLegacyDownloadAnchor);
  var highlightTimer;
  function revealDownloads() {
    resetHeroScroll();
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var rect = root.getBoundingClientRect();
    var top = rect.top + window.scrollY;
    var bottom = rect.bottom + window.scrollY;
    // Keep the complete hero at the top when downloads fit there. On shorter
    // screens, scroll only the document, never the hero's hidden container.
    if (rect.top < headerHeight + 20 || rect.bottom > window.innerHeight - 20) {
      window.scrollTo({
        top: bottom <= window.innerHeight - 20 ? 0 : Math.max(0, top - headerHeight - 24),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
    root.classList.add('is-highlighted');
    window.clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(function () { root.classList.remove('is-highlighted'); }, 3000);
    var selected = tabs.find(function (tab) { return tab.getAttribute('aria-selected') === 'true'; });
    if (selected) selected.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-open-downloads]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      if (location.hash === '#downloads') history.replaceState(null, '', location.pathname + location.search);
      revealDownloads();
    });
  });
  function select(tab, focus) {
    tabs.forEach(function (item) {
      var active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); select(tabs[next], true); }
    });
  });
  var targets = [
    { id: 'windows', manifest: 'latest.json', version: '[data-release-version]', size: '[data-release-size]', title: 'Windows 10 / 11' },
    { id: 'windows-win7', manifest: 'win7-latest.json', version: '[data-win7-release-version]', title: 'Windows 7' },
    { id: 'macos-aarch64', manifest: 'macos-latest.json', version: '[data-mac-release-version]', size: '[data-mac-release-size]', title: 'Mac · Apple 芯片' },
    { id: 'macos-x86_64', manifest: 'macos-intel-latest.json', version: '[data-mac-intel-release-version]', size: '[data-mac-intel-release-size]', title: 'Mac · Intel 芯片' }
  ];
  function accepted(release, target) {
    if (!release || !/^\d+\.\d+\.\d+$/.test(release.version) || !/^[a-f0-9]{64}$/.test(release.sha256 || '')) return false;
    if (target.id === 'windows' && ((release.platform && release.platform !== 'windows') || release.os === 'win7' || release.channel === 'win7-stable')) return false;
    if (target.id === 'windows-win7' && (release.platform !== 'windows' || release.os !== 'win7' || release.arch !== 'x86_64' || release.channel !== 'win7-stable')) return false;
    if (target.id.indexOf('macos-') === 0 && (release.platform !== 'macos' || release.arch !== target.id.slice(6))) return false;
    try {
      var url = new URL(release.downloadUrl);
      var prefix = target.id === 'windows-win7' ? '/download/win7/releases/v' : '/download/releases/v';
      var suffix = target.id.indexOf('windows') === 0 ? '-x64-setup.exe' : target.id === 'macos-aarch64' ? '-arm64.dmg' : '-x86_64.dmg';
      return url.protocol === 'https:' && !url.username && !url.password && !url.port && ['www.daibantie.com','daibantie.com','api.daibantie.com'].indexOf(url.hostname) >= 0 && !url.search && !url.hash && !/%/.test(url.pathname) && url.pathname.indexOf(prefix + release.version + '/') === 0 && url.pathname.indexOf(release.sha256) > 0 && url.pathname.endsWith(suffix);
    } catch (_) { return false; }
  }
  targets.forEach(function (target) {
    fetch('download/' + target.manifest, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('Release unavailable');
      return response.json();
    }).then(function (release) {
      if (!accepted(release, target)) throw new Error('Wrong download platform');
      var path = new URL(release.downloadUrl).pathname;
      root.querySelectorAll('[data-download-platform="' + target.id + '"]').forEach(function (link) { link.href = (target.id === 'windows' ? 'https://www.daibantie.com' : 'https://api.daibantie.com') + path; });
      root.querySelectorAll('[data-download-backup="' + target.id + '"]').forEach(function (link) { link.href = (target.id === 'windows' ? 'https://api.daibantie.com' : 'https://www.daibantie.com') + path; });
      root.querySelectorAll(target.version).forEach(function (node) { node.textContent = 'v' + release.version; });
      if (target.size && typeof release.fileSizeBytes === 'number') root.querySelectorAll(target.size).forEach(function (node) { node.textContent = (release.fileSizeBytes / 1048576).toFixed(2) + ' MB'; });
    }).catch(function () { /* Keep the verified, platform-specific static links. */ });
  });
})();
