let cardContainer = document.querySelector(".card-container");
let campoBusca = document.getElementById("campo-busca");
let sortSelect = document.getElementById("sort-select");
let dados = [];
let ultimoFiltro = '';

async function carregarDados() {
    if (dados.length === 0) {
        try {
            const resposta = await fetch('data.json');
            dados = await resposta.json();
        } catch (err) {
            console.error('Erro ao carregar data.json', err);
            dados = [];
        }
    }
}

async function iniciarBusca() {
    await carregarDados();
    const termo = (campoBusca.value || '').toLowerCase();
    ultimoFiltro = termo;
    let filtrados = dados.filter(d => {
        return (d.nome && d.nome.toLowerCase().includes(termo)) || (d.sinopse && d.sinopse.toLowerCase().includes(termo));
    });
    filtrados = aplicarOrdenacao(filtrados);
    renderizarCards(filtrados);
}

function aplicarOrdenacao(lista) {
    const criterio = (sortSelect && sortSelect.value) || 'default';
    const copy = [...lista];
    const parseRating = v => {
        const n = parseFloat(String(v).replace(',', '.'));
        return isNaN(n) ? 0 : n;
    };
    const parseReviews = s => {
        if (!s) return 0;
        // Accept either a string or an object containing avaliações/avaliacoes
        let str = '';
        if (typeof s === 'object') {
            str = String(s['avaliações'] || s.avaliacoes || '') || '';
        } else {
            str = String(s || '');
        }
        str = str.toLowerCase().trim();

        // Find numeric part (handles 1.2, 1,234, 1,2 etc.)
        const m = str.match(/[0-9]+[\d\.,]*/);
        if (!m) return 0;
        let numStr = m[0];
        // remove thousands separators (dot) but keep decimal comma/dot
        // normalize: remove dots, replace comma with dot
        numStr = numStr.replace(/\./g, '').replace(/,/g, '.');
        let num = parseFloat(numStr);
        if (isNaN(num)) num = 0;

        // determine multiplier
        if (str.includes('mil') || /\bk\b/.test(str) || /k$/.test(str)) {
            return Math.round(num * 1000);
        }
        if (str.includes('m') && !str.includes('mil')) {
            // crude million detection (e.g., '1.2m')
            return Math.round(num * 1000000);
        }
        return Math.round(num);
    };
    const parseYear = v => {
        if (!v) return 0;
        const s = String(v).trim();
        // tenta extrair os 4 primeiros dígitos que representem o ano
        const m = s.match(/(19|20)\d{2}/);
        if (m && m[0]) return parseInt(m[0], 10);
        const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
        return isNaN(n) ? 0 : n;
    };

    switch (criterio) {
        case 'az':
            copy.sort((a,b) => (a.nome||'').localeCompare(b.nome||'', 'pt'));
            break;
        case 'za':
            copy.sort((a,b) => (b.nome||'').localeCompare(a.nome||'', 'pt'));
            break;
        case 'rating-desc':
            copy.sort((a,b) => parseRating(b.nota) - parseRating(a.nota));
            break;
        case 'rating-asc':
            copy.sort((a,b) => parseRating(a.nota) - parseRating(b.nota));
            break;
        case 'reviews-desc':
            copy.sort((a,b) => parseReviews(b) - parseReviews(a));
            break;
        case 'year-desc':
            copy.sort((a,b) => parseYear(b.ano_lancamento || b.data_lancamento) - parseYear(a.ano_lancamento || a.data_lancamento));
            break;
        case 'year-asc':
            copy.sort((a,b) => parseYear(a.ano_lancamento || a.data_lancamento) - parseYear(b.ano_lancamento || b.data_lancamento));
            break;
        default:
            // mantem ordem original
            break;
    }
    return copy;
}

function renderizarCards(lista) {
    cardContainer.innerHTML = '';
    if (!lista || lista.length === 0) {
        cardContainer.innerHTML = '<p style="color:var(--muted-color);">Nenhum resultado encontrado.</p>';
        return;
    }
    for (const dado of lista) {
        const article = document.createElement('article');

        const categoriasRaw = Array.isArray(dado.categorias) ? dado.categorias : (typeof dado.categorias === 'string' ? dado.categorias.split(/\s*,\s*/g) : []);
        const categoriasDisplay = (categoriasRaw && categoriasRaw.length > 0) ? (categoriasRaw.length > 3 ? categoriasRaw.slice(0,3).join(', ') + ', ...' : categoriasRaw.join(', ')) : (dado.categorias || '');
        const avals = dado['avaliações'] || dado.avaliacoes || '';

        // Trunca sinopse no JS como fallback para navegadores antigos
        const fullSinopse = dado.sinopse || '';
        const sinopseText = fullSinopse.length > 300 ? fullSinopse.slice(0, 300).trim() + '...' : fullSinopse;

        // Placeholder SVG quando não existir capa (inline data URI) — resoluções e tipografia maiores para legibilidade
        const placeholderSvg = `
            <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1800' viewBox='0 0 1200 1800'>
                <rect width='100%' height='100%' fill='#071b12'/>
                <text x='50%' y='34%' fill='#f2c94c' font-family='Quicksand, sans-serif' font-size='110' font-weight='800' text-anchor='middle'>ops</text>
                <text x='50%' y='50%' fill='#f2c94c' font-family='Quicksand, sans-serif' font-size='56' font-weight='700' text-anchor='middle'>não conseguimos</text>
                <text x='50%' y='64%' fill='#f2c94c' font-family='Quicksand, sans-serif' font-size='56' font-weight='700' text-anchor='middle'>encontrar o cartaz</text>
            </svg>
        `;
        const encodedPlaceholder = encodeURIComponent(placeholderSvg.trim());
        const posterSrc = dado.capa ? dado.capa : `data:image/svg+xml;charset=UTF-8,${encodedPlaceholder}`;

        article.innerHTML = `
            <img class="poster" src="${posterSrc}" alt="${dado.capa ? 'Capa de ' + dado.nome : 'Sem cartaz disponível'}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;charset=UTF-8,${encodedPlaceholder}'" />
            <div class="card-content">
                <h2>${dado.nome}</h2>
                <p><strong>Ano:</strong> ${dado.ano_lancamento || dado.data_lancamento || ''}</p>
                <p class="sinopse">${sinopseText}</p>
                <p class="generos"><strong>Gênero:</strong> ${categoriasDisplay}</p>
                <p><strong>Avaliação:</strong> ${dado.nota || '-'} ${avals ? '• ' + avals : ''}</p>
                <a class="trailer-link" href="${dado.trailer}" target="_blank" rel="noopener">Assistir Trailer</a>
            </div>
        `;

        cardContainer.appendChild(article);
    }
}

// Re-renderiza quando o método de ordenação muda
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        // reaplica busca com último filtro conhecido
        iniciarBusca();
    });
}

// Executa carregamento inicial e renderiza todos
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    // renderiza todos por padrão
    const todos = aplicarOrdenacao(dados);
    renderizarCards(todos);
});