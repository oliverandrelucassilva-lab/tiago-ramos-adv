(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* Abas: cada link do menu .tabs aponta para o id de um .panel. */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.tabs a'));
  var ids = panels.map(function (p) { return p.id; });

  var ind = document.querySelector('.tab-ind');
  function moveInd() {
    var a = document.querySelector('.tabs a[aria-current="true"]');
    if (!a || !ind) return;
    ind.style.width = a.offsetWidth + 'px';
    ind.style.height = a.offsetHeight + 'px';
    ind.style.transform = 'translate(' + a.offsetLeft + 'px,' + a.offsetTop + 'px)';
  }
  window.addEventListener('resize', moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  function reveal(panel) {
    if (!panel) return;
    var sel = '.card,.areas article,.docs li,.timeline,.checker,.refund,.callout,.ir-who li,.next,.panel-foot';
    Array.prototype.forEach.call(panel.querySelectorAll(sel), function (el, i) {
      if (el.classList.contains('in')) return;
      if (reduce || !io) { el.classList.add('in'); return; }
      el.classList.add('rv');
      el.style.setProperty('--d', Math.min(i % 4, 3) * 90 + 'ms');
      io.observe(el);
    });
  }

  function show(id, scroll) {
    if (ids.indexOf(id) === -1) id = ids[0];
    panels.forEach(function (p) { p.classList.toggle('is-active', p.id === id); });
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && a.scrollIntoView) {
        var bar = a.parentNode;
        bar.scrollLeft = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
      }
    });
    moveInd();
    reveal(document.getElementById(id));
    if (scroll) {
      var panel = document.getElementById(id);
      panel.scrollIntoView();
      var h = panel.querySelector('h2');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var known = ids.indexOf(id) !== -1;
    show(known ? id : ids[0], known);
  }

  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* Barra de progresso de leitura */
  var prog = $('progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Brilho que acompanha o mouse nos cartões */
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.card,.areas article,.entry-card');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* Contadores da faixa de parâmetros legais */
  Array.prototype.forEach.call(document.querySelectorAll('.count'), function (el) {
    var to = +el.getAttribute('data-to');
    if (reduce || !io) return;
    var done = false;
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting || done) return;
      done = true; o.disconnect();
      var t0 = performance.now(), d = 1100;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: .6 }).observe(el);
  });

  /* Busca na lista de doenças */
  var busca = $('busca-doenca');
  var itens = Array.prototype.slice.call(document.querySelectorAll('.diseases li'));
  function norm(t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  if (busca) busca.addEventListener('input', function () {
    var q = norm(busca.value.trim()), n = 0;
    itens.forEach(function (li) {
      var ok = !q || norm(li.lastChild.textContent).indexOf(q) !== -1;
      li.hidden = !ok; if (ok) n++;
    });
    $('busca-vazio').hidden = n > 0;
  });

  /* Calculadora de prazo (informativa) */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var DAY = 86400000;
  var MES = 30.4375;
  var NC = 'Não calculado';

  var now = new Date();
  $('dtHoje').value = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  function parseDate(v) {
    if (!v) return null;
    var p = v.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  }
  function fmtDate(d) { return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(); }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function parseMoney(s) {
    if (!s) return 0;
    var n = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  function calc() {
    var c = parseDate($('dtContrato').value);
    var r = parseDate($('dtHoje').value);
    var st = $('status');
    var out = ['rLimite', 'rDiasContrato', 'rDiasTol', 'rIndeniz'];
    if (!c || !r) {
      st.className = 'badge warn';
      st.textContent = !c ? 'Informe a data de entrega prevista' : 'Informe a data de referência';
      out.forEach(function (i) { $(i).textContent = NC; });
      $('pin').style.left = '0%';
      return;
    }
    var lim = new Date(c.getTime() + 180 * DAY);
    var dC = Math.round((r - c) / DAY);
    var dT = Math.round((r - lim) / DAY);
    $('rLimite').textContent = fmtDate(lim);
    $('rDiasContrato').textContent = dC > 0 ? dC + ' dias' : '0';
    $('rDiasTol').textContent = dT > 0 ? dT + ' dias (cerca de ' + (dT / MES).toFixed(1).replace('.', ',') + ' meses)' : '0';
    var v = parseMoney($('valorPago').value);
    $('rIndeniz').textContent = (dT > 0 && v > 0) ? brl(v * 0.01 * (dT / MES)) : NC;
    $('pin').style.left = Math.max(0, Math.min(100, (dC / 360) * 100)) + '%';
    if (dC <= 0) { st.className = 'badge ok'; st.textContent = 'Dentro do prazo contratual'; }
    else if (dT <= 0) { st.className = 'badge warn'; st.textContent = 'No período de tolerância (' + (-dT) + ' dias restantes)'; }
    else { st.className = 'badge bad'; st.textContent = 'Atraso além da tolerância legal'; }
  }
  ['dtContrato', 'dtHoje', 'valorPago'].forEach(function (id) { $(id).addEventListener('input', calc); });
  $('chk').addEventListener('submit', function (e) { e.preventDefault(); });
  calc();

  /* Copiar e-mail */
  $('copyBtn').addEventListener('click', function () {
    var t = $('mail').textContent;
    function done() { $('copied').textContent = 'E-mail copiado'; setTimeout(function () { $('copied').textContent = ''; }, 2500); }
    function sel() {
      var r = document.createRange(); r.selectNodeContents($('mail'));
      var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      $('copied').textContent = 'E-mail selecionado: use Ctrl+C';
    }
    try { navigator.clipboard.writeText(t).then(done, sel); } catch (e) { sel(); }
  });
})();
