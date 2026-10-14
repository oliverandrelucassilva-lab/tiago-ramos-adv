# Tiago Ramos Consultoria e Assessoria Jurídica

Landing page estática (HTML, CSS e JS puros, sem build). Deploy na Vercel como projeto estático: framework "Other", sem comando de build, diretório raiz.

## Estrutura
- `index.html`: conteúdo, SEO e dados estruturados (LegalService)
- `assets/style.css`, `assets/app.js`: estilo e comportamento (abas e calculadora)
- `assets/logo.png`: logo (extraída do protótipo, recolorida para fundo azul marinho)
- `sitemap.xml`, `robots.txt`, `vercel.json`

## Acrescentar uma aba
1. Em `index.html`, no `<nav class="tabs">`, copie um `<a href="#nova-aba">Nome</a>`.
2. Crie `<section class="panel" id="nova-aba" aria-labelledby="t-nova">` com um `<h2 id="t-nova" tabindex="-1">`, copiando a estrutura de uma aba existente.

O JavaScript não precisa de alteração.

## Configuração (assets/config.js)
- `instagram`: o @ sem o arroba. Em branco, o link não aparece. Ao definir, acrescente a URL em `sameAs` no JSON-LD de `index.html`.
- `formAccessKey`: chave (access_key) do formulário no SplitForms. Preenchida, o formulário envia a mensagem direto para o e-mail cadastrado no SplitForms.
- `formEndpoint`: endereço do formulário no Formspree (`https://formspree.io/f/xxxxxxx`). Use este campo ou o `formAccessKey`, conforme o serviço escolhido. Com os dois em branco, o formulário abre o app de e-mail do visitante com a mensagem pronta.

## Funcionalidades de contato (assets/leads.js)
Todas dependem de uma ação do visitante: formulário com consentimento (LGPD), botão fixo de contato, envio do resultado da calculadora e do verificador ao formulário, lembrete de calendário (.ics), checklist de documentos salvo no navegador, FAQ (também em dados estruturados FAQPage), compartilhar e Política de Privacidade (`privacidade.html`, texto-base a ser revisado pelo advogado).
Deliberadamente fora, por conflito com o Código de Ética e o Provimento 205/2021 da OAB: pop-up de saída, urgência ou escassez, contador regressivo, "consulta grátis", promoções e depoimentos.

## Estatísticas
O site inclui o script de Web Analytics da Vercel (sem cookies). Para ativar, habilite "Web Analytics" no painel do projeto na Vercel.

## Pendências
- **Domínio:** o código usa `https://tiagoramos.adv.br` (canonical, Open Graph, JSON-LD, sitemap, robots). Ao definir o domínio final, substitua em `index.html`, `sitemap.xml` e `robots.txt`.
- **Instagram:** há um bloco comentado na aba Contato. Ative com o @ definitivo e acrescente `sameAs` ao JSON-LD.
