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

  function ymd(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }

  /* Datas: texto dd/mm/aaaa com máscara; retorna Date UTC, null (incompleta) ou false (inválida) */
  function parseDate(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || '');
    if (!m) return null;
    var d = +m[1], mo = +m[2], y = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (y < 1990 || y > 2100 || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return false;
    return dt;
  }
  function maskDate(el) {
    var dg = el.value.replace(/\D/g, '').slice(0, 8), o = dg;
    if (dg.length > 4) o = dg.slice(0, 2) + '/' + dg.slice(2, 4) + '/' + dg.slice(4);
    else if (dg.length > 2) o = dg.slice(0, 2) + '/' + dg.slice(2);
    el.value = o;
  }
  function fmtDate(d) { return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(); }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function parseMoney(s) {
    if (!s) return 0;
    var n = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  /* Dinheiro: separa milhares enquanto digita e mantém o cursor */
  function maskMoney(el) {
    var pos = el.selectionStart, before = el.value.slice(0, pos).replace(/[^\d,]/g, '').length;
    var raw = el.value.replace(/[^\d,]/g, ''), i = raw.indexOf(',');
    var ent = (i === -1 ? raw : raw.slice(0, i)).replace(/^0+(?=\d)/, '');
    var dec = i === -1 ? null : raw.slice(i + 1).replace(/,/g, '').slice(0, 2);
    var out = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec === null ? '' : ',' + dec);
    el.value = out;
    var n = 0, p = 0;
    while (p < out.length && n < before) { if (/[\d,]/.test(out[p])) n++; p++; }
    try { el.setSelectionRange(p, p); } catch (e) {}
  }

  var errEl = $('dtErro');
  function calc() {
    var cv = $('dtContrato').value, rv = $('dtHoje').value;
    var c = parseDate(cv), r = parseDate(rv);
    var st = $('status');
    var out = ['rLimite', 'rDiasContrato', 'rDiasTol', 'rIndeniz'];
    var bad = [];
    if (c === false) bad.push('data de entrega');
    if (r === false) bad.push('data de referência');
    ['dtContrato', 'dtHoje'].forEach(function (id) {
      var v = parseDate($(id).value);
      if (v === false) $(id).setAttribute('aria-invalid', 'true'); else $(id).removeAttribute('aria-invalid');
    });
    errEl.hidden = !bad.length;
    errEl.textContent = bad.length ? 'Confira a ' + bad.join(' e a ') + ': use o formato dia/mês/ano, por exemplo 30/11/2025.' : '';
    if (!c || !r) {
      st.className = 'badge warn';
      st.textContent = !c ? 'Informe a data de entrega prevista' : 'Informe a data de referência';
      out.forEach(function (i) { $(i).textContent = NC; });
      $('pin').style.left = '0%';
      document.dispatchEvent(new CustomEvent('calc', { detail: null }));
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
    document.dispatchEvent(new CustomEvent('calc', { detail: { c: c, r: r, lim: lim, dC: dC, dT: dT, v: v, indeniz: (dT > 0 && v > 0) ? v * 0.01 * (dT / MES) : 0 } }));
    if (dC <= 0) { st.className = 'badge ok'; st.textContent = 'Dentro do prazo contratual'; }
    else if (dT <= 0) { st.className = 'badge warn'; st.textContent = 'No período de tolerância (' + (-dT) + ' dias restantes)'; }
    else { st.className = 'badge bad'; st.textContent = 'Atraso além da tolerância legal'; }
  }

  ['dtContrato', 'dtHoje'].forEach(function (id) {
    $(id).addEventListener('input', function () { maskDate(this); calc(); });
  });
  $('valorPago').addEventListener('input', function () { maskMoney(this); calc(); });
  $('valorPago').addEventListener('blur', function () {
    if (/^\d+,\d$/.test(this.value)) this.value += '0';
    else if (/^\d+$/.test(this.value.replace(/\./g, '')) && this.value) this.value += ',00';
    calc();
  });

  /* Calendário próprio (abre pelo botão dentro do campo de data) */
  var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var pop = document.createElement('div');
  pop.className = 'cal-pop'; pop.hidden = true;
  pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Escolher data');
  pop.innerHTML =
    '<div class="cp-head">' +
    '<button type="button" class="cp-nav" data-n="-12" aria-label="Ano anterior">&laquo;</button>' +
    '<button type="button" class="cp-nav" data-n="-1" aria-label="Mês anterior">&lsaquo;</button>' +
    '<div class="cp-title" aria-live="polite"></div>' +
    '<button type="button" class="cp-nav" data-n="1" aria-label="Próximo mês">&rsaquo;</button>' +
    '<button type="button" class="cp-nav" data-n="12" aria-label="Próximo ano">&raquo;</button></div>' +
    '<div class="cp-week" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>' +
    '<div class="cp-days" role="grid"></div>' +
    '<div class="cp-foot"><button type="button" class="cp-link" data-a="hoje">Hoje</button><button type="button" class="cp-link" data-a="limpar">Limpar</button></div>';
  var cpDays = pop.querySelector('.cp-days'), cpTitle = pop.querySelector('.cp-title');
  var cpTarget = null, cpBtn = null, cpView = null, cpFocus = null;

  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function cpRender() {
    var y = cpView.getFullYear(), m = cpView.getMonth(), first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
    var today = iso(new Date()), cur = parseDate(cpTarget.value), selIso = cur ? cur.toISOString().slice(0, 10) : '', html = '';
    cpTitle.textContent = MESES[m] + ' ' + y;
    for (var i = 0; i < 42; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), k = iso(d);
      var cls = 'cp-day' + (d.getMonth() !== m ? ' cp-out' : '') + (k === today ? ' today' : '') + (k === selIso ? ' sel' : '');
      html += '<button type="button" class="' + cls + '" data-d="' + k + '" tabindex="' + (k === cpFocus ? 0 : -1) + '" aria-label="' +
        d.getDate() + ' de ' + MESES[d.getMonth()].toLowerCase() + ' de ' + d.getFullYear() + '"' + (k === selIso ? ' aria-pressed="true"' : '') + '>' + d.getDate() + '</button>';
    }
    cpDays.innerHTML = html;
  }
  function cpGo(date, focus) {
    var min = new Date(1990, 0, 1), max = new Date(2100, 11, 31);
    if (date < min) date = min; if (date > max) date = max;
    cpFocus = iso(date); cpView = new Date(date.getFullYear(), date.getMonth(), 1); cpRender();
    if (focus) { var b = cpDays.querySelector('[data-d="' + cpFocus + '"]'); if (b) b.focus(); }
  }
  function cpOpen(btn) {
    var box = btn.parentNode;
    cpBtn = btn; cpTarget = $(btn.getAttribute('data-for'));
    var cur = parseDate(cpTarget.value), base = cur ? new Date(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate()) : new Date();
    box.appendChild(pop); pop.hidden = false;
    var r = box.getBoundingClientRect();
    pop.classList.toggle('up', innerHeight - r.bottom < 400 && r.top > innerHeight - r.bottom);
    cpGo(base, true);
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('cal-open');
  }
  function cpClose(back) {
    if (pop.hidden) return;
    pop.hidden = true;
    document.body.classList.remove('cal-open');
    if (cpBtn) { cpBtn.setAttribute('aria-expanded', 'false'); if (back) cpBtn.focus(); }
  }
  function cpPick(date) {
    cpTarget.value = pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
    cpTarget.dispatchEvent(new Event('input'));
    cpClose(true);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.cal'), function (btn) {
    btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () { if (!pop.hidden && cpBtn === btn) cpClose(false); else cpOpen(btn); });
  });
  pop.addEventListener('click', function (e) {
    var n = e.target.closest('[data-n]'), a = e.target.closest('[data-a]'), d = e.target.closest('[data-d]');
    if (n) { var v = new Date(cpView.getFullYear(), cpView.getMonth() + (+n.getAttribute('data-n')), 1); cpGo(v, false); n.focus(); }
    else if (d) { var p = d.getAttribute('data-d').split('-'); cpPick(new Date(+p[0], p[1] - 1, +p[2])); }
    else if (a) {
      if (a.getAttribute('data-a') === 'hoje') cpPick(new Date());
      else { cpTarget.value = ''; cpTarget.dispatchEvent(new Event('input')); cpClose(true); }
    }
  });
  pop.addEventListener('keydown', function (e) {
    var d = e.target.closest && e.target.closest('[data-d]');
    if (e.key === 'Escape') { e.preventDefault(); cpClose(true); return; }
    if (!d) return;
    var p = d.getAttribute('data-d').split('-'), cur = new Date(+p[0], p[1] - 1, +p[2]), step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) { e.preventDefault(); cpGo(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step), true); }
    else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); cpGo(new Date(cur.getFullYear(), cur.getMonth() + (e.key === 'PageUp' ? -1 : 1), cur.getDate()), true); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!pop.hidden && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.cal'))) cpClose(false);
  });

  $('usarHoje').addEventListener('click', function () { $('dtHoje').value = ymd(new Date()); calc(); });
  $('limpar').addEventListener('click', function () {
    $('dtContrato').value = ''; $('valorPago').value = '';
    $('dtHoje').value = ymd(new Date()); calc(); $('dtContrato').focus();
  });
  $('dtHoje').value = ymd(new Date());
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

/* Imagens ilustrativas das abas (figuras com data-art): se existirem <nome>-desktop / <nome>-mobile
   (.webp, .jpg ou .png) em /assets/img/, elas substituem a ilustração provisória em SVG automaticamente. */
Array.prototype.forEach.call(document.querySelectorAll('.art[data-art]'), function (fig) {
  var key = fig.getAttribute('data-art');
  var img = fig.querySelector('img'), mq = window.matchMedia('(max-width: 860px)'), token = 0;
  function swap() {
    var my = ++token, base = '/assets/img/' + key + '-' + (mq.matches ? 'mobile' : 'desktop'), exts = ['.webp', '.jpg', '.png'];
    (function next(i) {
      if (i >= exts.length || my !== token) return;
      var t = new Image();
      t.onload = function () {
        if (my !== token) return;
        Array.prototype.forEach.call(fig.querySelectorAll('source'), function (s) { s.parentNode.removeChild(s); });
        img.src = base + exts[i] + '?v=20261014';
      };
      t.onerror = function () { next(i + 1); };
      t.src = base + exts[i] + '?v=20261014';
    })(0);
  }
  swap();
  if (mq.addEventListener) mq.addEventListener('change', swap);
});
