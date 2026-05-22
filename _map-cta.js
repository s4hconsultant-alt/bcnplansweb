/* ─────────────────────────────────────────────────────────────
   BCN Plans · Map CTA strip
   ─────────────────────────────────────────────────────────────
   Drop-in promo strip for /mapa/ — works on every existing &
   future page in the site.

     <script src="/_map-cta.js" defer></script>

   What it does:
   - On DOMContentLoaded, injects a trilingual <section> with the
     three language variants as siblings, just before the page's
     <footer> (or at the end of <body> if no <footer>).
   - Reads localStorage.bcnplans_lang to know which variant to
     show first (falls back to navigator.language).
   - Monkey-patches the page's existing setLang() so that
     clicking ES/EN/CA in the lang-bar also updates this strip.

   The strip itself uses the brand's tokens (negro, oro, crema,
   Playfair display, DM Sans) inline so it works even on pages
   that don't import colors_and_type.css.
   ──────────────────────────────────────────────────────────── */

(function () {
  var LANGS = ['es', 'en', 'ca'];
  var STORAGE_KEY = 'bcnplans_lang';

  var MAPA_URL = 'https://bcnplanner.gumroad.com/l/bcn-plans-map';

  /* Copy for each language */
  var COPY = {
    es: {
      eyebrow: 'Producto digital',
      title:   'Lleva la <em>Barcelona insider</em> en el móvil',
      body:    '50 sitios curados — gastro, miradores, bares de barrio, secretos. Mapa interactivo. Para siempre.',
      price:   '4,99€',
      priceOld:'9,99€',
      cta:     'Ver el mapa →',
      foot:    'Pago único · sin suscripción',
    },
    en: {
      eyebrow: 'Digital product',
      title:   'Take the <em>insider Barcelona</em> with you',
      body:    '50 curated spots — food, viewpoints, neighbourhood bars, secrets. Interactive map. Forever.',
      price:   '€4.99',
      priceOld:'€9.99',
      cta:     'See the map →',
      foot:    'One-time payment · no subscription',
    },
    ca: {
      eyebrow: 'Producte digital',
      title:   'Endú-te la <em>Barcelona insider</em> al mòbil',
      body:    "50 llocs curats — gastro, miradors, bars de barri, secrets. Mapa interactiu. Per sempre.",
      price:   '4,99€',
      priceOld:'9,99€',
      cta:     'Veure el mapa →',
      foot:    'Pagament únic · sense subscripció',
    },
  };

  /* CSS — scoped to .bcn-map-cta so it never collides */
  var CSS = ''
    + '.bcn-map-cta{background:#0a0a0a;color:#f5f0e8;font-family:"DM Sans",sans-serif;font-weight:300;padding:44px 24px 48px;text-align:center;position:relative;overflow:hidden;border-top:1px solid rgba(196,168,130,0.15);flex-shrink:0;width:100%;align-self:stretch;box-sizing:border-box}'
    + '.bcn-map-cta::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(196,168,130,0.12) 0%,transparent 65%);pointer-events:none}'
    + '.bcn-map-cta__inner{position:relative;max-width:680px;margin:0 auto}'
    + '.bcn-map-cta__eyebrow{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c4a882;margin-bottom:14px}'
    + '.bcn-map-cta__title{font-family:"Playfair Display",serif;font-weight:700;font-size:clamp(22px,4vw,30px);line-height:1.2;margin:0 0 12px;color:#f5f0e8}'
    + '.bcn-map-cta__title em{font-style:normal;color:#c4a882}'
    + '.bcn-map-cta__body{font-size:14px;line-height:1.6;color:rgba(245,240,232,0.7);max-width:480px;margin:0 auto 22px}'
    + '.bcn-map-cta__price-row{display:flex;justify-content:center;align-items:baseline;gap:12px;margin-bottom:18px;flex-wrap:wrap}'
    + '.bcn-map-cta__price{font-family:"Playfair Display",serif;font-weight:900;font-size:28px;color:#c4a882;line-height:1}'
    + '.bcn-map-cta__price-old{font-size:13px;color:rgba(245,240,232,0.35);text-decoration:line-through}'
    + '.bcn-map-cta__price-tag{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;background:#c4a882;color:#0a0a0a;padding:3px 8px;font-weight:500}'
    + '.bcn-map-cta__btn{display:inline-block;background:#c4a882;color:#0a0a0a;font-family:"DM Sans",sans-serif;font-weight:500;font-size:14px;letter-spacing:0.8px;padding:14px 30px;text-decoration:none;transition:all 0.2s}'
    + '.bcn-map-cta__btn:hover{background:#9a7a5a;color:#f5f0e8;transform:translateY(-1px)}'
    + '.bcn-map-cta__foot{margin-top:18px;font-size:10px;letter-spacing:1.5px;color:rgba(245,240,232,0.45);text-transform:uppercase}'
    + '.bcn-map-cta__variant{display:none}'
    + '.bcn-map-cta__variant.is-active{display:block}';

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) > -1) return saved;
    var bl = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (LANGS.indexOf(bl) > -1) return bl;
    return 'es';
  }

  function buildVariant(lang) {
    var c = COPY[lang];
    var html = '';
    html += '<div class="bcn-map-cta__variant" data-bcn-cta="' + lang + '">';
    html +=   '<div class="bcn-map-cta__eyebrow">' + c.eyebrow + '</div>';
    html +=   '<h2 class="bcn-map-cta__title">' + c.title + '</h2>';
    html +=   '<p class="bcn-map-cta__body">' + c.body + '</p>';
    html +=   '<div class="bcn-map-cta__price-row">';
    html +=     '<span class="bcn-map-cta__price">' + c.price + '</span>';
    html +=     '<span class="bcn-map-cta__price-old">' + c.priceOld + '</span>';
    html +=     '<span class="bcn-map-cta__price-tag">−50%</span>';
    html +=   '</div>';
    html +=   '<a class="bcn-map-cta__btn" href="' + MAPA_URL + '" target="_blank" rel="noopener">' + c.cta + '</a>';
    html +=   '<p class="bcn-map-cta__foot">' + c.foot + '</p>';
    html += '</div>';
    return html;
  }

  function injectStyles() {
    if (document.getElementById('bcn-map-cta-styles')) return;
    var s = document.createElement('style');
    s.id = 'bcn-map-cta-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function applyLang(root, lang) {
    var variants = root.querySelectorAll('.bcn-map-cta__variant');
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      v.classList.toggle('is-active', v.getAttribute('data-bcn-cta') === lang);
    }
  }

  function mount() {
    injectStyles();

    var section = document.createElement('section');
    section.className = 'bcn-map-cta';
    var inner = '<div class="bcn-map-cta__inner">';
    for (var i = 0; i < LANGS.length; i++) inner += buildVariant(LANGS[i]);
    inner += '</div>';
    section.innerHTML = inner;

    /* Place after the last top-level [data-lang] block (so we're outside all
       per-language wrappers and stay visible regardless of active lang).
       Falls back to before <footer>, then end of body. */
    var langBlocks = document.querySelectorAll('body > [data-lang]');
    if (langBlocks.length) {
      var last = langBlocks[langBlocks.length - 1];
      last.parentNode.insertBefore(section, last.nextSibling);
    } else {
      var footer = document.querySelector('footer');
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(section, footer);
      } else {
        document.body.appendChild(section);
      }
    }

    var initial = detectLang();
    applyLang(section, initial);

    /* Hook into the page's existing setLang() (used by the lang-bar buttons) */
    var prev = window.setLang;
    window.setLang = function (lang) {
      try { if (typeof prev === 'function') prev.apply(this, arguments); } catch (e) {}
      if (LANGS.indexOf(lang) > -1) applyLang(section, lang);
    };

    /* Also listen to storage changes from other tabs */
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && LANGS.indexOf(e.newValue) > -1) {
        applyLang(section, e.newValue);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
