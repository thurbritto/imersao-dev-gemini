# CineNoel — Catálogo Natalino

Projeto estático (HTML/CSS/JS) que exibe um catálogo de filmes festivos a partir de `data.json`.

Resumo rápido:
- Abra `index.html` ou sirva o diretório local com um servidor HTTP.
- Busque, ordene por diversos filtros e navegue pelos filmes; capas ausentes mostram um placeholder. 

Como rodar localmente (PowerShell):

```powershell
# a partir da raiz do projeto
python -m http.server 8000; # abrir http://localhost:8000
```

Arquivos principais:
- `index.html` — página
- `style.css` — estilos
- `script.js` — lógica de carregamento/ordenação/render
- `data.json` — dados dos filmes

Status:
- Frontend pronto. 
- `data.json` ainda precisa ser enriquecido com URLs de `capa` e `trailer` (pendente). Alguns filmes ficaram sem capa e/ou sem link de trailer.

<img width="1901" height="946" alt="image" src="https://github.com/user-attachments/assets/324f40e0-e4d1-4cb0-a65b-275e7cdbad36" />
