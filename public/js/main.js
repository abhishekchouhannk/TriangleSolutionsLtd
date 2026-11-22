/* =========================================================
   Triangle Electric Solutions Ltd — site scripts
   ========================================================= */
(function () {
  'use strict';

  /* ---- Settings you may want to change ---- */
  // false = empty photo slots show a "Add photo: filename" placeholder (good while building)
  // true  = empty photo slots are hidden completely (use once the site is final)
  var HIDE_EMPTY_PHOTOS = false;

  // Photos are looked up by base name, trying these extensions in order,
  // so commercial-1.jpg, commercial-1.png, commercial-1.webp all work.
  var EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];

  var CONTACT_EMAIL = 'tesquote@gmail.com';

  /* ---- Year in footer ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Mobile menu ---- */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  if (nav && menuBtn) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
  }

  /* ---- Photo loader: tries each extension, falls back to a placeholder ---- */
  document.querySelectorAll('img[data-base]').forEach(function (img) {
    var base = img.getAttribute('data-base');
    var fig = img.closest('.ph');
    var i = 0;

    function ok() {
      if (!fig) return;
      fig.classList.add('loaded');
      fig.classList.remove('missing');
    }
    function fail() {
      img.removeAttribute('src');
      if (!fig) return;
      fig.classList.add('missing');
      if (HIDE_EMPTY_PHOTOS) fig.hidden = true;
    }
    function next() {
      i += 1;
      if (i < EXTENSIONS.length) img.src = base + '.' + EXTENSIONS[i];
      else fail();
    }

    img.addEventListener('load', ok);
    img.addEventListener('error', next);

    // handle images that finished (or failed) before this script ran
    if (img.complete && img.getAttribute('src')) {
      if (img.naturalWidth > 0) ok(); else next();
    }
  });

  /* ---- Lightbox for loaded photos ---- */
  var lb, lbImg, lbCap, items = [], idx = 0;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<button class="x" aria-label="Close"><svg class="icon"><use href="#i-close"/></svg></button>' +
      '<button class="pv" aria-label="Previous photo"><svg class="icon" style="transform:scaleX(-1)"><use href="#i-arrow"/></svg></button>' +
      '<img alt=""><div class="lb-cap"></div>' +
      '<button class="nx" aria-label="Next photo"><svg class="icon"><use href="#i-arrow"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('.lb-cap');
    lb.querySelector('.x').addEventListener('click', closeLb);
    lb.querySelector('.pv').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.nx').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
  function show(n) {
    if (!items.length) return;
    idx = (n + items.length) % items.length;
    var im = items[idx].querySelector('img');
    var cap = items[idx].querySelector('figcaption');
    lbImg.src = im.currentSrc || im.src;
    lbImg.alt = im.alt || '';
    lbCap.textContent = cap ? cap.textContent : '';
  }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var fig = e.target.closest('.ph.loaded');
    if (!fig || fig.closest('.hero-photo')) return;
    if (!lb) buildLightbox();
    var scope = fig.closest('[data-gallery]') || document;
    items = Array.prototype.slice.call(scope.querySelectorAll('.ph.loaded'));
    show(items.indexOf(fig));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  /* ---- Contact form (sends to the business email via FormSubmit) ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    var msg = document.getElementById('formMsg');
    var btn = form.querySelector('button[type="submit"]');

    function showMsg(type, html) {
      msg.className = 'form-msg ' + type;
      msg.innerHTML = html;
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function mailtoLink() {
      var d = new FormData(form);
      var body =
        'Name: ' + (d.get('name') || '') + '\n' +
        'Phone: ' + (d.get('phone') || '') + '\n' +
        'Service: ' + (d.get('service') || '') + '\n\n' +
        (d.get('message') || '');
      return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Website enquiry') +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return; // spam trap
      if (!form.checkValidity()) { form.reportValidity(); return; }

      btn.disabled = true;
      var original = btn.innerHTML;
      btn.textContent = 'Sending…';
      msg.className = 'form-msg';

      fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && (res.j.success === true || res.j.success === 'true')) {
            form.reset();
            showMsg('ok', 'Thanks, your message has been sent. We will get back to you as soon as we can.');
          } else {
            throw new Error('send failed');
          }
        })
        .catch(function () {
          showMsg('err',
            'Sorry, your message could not be sent from the website. Please call ' +
            '<a href="tel:+14396993919">439-699-3919</a> or <a href="' + mailtoLink() + '">email us directly</a>.');
        })
        .then(function () { btn.disabled = false; btn.innerHTML = original; });
    });
  }
})();
