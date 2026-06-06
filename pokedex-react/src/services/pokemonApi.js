import axios from 'axios';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonApi = {
  // Buscar lista de Pokémon com paginação
  getPokemonList: async (limit = 12, offset = 0) => {
    const response = await axios.get(`${API_BASE_URL}/pokemon`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Buscar dados detalhados de um Pokémon
  getPokemonDetails: async (urlOrId) => {
    const response = await axios.get(urlOrId);
    return response.data;
  },

  // Buscar múltiplos Pokémon por URLs
  getMultiplePokemonDetails: async (urls) => {
    const promises = urls.map(url => axios.get(url));
    const responses = await Promise.all(promises);
    return responses.map(res => res.data);
  },

  // Buscar Pokémon por nome
  searchPokemonByName: async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  // Buscar todos os nomes para autocomplete
  getAllPokemonNames: async () => {
    const response = await axios.get(`${API_BASE_URL}/pokemon`, {
      params: { limit: 1000 }
    });
    return response.data.results.map(p => p.name);
  },

  // === NOVAS FUNÇÕES PARA TIPOS ===
  
  // Buscar todos os tipos de Pokémon
  getAllTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/type`);
    return response.data.results;
  },

  // Buscar detalhes de um tipo específico (inclui lista de Pokémon)
  getTypeDetails: async (typeName) => {
    const response = await axios.get(`${API_BASE_URL}/type/${typeName.toLowerCase()}`);
    return response.data;
  },

  // Buscar Pokémon por tipo (retorna todos os Pokémon daquele tipo)
  getPokemonsByType: async (typeName) => {
    const typeData = await axios.get(`${API_BASE_URL}/type/${typeName.toLowerCase()}`);
    const pokemonUrls = typeData.data.pokemon.map(p => p.pokemon.url);
    const pokemonsData = await Promise.all(pokemonUrls.map(url => axios.get(url)));
    return pokemonsData.map(res => res.data);
  }
};