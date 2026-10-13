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

## Pendências
- **Domínio:** o código usa `https://tiagoramos.adv.br` (canonical, Open Graph, JSON-LD, sitemap, robots). Ao definir o domínio final, substitua em `index.html`, `sitemap.xml` e `robots.txt`.
- **Instagram:** há um bloco comentado na aba Contato. Ative com o @ definitivo e acrescente `sameAs` ao JSON-LD.
- **WhatsApp:** número não exibido, por decisão pendente.
