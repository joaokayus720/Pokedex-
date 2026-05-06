document.addEventListener('DOMContentLoaded', () => {
    // Elementos DOM
    const pokemonList = document.getElementById('pokemon-list');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const showFavBtn = document.getElementById('showFavBtn');
    const showAllBtn = document.getElementById('showAllBtn');
    const loadingDiv = document.getElementById('loadingMsg');
    const errorDiv = document.getElementById('errorMsg');
    const noResultDiv = document.getElementById('noResultMsg');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const navDiv = document.getElementById('navButtons');

    // Modal elements
    const modal = $('#pokemonModal');
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalId = document.getElementById('modalId');
    const modalTypes = document.getElementById('modalTypes');
    const modalHeight = document.getElementById('modalHeight');
    const modalWeight = document.getElementById('modalWeight');

    // Estado da aplicação
    let currentOffset = 0;
    const limit = 12;              // Pokémon por página
    let totalCount = null;
    let isLoading = false;
    let isSearchMode = false;
    let isFavMode = false;         // Exibindo apenas favoritos?
    let currentSearchTerm = '';
    let debounceTimer;
    let allPokemonNames = [];       // Cache para autocomplete

    // ----- FAVORITOS (localStorage) -----
    let favorites = new Set();      // armazena IDs (number)

    function loadFavorites() {
        const stored = localStorage.getItem('pokedexFavorites');
        if (stored) {
            try {
                const arr = JSON.parse(stored);
                favorites = new Set(arr.map(id => Number(id)));
            } catch(e) { favorites = new Set(); }
        }
    }

    function saveFavorites() {
        localStorage.setItem('pokedexFavorites', JSON.stringify(Array.from(favorites)));
    }

    function toggleFavorite(pokemonId) {
        const idNum = Number(pokemonId);
        if (favorites.has(idNum)) {
            favorites.delete(idNum);
        } else {
            favorites.add(idNum);
        }
        saveFavorites();
        // Se estiver no modo favoritos, re-renderiza a lista de favoritos
        if (isFavMode) {
            showOnlyFavorites();
        } else {
            // Atualiza apenas o ícone do card correspondente (sem recarregar tudo)
            const card = document.querySelector(`.pokemon-card[data-id='${idNum}']`);
            if (card) {
                const favIcon = card.querySelector('.favorite-icon');
                if (favIcon) {
                    favIcon.innerHTML = favorites.has(idNum) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
                    favIcon.classList.toggle('favorited', favorites.has(idNum));
                }
            } else {
                // Se não encontrou o card, recarrega a lista atual (caso raro)
                renderCurrentList();
            }
        }
    }

    // ----- Funções de UI e mensagens -----
    function hideMessages() {
        errorDiv.style.display = 'none';
        noResultDiv.style.display = 'none';
    }

    function showLoading(show) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }

    function showError() {
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 4000);
    }

    function showNoResult(customMessage = null) {
        noResultDiv.innerHTML = customMessage || '<i class="fas fa-frown"></i> Nenhum Pokémon encontrado.';
        noResultDiv.style.display = 'block';
    }

    // Highlight para busca
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Abrir modal de detalhes
    async function openPokemonModal(pokemonId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            const officialArt = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
            modalImage.src = officialArt;
            modalName.textContent = data.name;
            modalId.textContent = data.id;
            modalTypes.textContent = data.types.map(t => t.type.name).join(', ');
            modalHeight.textContent = (data.height / 10).toFixed(1);
            modalWeight.textContent = (data.weight / 10).toFixed(1);
            modal.modal('show');
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os detalhes.');
        }
    }

    // Renderizar cards (com favoritos e eventos)
    function renderPokemonCards(pokemonsData, searchTerm = '') {
        pokemonList.innerHTML = '';
        if (!pokemonsData || pokemonsData.length === 0) {
            if (isFavMode) showNoResult('💔 Nenhum favorito ainda. Adicione clicando no ❤️!');
            else showNoResult();
            return;
        }
        hideMessages();
        pokemonsData.forEach(pokemon => {
            const col = document.createElement('div');
            col.classList.add('col-md-4', 'col-sm-6', 'pokemon-card');
            col.setAttribute('data-id', pokemon.id);
            const highlightedName = highlightText(pokemon.name, searchTerm);
            const isFav = favorites.has(pokemon.id);
            const heartIcon = isFav ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
            col.innerHTML = `
                <div class="card">
                    <div class="favorite-icon ${isFav ? 'favorited' : ''}">${heartIcon}</div>
                    <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
                    <div class="card-body">
                        <h5 class="card-title">${highlightedName}</h5>
                        <p class="card-text">ID: ${pokemon.id}</p>
                        <p class="card-text"><small>Altura: ${pokemon.height/10} m | Peso: ${pokemon.weight/10} kg</small></p>
                    </div>
                </div>
            `;
            // Evento de clique no card (abrir modal)
            col.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-icon')) return; // evita conflito
                openPokemonModal(pokemon.id);
            });
            // Evento de favoritar
            const favBtn = col.querySelector('.favorite-icon');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(pokemon.id);
            });
            pokemonList.appendChild(col);
        });
    }

    // Carregar lista paginada normal
    async function fetchPokemons(offset) {
        if (isLoading) return;
        isLoading = true;
        showLoading(true);
        hideMessages();
        pokemonList.innerHTML = '';
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            if (totalCount === null) totalCount = data.count;
            const detailsPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
            const pokemonsData = await Promise.all(detailsPromises);
            renderPokemonCards(pokemonsData, '');
            // Atualiza botões de navegação
            prevBtn.disabled = (offset === 0);
            nextBtn.disabled = (offset + limit >= totalCount);
            currentOffset = offset;
        } catch (err) {
            console.error(err);
            showError();
        } finally {
            isLoading = false;
            showLoading(false);
        }
    }

    // Busca por nome (exato) e exibe no modo busca
    async function searchPokemonByName(name) {
        if (isLoading) return;
        isLoading = true;
        showLoading(true);
        hideMessages();
        pokemonList.innerHTML = '';
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
            if (!response.ok) {
                renderPokemonCards([], name);
                showNoResult(`Nenhum Pokémon com nome "${name}" encontrado.`);
                return;
            }
            const pokemonData = await response.json();
            renderPokemonCards([pokemonData], name);
        } catch (err) {
            console.error(err);
            showError();
        } finally {
            isLoading = false;
            showLoading(false);
        }
    }

    // Mostrar apenas favoritos (buscar dados completos de cada ID)
    async function showOnlyFavorites() {
        if (favorites.size === 0) {
            isFavMode = true;
            isSearchMode = false;
            currentSearchTerm = '';
            pokemonList.innerHTML = '';
            showNoResult('💖 Você ainda não tem Pokémon favoritos. Adicione alguns clicando no coração!');
            // Esconde botões de navegação no modo favoritos
            navDiv.style.display = 'none';
            return;
        }
        isFavMode = true;
        isSearchMode = false;
        currentSearchTerm = '';
        showLoading(true);
        hideMessages();
        pokemonList.innerHTML = '';
        // Esconde botões de paginação em modo favoritos
        navDiv.style.display = 'none';
        try {
            const favIds = Array.from(favorites);
            const favPokemons = [];
            for (const id of favIds) {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    favPokemons.push(data);
                }
            }
            renderPokemonCards(favPokemons, '');
            if (favPokemons.length === 0) showNoResult('Nenhum favorito encontrado.');
        } catch (err) {
            showError();
        } finally {
            showLoading(false);
        }
    }

    // Reset para lista normal (paginação)
    function resetToNormalMode() {
        isFavMode = false;
        isSearchMode = false;
        currentSearchTerm = '';
        searchInput.value = '';
        navDiv.style.display = 'flex';   // mostra botões de navegação novamente
        // Reinicia a paginação a partir do offset atual (ou 0 se não existir)
        if (currentOffset === 0 || !totalCount) {
            fetchPokemons(0);
        } else {
            fetchPokemons(currentOffset);
        }
    }

    // Método para renderizar a lista atual baseada nos modos (usado após favoritar/desfavoritar)
    // No nosso caso, já chamamos showOnlyFavorites ou resetToNormalMode diretamente.
    // Mas para consistência, usamos as funções principais.

    // ----- Autocomplete (cache de nomes) -----
    async function loadAllPokemonNames() {
        try {
            const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const data = await resp.json();
            allPokemonNames = data.results.map(p => p.name);
        } catch(e) { console.warn('Erro ao carregar nomes para sugestões'); }
    }
    loadAllPokemonNames();

    function showSuggestions(term) {
        if (!term || term.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }
        const filtered = allPokemonNames.filter(name => name.includes(term.toLowerCase())).slice(0, 8);
        if (filtered.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }
        suggestionsBox.innerHTML = '';
        filtered.forEach(name => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = highlightText(name, term);
            div.addEventListener('click', () => {
                searchInput.value = name;
                suggestionsBox.style.display = 'none';
                // Entra em modo busca
                isFavMode = false;
                isSearchMode = true;
                currentSearchTerm = name;
                navDiv.style.display = 'flex';
                searchPokemonByName(name);
            });
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    }

    function handleSearchInput(e) {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            showSuggestions(query);
        }, 300);
    }

    // ----- Eventos dos botões -----
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query === '') {
            alert('Digite o nome de um Pokémon!');
            return;
        }
        // Sai do modo favoritos e entra em modo busca
        isFavMode = false;
        isSearchMode = true;
        currentSearchTerm = query;
        navDiv.style.display = 'flex';
        searchPokemonByName(query);
        suggestionsBox.style.display = 'none';
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        suggestionsBox.style.display = 'none';
        resetToNormalMode();
    });

    showFavBtn.addEventListener('click', () => {
        showOnlyFavorites();
    });

    showAllBtn.addEventListener('click', () => {
        resetToNormalMode();
    });

    // Paginação (só funciona se não estiver em modo busca ou favoritos)
    nextBtn.addEventListener('click', () => {
        if (!isSearchMode && !isFavMode && !isLoading && nextBtn.disabled === false) {
            const newOffset = currentOffset + limit;
            if (totalCount && newOffset < totalCount) fetchPokemons(newOffset);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (!isSearchMode && !isFavMode && !isLoading && prevBtn.disabled === false) {
            const newOffset = Math.max(0, currentOffset - limit);
            if (newOffset !== currentOffset) fetchPokemons(newOffset);
        }
    });

    // Fechar sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                isFavMode = false;
                isSearchMode = true;
                currentSearchTerm = query;
                navDiv.style.display = 'flex';
                searchPokemonByName(query);
                suggestionsBox.style.display = 'none';
            }
        }
    });

    // Inicialização
    loadFavorites();
    fetchPokemons(0);
});