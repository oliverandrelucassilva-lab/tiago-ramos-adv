/* Funcionalidades de contato e retorno do visitante.
   Todas dependem de uma ação do próprio visitante (sem pop-ups, sem urgência, sem envio automático). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cfg = window.SITE_CONFIG || {};
  var EMAIL = 'tiago@tiagoramos.adv.br';
  var ASSUNTOS = {
    imovel: 'Imóvel na planta com atraso', ir: 'Isenção de IR por doença grave',
    consumidor: 'Direito do Consumidor', imobiliario: 'Direito Imobiliário', civil: 'Direito Civil',
    trabalho: 'Direito do Trabalho', familia: 'Direito de Família', previdenciario: 'Direito Previdenciário',
    administrativo: 'Direito Administrativo', outro: 'Outro assunto'
  };

  function track(name, props) { try { if (window.va) window.va('event', Object.assign({ name: name }, props || {})); } catch (e) {} }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function copy(text, ok) {
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); toast(ok); } catch (e) { toast('Não foi possível copiar'); }
      document.body.removeChild(t);
    }
    try { navigator.clipboard.writeText(text).then(function () { toast(ok); }, fallback); } catch (e) { fallback(); }
  }

  /* ---------- Contato: pré-preenchimento a partir de qualquer ponto do site ---------- */
  function prefill(assunto, msg) {
    if (assunto && $('cfAssunto')) $('cfAssunto').value = assunto;
    if (msg !== undefined && $('cfMsg')) $('cfMsg').value = msg;
    track('prefill', { assunto: assunto || '' });
    if (location.hash === '#contato') window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = '#contato';
    setTimeout(function () { var f = $(msg ? 'cfNome' : 'cfNome'); if (f) f.focus({ preventScroll: true }); }, 500);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-assunto]');
    if (!a) return;
    prefill(a.getAttribute('data-assunto'), undefined);
    e.preventDefault();
  });

  /* ---------- Formulário ---------- */
  var form = $('contatoForm');
  function fieldsText(d) {
    return 'Nome: ' + d.nome + '\nCidade e estado: ' + d.cidade + '\nE-mail: ' + (d.email || 'não informado') +
      '\nTelefone: ' + (d.telefone || 'não informado') + '\nAssunto: ' + d.assunto + '\n\nMensagem:\n' + d.mensagem;
  }
  function showErr(m) { var el = $('cfErr'); el.hidden = !m; el.textContent = m || ''; }
  function showOk(m) { var el = $('cfOkMsg'); el.hidden = !m; el.textContent = m || ''; }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); showErr(''); showOk('');
      var d = {
        nome: $('cfNome').value.trim(), cidade: $('cfCidade').value.trim(), email: $('cfEmail').value.trim(),
        telefone: $('cfTel').value.trim(), assunto: ASSUNTOS[$('cfAssunto').value] || 'Outro assunto', mensagem: $('cfMsg').value.trim()
      };
      var bad = null;
      if (!d.nome) bad = ['cfNome', 'Informe o seu nome completo.'];
      else if (!d.cidade) bad = ['cfCidade', 'Informe a cidade e o estado.'];
      else if (!d.email && !d.telefone) bad = ['cfEmail', 'Informe um e-mail ou um telefone para o retorno.'];
      else if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad = ['cfEmail', 'Confira o e-mail informado.'];
      else if (!d.mensagem) bad = ['cfMsg', 'Escreva um resumo do assunto.'];
      else if (!$('cfOk').checked) bad = ['cfOk', 'Para enviar, é necessário autorizar o uso dos dados para o retorno.'];
      if (bad) { showErr(bad[1]); $(bad[0]).focus(); return; }
      if (form.website && form.website.value) { showOk('Mensagem enviada.'); return; }

      var btn = $('cfEnviar');
      var endpoint = cfg.formEndpoint || (cfg.formAccessKey ? 'https://splitforms.com/api/submit' : '');
      if (endpoint) {
        btn.disabled = true; btn.textContent = 'Enviando...';
        var fd = new FormData();
        if (cfg.formAccessKey) fd.append('access_key', cfg.formAccessKey);
        fd.append('subject', 'Contato pelo site: ' + d.assunto);
        fd.append('_subject', 'Contato pelo site: ' + d.assunto);
        fd.append('name', d.nome);
        fd.append('email', d.email);
        fd.append('replyto', d.email);
        fd.append('telefone', d.telefone);
        fd.append('cidade', d.cidade);
        fd.append('assunto', d.assunto);
        fd.append('message', d.mensagem);
        fd.append('botcheck', '');
        fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success !== false }; }); })
          .then(function (res) {
            if (!res.ok) throw new Error('falha');
            showOk('Mensagem enviada. O retorno será feito pelo advogado, no contato informado.');
            track('form_enviado'); form.reset(); $('cfAssunto').value = 'outro';
          })
          .catch(function () { showErr('Não foi possível enviar agora. Use o botão de e-mail acima ou copie a mensagem e envie para ' + EMAIL + '.'); $('cfCopiar').hidden = false; })
          .then(function () { btn.disabled = false; btn.textContent = 'Enviar mensagem'; });
      } else {
        var url = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Contato pelo site: ' + d.assunto) + '&body=' + encodeURIComponent(fieldsText(d));
        track('form_mailto');
        location.href = url;
        showOk('Abrimos o seu aplicativo de e-mail com a mensagem pronta. Se nada abriu, use "Copiar mensagem" e envie para ' + EMAIL + '.');
        $('cfCopiar').hidden = false;
      }
    });
    $('cfCopiar').addEventListener('click', function () {
      copy('Para: ' + EMAIL + '\n\n' + fieldsText({
        nome: $('cfNome').value.trim(), cidade: $('cfCidade').value.trim(), email: $('cfEmail').value.trim(),
        telefone: $('cfTel').value.trim(), assunto: ASSUNTOS[$('cfAssunto').value], mensagem: $('cfMsg').value.trim()
      }), 'Mensagem copiada');
    });
  }

  /* ---------- Instagram opcional (config.js) ---------- */
  var list = $('contactList');
  if (cfg.instagram && /^[\w.]{1,30}$/.test(cfg.instagram) && list) {
    var di = document.createElement('div');
    di.innerHTML = '<dt>Instagram</dt><dd><a target="_blank" rel="noopener"></a></dd>';
    var ia = di.querySelector('a'); ia.href = 'https://www.instagram.com/' + cfg.instagram + '/'; ia.textContent = '@' + cfg.instagram;
    list.appendChild(di);
  }

  /* ---------- Calculadora: salvar dados, enviar cálculo e lembrete no calendário ---------- */
  var KEY = 'tr_calc_v1', last = null;
  try {
    var saved = JSON.parse(store.get(KEY) || 'null');
    if (saved) {
      if (saved.c) { $('dtContrato').value = saved.c; $('dtContrato').dispatchEvent(new Event('input')); }
      if (saved.v) { $('valorPago').value = saved.v; $('valorPago').dispatchEvent(new Event('input')); }
    }
  } catch (e) {}
  function f2(d) { return ('0' + d.getUTCDate()).slice(-2) + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/' + d.getUTCFullYear(); }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  document.addEventListener('calc', function (e) {
    last = e.detail;
    $('calcCta').hidden = !last;
    $('savedNote').hidden = !$('dtContrato').value;
    if ($('dtContrato').value.length === 10 || $('valorPago').value) store.set(KEY, JSON.stringify({ c: $('dtContrato').value, v: $('valorPago').value }));
  });
  $('btnIcs').addEventListener('click', function () {
    if (!last) return;
    var d = last.lim, ymd = function (x) { return x.getUTCFullYear() + ('0' + (x.getUTCMonth() + 1)).slice(-2) + ('0' + x.getUTCDate()).slice(-2); };
    var next = new Date(d.getTime() + 86400000), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tiago Ramos Advocacia//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + stamp + '-tolerancia@tiagoramos.adv.br', 'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + ymd(d), 'DTEND;VALUE=DATE:' + ymd(next),
      'SUMMARY:Fim da tolerância de 180 dias (cálculo informativo)',
      'DESCRIPTION:Data calculada de forma informativa com base no art. 43-A da Lei 4.591/64. Não substitui a análise do caso por advogado.',
      'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', 'DESCRIPTION:Falta uma semana para o fim da tolerância de 180 dias', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'fim-da-tolerancia.ics'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    track('ics'); toast('Arquivo de calendário baixado');
  });
  $('btnEnviarCalculo').addEventListener('click', function () {
    if (!last) return;
    var m = 'Imóvel na planta com atraso. Dados do cálculo informativo:\n' +
      '- Data de entrega prevista no contrato: ' + f2(last.c) + '\n- Data de referência: ' + f2(last.r) +
      '\n- Fim da tolerância de 180 dias: ' + f2(last.lim) + '\n- Dias além da tolerância: ' + Math.max(0, last.dT) +
      (last.v > 0 ? '\n- Valor pago informado: ' + brl(last.v) : '') + '\n\nGostaria de uma análise do meu caso.';
    prefill('imovel', m);
  });

  /* ---------- Checklist de documentos ---------- */
  var DK = 'tr_docs_v1', boxes = Array.prototype.slice.call(document.querySelectorAll('#docsList input'));
  try { var sd = JSON.parse(store.get(DK) || '[]'); boxes.forEach(function (b) { b.checked = sd.indexOf(b.getAttribute('data-doc')) !== -1; }); } catch (e) {}
  function docsUpdate() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    $('docsCount').textContent = n + ' de ' + boxes.length + ' documentos reunidos';
    $('docsFill').style.width = (n / boxes.length * 100) + '%';
    store.set(DK, JSON.stringify(boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.getAttribute('data-doc'); })));
  }
  boxes.forEach(function (b) { b.addEventListener('change', docsUpdate); });
  docsUpdate();
  function docsText() {
    return boxes.map(function (b) { return (b.checked ? '[x] ' : '[ ] ') + b.getAttribute('data-doc'); }).join('\n');
  }
  $('docsCopy').addEventListener('click', function () { copy('Documentos para análise (imóvel na planta com atraso):\n' + docsText(), 'Lista copiada'); track('docs_copiar'); });
  $('docsSend').addEventListener('click', function () {
    prefill('imovel', 'Imóvel na planta com atraso. Situação dos documentos:\n' + docsText() + '\n\nGostaria de uma análise do meu caso.');
  });

  /* ---------- Isenção de IR: verificador informativo ---------- */
  var sit = $('vfSit'), doe = $('vfDoenca'), out = $('vfOut');
  Array.prototype.forEach.call(document.querySelectorAll('.diseases li'), function (li) {
    var o = document.createElement('option'); o.value = 'lista'; o.textContent = li.lastChild.textContent.trim(); doe.appendChild(o);
  });
  [['nao', 'Outra doença, que não está na lista'], ['nsei', 'Ainda não sei o diagnóstico ou se está na lista']].forEach(function (x) {
    var o = document.createElement('option'); o.value = x[0]; o.textContent = x[1]; doe.appendChild(o);
  });
  function vf() {
    var s = sit.value, d = doe.value;
    if (!s || !d) { out.innerHTML = '<p class="vf-empty">Selecione as duas opções ao lado para ver o resultado informativo.</p>'; return; }
    var t, cls = 'info', cite;
    var inativo = s === 'aposentado' || s === 'pensionista' || s === 'militar';
    if (s === 'ativa') { t = 'A isenção não alcança o salário de quem está na ativa, mesmo com doença grave. Ela vale para os proventos de inatividade.'; cite = 'STJ, Tema Repetitivo 1.037'; cls = 'warn'; }
    else if (!inativo) { t = 'A isenção prevista em lei vale para rendimentos de aposentadoria, pensão e reserva ou reforma. Outras rendas continuam tributadas, e o caso exige análise individual.'; cite = 'Lei 7.713/1988, art. 6º, XIV'; cls = 'warn'; }
    else if (d === 'lista') { t = 'Em tese, a situação informada se enquadra nos critérios da lei: rendimentos de inatividade e doença entre as previstas. A doença precisa ser comprovada, e quem está curado pode manter o direito. A restituição, quando cabível, é em regra limitada aos últimos 5 anos.'; cite = 'Lei 7.713/1988, art. 6º, XIV · Súmula 627 do STJ · art. 168 do CTN'; cls = 'ok'; }
    else if (d === 'nao') { t = 'A isenção depende de a doença estar entre as 17 previstas em lei. O caso concreto precisa ser analisado por advogado.'; cite = 'Lei 7.713/1988, art. 6º, XIV'; cls = 'warn'; }
    else { t = 'Confira a lista das 17 doenças acima. A isenção depende de a doença estar entre as previstas em lei e de comprovação, o que exige análise do caso.'; cite = 'Lei 7.713/1988, art. 6º, XIV'; }
    out.innerHTML = '<p class="vf-tag ' + cls + '">Resultado informativo</p><p class="vf-text"></p><span class="cite"></span>' +
      '<p class="vf-note">Orientação geral, sem análise individual e sem promessa de resultado. Não substitui a avaliação do caso por advogado.</p>' +
      '<button type="button" class="btn small" id="vfLevar">Levar esta dúvida ao escritório</button>';
    out.querySelector('.vf-text').textContent = t; out.querySelector('.cite').textContent = cite;
    $('vfLevar').addEventListener('click', function () {
      prefill('ir', 'Isenção de IR por doença grave.\nSituação: ' + sit.options[sit.selectedIndex].text + '\nDoença: ' + doe.options[doe.selectedIndex].text + '\n\nGostaria de uma análise do meu caso.');
    });
    track('verificador_ir', { r: cls });
  }
  sit.addEventListener('change', vf); doe.addEventListener('change', vf);

  /* ---------- Compartilhar ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (p) {
    var foot = p.querySelector('.panel-foot'); if (!foot) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost small share';
    b.innerHTML = '<svg class="ico"><use href="#i-compartilhar"/></svg>Compartilhar';
    b.addEventListener('click', function () {
      var url = location.origin + location.pathname + '#' + p.id, title = (p.querySelector('h2') || document.body).textContent.trim();
      track('compartilhar', { aba: p.id });
      if (navigator.share) navigator.share({ title: title, url: url }).catch(function () {}); else copy(url, 'Link copiado');
    });
    foot.insertBefore(b, foot.querySelector('.btn:not(.share)'));
  });

  /* ---------- Botão fixo de contato (discreto, sem urgência) ---------- */
  var fab = $('fab');
  function fabUpdate() {
    var show = scrollY > 600 && location.hash !== '#contato';
    fab.hidden = !show;
  }
  window.addEventListener('scroll', fabUpdate, { passive: true });
  window.addEventListener('hashchange', fabUpdate);
  fabUpdate();
  fab.addEventListener('click', function () { track('fab'); });
})();
