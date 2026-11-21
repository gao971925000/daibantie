(function () {
  'use strict';
  var root = document.getElementById('dbt-web-preview');
  if (!root) return;
  var targets = [
    { id: 'windows', manifest: 'latest.json', version: '[data-release-version]', size: '[data-release-size]' },
    { id: 'macos-aarch64', manifest: 'macos-latest.json', version: '[data-mac-release-version]', size: '[data-mac-release-size]' },
    { id: 'macos-x86_64', manifest: 'macos-intel-latest.json', version: '[data-mac-intel-release-version]', size: '[data-mac-intel-release-size]' }
  ];
  function accepted(release, target) {
    if (!release || !/^\d+\.\d+\.\d+$/.test(release.version) || !/^[a-f0-9]{64}$/.test(release.sha256 || '') || !Number.isSafeInteger(release.fileSizeBytes) || release.fileSizeBytes <= 0) return null;
    if (target.id === 'windows' && ((release.platform && release.platform !== 'windows') || release.os === 'win7' || release.channel === 'win7-stable')) return null;
    if (target.id.indexOf('macos-') === 0 && (release.platform !== 'macos' || release.arch !== target.id.slice(6))) return null;
    try {
      var url = new URL(release.downloadUrl);
      if (url.protocol !== 'https:' || url.username || url.password || url.port || ['www.daibantie.com', 'daibantie.com', 'api.daibantie.com'].indexOf(url.hostname) < 0 || url.search || url.hash || /%/.test(url.pathname)) return null;
      var prefix = '/download/releases/v' + release.version + '/';
      if (url.pathname.indexOf(prefix) !== 0 || url.pathname.indexOf(release.sha256, prefix.length) < 0) return null;
      var filename = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
      if (target.id === 'windows') {
        // Current simple names and historical setup names must both remain valid.
        var simple = 'Daibantie-v' + release.version + '-x64.exe';
        var historical = 'Daibantie-v' + release.version + '-' + release.sha256 + '-x64-setup.exe';
        var setup = 'Daibantie-v' + release.version + '-x64-setup.exe';
        if (filename !== simple && filename !== historical && filename !== setup) return null;
      } else {
        var suffix = target.id === 'macos-aarch64' ? '-arm64.dmg' : '-x86_64.dmg';
        if (!filename.endsWith(suffix)) return null;
      }
      return { path: url.pathname, filename: filename };
    } catch (_) { return null; }
  }
  targets.forEach(function (target) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 4000) : null;
    fetch('download/' + target.manifest, { cache: 'no-store', credentials: 'omit', signal: controller ? controller.signal : undefined }).then(function (response) {
      if (!response.ok) throw new Error('Release unavailable');
      return response.json();
    }).then(function (release) {
      var download = accepted(release, target);
      if (!download) return;
      root.querySelectorAll('[data-download-platform="' + target.id + '"]').forEach(function (link) { link.href = 'https://api.daibantie.com' + download.path; link.download = download.filename; });
      root.querySelectorAll('[data-download-backup="' + target.id + '"]').forEach(function (link) { link.href = 'https://www.daibantie.com' + download.path; link.download = download.filename; });
      root.querySelectorAll(target.version).forEach(function (node) { node.textContent = 'v' + release.version; });
      root.querySelectorAll(target.size).forEach(function (node) { node.textContent = (release.fileSizeBytes / 1048576).toFixed(2) + ' MB'; });
    }).catch(function () {
      // The verified links embedded in HTML remain usable offline or on failure.
    }).finally(function () { if (timer !== null) window.clearTimeout(timer); });
  });
})();
