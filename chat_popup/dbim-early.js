/* Applies saved accessibility preferences before first paint (no flash).
   Loaded synchronously from <head>; kept external so the CSP can be script-src 'self'. */
(function () {
  var r = document.documentElement;
  try {
    var p = JSON.parse(localStorage.getItem('mota-prefs') || '{}');
    if (p.text) r.dataset.text = String(p.text);
    if (p.theme) r.dataset.theme = p.theme;
    if (p.links) r.classList.add('a11y-links');
    if (p.spacing) r.classList.add('a11y-spacing');
    if (p.readable) r.classList.add('a11y-readable');
    if (p.noMotion) r.classList.add('a11y-nomotion');
    if (p.filter === 'invert') r.classList.add('a11y-invert');
    if (p.filter === 'saturate') r.classList.add('a11y-saturate');
    if (p.hideImages) r.classList.add('a11y-noimg');
    if (p.bigCursor) r.classList.add('a11y-cursor');
    // Preview a theme without saving it, e.g. ?theme=contrast (useful for audits).
    var q = new URLSearchParams(location.search).get('theme');
    if (q === 'dark' || q === 'contrast' || q === 'light') r.dataset.theme = q;
  } catch (e) {}
  r.classList.add('js');
})();
