# Prompts para gerar as imagens (ChatGPT)

Imagem da aba "Imóvel atrasado": prédio em construção. Sem pessoas, sem texto, sem marcas.
Gere as duas versões, salve com estes nomes exatos e coloque em `assets/img/`:

- `imovel-desktop.png` (quadrada, 1:1)
- `imovel-mobile.png` (horizontal, 16:10)

O site troca a ilustração provisória pela imagem sozinho, sem mexer em código. Pode ser `.webp`, `.jpg` ou `.png`.

## Versão computador (quadrada 1:1)

Crie uma ilustração digital premium, em formato quadrado 1:1 (1600 x 1600 px), de um edifício residencial moderno em construção, vista frontal levemente em três quartos, ao entardecer (hora azul). A estrutura de concreto aparece com os andares de baixo já concluídos e com janelas iluminadas em tom dourado quente, e os andares de cima ainda só em estrutura, com pilares, lajes e vergalhões expostos. Ao lado, um guindaste torre alto, com braço, cabo e uma viga de aço suspensa. Detalhes discretos de andaimes e tapumes. Ao fundo, a silhueta suave de outros prédios da cidade.

Estilo: sofisticado, sóbrio e elegante, como um escritório de advocacia de alto padrão. Ilustração 3D limpa ou arte vetorial refinada com iluminação cinematográfica, sem exagero. Paleta: azul marinho profundo (#0a1630 e #050d22) como cor dominante, azul elétrico suave (#6aa6ff) nos contornos e reflexos, e dourado (#d9b66f) nas luzes das janelas e no guindaste. Fundo em azul marinho escuro com um brilho azul no canto superior direito, para se fundir com um site de fundo escuro. Deixe um pouco de espaço livre no céu.

Regras: sem nenhuma pessoa, sem texto, sem letras, sem logotipos, sem marcas, sem marca d'água, sem placas legíveis. Sem estilo de desenho infantil ou de cartoon. Composição limpa, com o prédio ocupando a parte central e inferior.

## Versão celular (horizontal 16:10)

Crie a mesma ilustração, agora em formato horizontal 16:10 (1600 x 1000 px), para ser exibida como faixa larga no topo de uma página de celular. Edifício residencial moderno em construção ao entardecer (hora azul), posicionado um pouco à esquerda do centro, com os andares de baixo concluídos e janelas iluminadas em dourado quente, e os andares de cima só em estrutura de concreto com pilares e vergalhões expostos. Guindaste torre à direita do prédio, com braço, cabo e viga de aço suspensa. Silhueta suave de outros prédios ao fundo.

Estilo, paleta e regras idênticos à versão quadrada: azul marinho profundo (#0a1630, #050d22), azul elétrico suave (#6aa6ff) e dourado (#d9b66f). Fundo azul marinho escuro com brilho azul discreto no canto superior direito. Muito importante: mantenha o prédio e o guindaste inteiros e centralizados na parte do meio da imagem, com folga de céu em cima e de chão embaixo, para que o recorte em faixa não corte nada. Sem pessoas, sem texto, sem logotipos, sem marcas, sem marca d'água.

## Dicas

- Se a primeira não ficar boa, peça: "mantenha a composição, mas deixe o fundo mais escuro (#0a1630) e as luzes das janelas mais douradas".
- Se vier com texto ou placa legível, peça: "refaça sem nenhum texto ou letra na imagem".
- Depois de salvar os arquivos em `assets/img/`, é só publicar de novo na Vercel.
