/* ============================================================
   TRUVY · Presentation engine
   Scaling, navigation, overview, fullscreen, PDF export.
   ============================================================ */
(function () {
  'use strict';

  var SLIDE_W = 1600;
  var SLIDE_H = 900;

  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var total = slides.length;
  var index = 0;

  var counterEl = document.getElementById('counter');
  var progressBar = document.getElementById('progressBar');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnOverview = document.getElementById('btnOverview');
  var btnOverviewClose = document.getElementById('btnOverviewClose');
  var btnFullscreen = document.getElementById('btnFullscreen');
  var overview = document.getElementById('overview');
  var overviewGrid = document.getElementById('overviewGrid');

  var pdfBtn = document.getElementById('btnPdf');
  var pdfModal = document.getElementById('pdfModal');
  var btnConfirmPrint = document.getElementById('btnConfirmPrint');
  var btnCancelPrint = document.getElementById('btnCancelPrint');

  /* ---------------- Scaling ---------------- */
  function fit() {
    var s = Math.min(viewport.clientWidth / SLIDE_W, viewport.clientHeight / SLIDE_H);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  /* ---------------- Render ---------------- */
  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
      slide.classList.toggle('is-before', i < index);
    });

    counterEl.innerHTML = '<b>' + pad(index + 1) + '</b> / ' + total;
    progressBar.style.width = ((index + 1) / total) * 100 + '%';

    btnPrev.disabled = index === 0;
    btnNext.disabled = index === total - 1;

    updateOverviewState();
    syncHash();
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function goTo(i) {
    index = Math.max(0, Math.min(total - 1, i));
    render();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function syncHash() {
    var id = slides[index].id;
    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    } else {
      location.hash = id;
    }
  }

  /* ---------------- Overview ---------------- */
  function buildOverview() {
    slides.forEach(function (slide, i) {
      var title = slide.getAttribute('data-title') || ('Slide ' + (i + 1));
      var section = slide.getAttribute('data-section') || '';

      var btn = document.createElement('button');
      btn.className = 'thumb';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + title);
      btn.innerHTML =
        '<span class="thumb__mini">' +
          '<span class="mini-kicker">' + escapeHtml(section) + '</span>' +
          '<span class="mini-title">' + escapeHtml(title) + '</span>' +
          '<span class="mini-index">' + pad(i + 1) + '</span>' +
        '</span>' +
        '<span class="thumb__bar"><b>' + pad(i + 1) + '</b><span>' + escapeHtml(title) + '</span></span>';
      btn.addEventListener('click', function () {
        goTo(i);
        closeOverview();
      });
      overviewGrid.appendChild(btn);
    });
  }

  function updateOverviewState() {
    var thumbs = overviewGrid.children;
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle('is-current', i === index);
    }
  }

  function openOverview() {
    overview.hidden = false;
    updateOverviewState();
    var current = overviewGrid.children[index];
    if (current) current.focus();
  }
  function closeOverview() {
    overview.hidden = true;
    btnOverview.focus();
  }
  function toggleOverview() {
    if (overview.hidden) openOverview(); else closeOverview();
  }

  /* ---------------- Fullscreen ---------------- */
  function fullscreenSupported() {
    return document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled;
  }
  function toggleFullscreen() {
    var el = document.documentElement;
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (!fsEl) {
        (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen).call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
      }
    } catch (err) { /* graceful: fullscreen may be blocked */ }
  }

  /* ---------------- PDF export ---------------- */
  function openPdfModal() {
    pdfModal.hidden = false;
    btnConfirmPrint.focus();
  }
  function closePdfModal() {
    pdfModal.hidden = true;
    pdfBtn.focus();
  }
  function runPrint() {
    closePdfModal();
    pdfBtn.classList.add('is-busy');
    pdfBtn.setAttribute('disabled', 'disabled');
    requestAnimationFrame(function () {
      setTimeout(function () {
        try { window.print(); }
        finally {
          pdfBtn.classList.remove('is-busy');
          pdfBtn.removeAttribute('disabled');
        }
      }, 120);
    });
  }

  /* ---------------- Events ---------------- */
  function isInteractive(el) {
    return el && el.closest && el.closest('button, a, input, textarea, select, [contenteditable="true"]');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!pdfModal.hidden) { closePdfModal(); return; }
      if (!overview.hidden) { closeOverview(); return; }
    }
    if (isInteractive(e.target)) return;

    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Spacebar':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(total - 1); break;
      case 'f': case 'F':
        if (fullscreenSupported()) { e.preventDefault(); toggleFullscreen(); }
        break;
      case 'o': case 'O':
        e.preventDefault(); toggleOverview(); break;
      default: break;
    }
  });

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnOverview.addEventListener('click', toggleOverview);
  btnOverviewClose.addEventListener('click', closeOverview);
  if (fullscreenSupported()) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
  } else {
    btnFullscreen.style.display = 'none';
  }
  pdfBtn.addEventListener('click', openPdfModal);
  btnConfirmPrint.addEventListener('click', runPrint);
  btnCancelPrint.addEventListener('click', closePdfModal);

  overview.addEventListener('click', function (e) {
    if (e.target === overview) closeOverview();
  });
  pdfModal.addEventListener('click', function (e) {
    if (e.target === pdfModal) closePdfModal();
  });

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  window.addEventListener('hashchange', function () {
    var i = slideIndexFromHash();
    if (i !== -1 && i !== index) goTo(i);
  });

  /* ---------------- Boot ---------------- */
  function slideIndexFromHash() {
    var m = /slide-(\d+)/.exec(location.hash || '');
    if (!m) return -1;
    var n = parseInt(m[1], 10) - 1;
    return (n >= 0 && n < total) ? n : -1;
  }

  buildOverview();
  var start = slideIndexFromHash();
  index = start === -1 ? 0 : start;

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { fit(); render(); });
  } else {
    fit(); render();
  }
  fit();
  render();

  window.TRUVY = { goTo: goTo, next: next, prev: prev };

  /* ---------------- Diagnostics (opt-in via ?diag=1) ---------------- */
  function runDiagnostics() {
    var report = [];
    slides.forEach(function (s, i) {
      slides.forEach(function (x) { x.classList.remove('is-active', 'is-before'); });
      s.classList.add('is-active');
      void s.offsetHeight;
      var over = [];
      var kids = s.querySelectorAll('h1,h2,h3,h4,p,li,table,.footline,.s-cover__wordmark,.s-close__wordmark');
      var sr = { right: 1600, bottom: 900 };
      kids.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var sx = r.width ? 1 / (stage.getBoundingClientRect().width / SLIDE_W) : 1;
        var left = (r.left - s.getBoundingClientRect().left) * sx;
        var right = (r.right - s.getBoundingClientRect().left) * sx;
        var top = (r.top - s.getBoundingClientRect().top) * sx;
        var bottom = (r.bottom - s.getBoundingClientRect().top) * sx;
        if (bottom > sr.bottom + 1 || right > sr.right + 1 || top < -1 || left < -1) {
          over.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 40),
            l: Math.round(left), r: Math.round(right), t: Math.round(top), b: Math.round(bottom)
          });
        }
      });
      report.push({ slide: i + 1, sh: s.scrollHeight, sw: s.scrollWidth, fb: flowBottomOf(s), overflow: over });
    });
    console.log('TRUVY_DIAG' + JSON.stringify(report));
  }

  function flowBottomOf(s) {
    var max = 0;
    Array.prototype.forEach.call(s.children, function (el) {
      var cs = getComputedStyle(el);
      if (cs.position === 'absolute') return;
      var b = el.offsetTop + el.offsetHeight;
      if (b > max) max = b;
    });
    return Math.round(max);
  }
  if (/[?&]diag=1/.test(location.search)) {
    window.addEventListener('load', function () { setTimeout(runDiagnostics, 900); });
  }
})();
