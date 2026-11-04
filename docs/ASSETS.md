# Assets e créditos

## Produção do estudo

- Produto-base: `rabbit_r1_base_v27.blend`.
- Closes: `rabbit_r1_closes_v28.blend`.
- Composição final: `rabbit_r1_web_finale_v29.blend`.
- Masters PNG RGB16 em `renders/`; cópias verificadas por SHA256.
- Modelo de navegador: `dist/assets/rabbit-r1-hq.glb`, com 462.052 triângulos e compressão Draco.
- Vídeo do hero: `dist/assets/rabbit-hero.webm` e `dist/assets/rabbit-hero.mp4`.
- O coelho da tela é a reconstrução gráfica aprovada para o estudo.
- A tela de aplicativos é uma ilustração baseada nas referências fornecidas.

Os arquivos Blender incluem materiais e arte do produto. Os materiais do GLB são adaptados em `src/viewer.js` para iluminação e reflexos em tempo real. Os renders originais continuam como imagens separadas.

## Identidade e referências

- [rabbit r1](https://www.rabbit.tech/rabbit-r1): identidade visual, wordmark e tipografia Power Grotesk.
- [iF Design Award 2025](https://www.rabbit.tech/newsroom/if-design-award-2025): selo exibido na página.
- [rabbit creations](https://www.rabbit.tech/creations): referência para os coelhos que aparecem por clique.

Rabbit, teenage engineering e os demais titulares mantêm os direitos sobre seus respectivos nomes, marcas, fontes e assets. O repositório não aplica uma licença de código aberto a esses materiais.

## Bibliotecas

Three.js, GSAP, esbuild e Draco mantêm suas próprias licenças. As versões usadas estão registradas em `package-lock.json`.
