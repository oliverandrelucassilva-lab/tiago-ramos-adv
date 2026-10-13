(function () {
  'use strict';

  /* Abas: cada link do menu .tabs aponta para o id de um .panel. */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.tabs a'));
  var ids = panels.map(function (p) { return p.id; });

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

  /* Calculadora de prazo (informativa) */
  var $ = function (id) { return document.getElementById(id); };
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
