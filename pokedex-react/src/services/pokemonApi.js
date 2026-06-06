import axios from "axios";

const API_BASE_URL = "https://pokeapi.co/api/v2";

export const pokemonApi = {
  getPokemonList: async (limit = 12, offset = 0) => {
    const response = await axios.get(`${API_BASE_URL}/pokemon`, {
      params: { limit, offset },
    });
    return response.data;
  },

  getPokemonDetails: async (urlOrId) => {
    const response = await axios.get(urlOrId);
    return response.data;
  },

  getMultiplePokemonDetails: async (urls) => {
    const promises = urls.map((url) => axios.get(url));
    const responses = await Promise.all(promises);
    return responses.map((res) => res.data);
  },

  searchPokemonByName: async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getAllPokemonNames: async () => {
    const response = await axios.get(`${API_BASE_URL}/pokemon`, {
      params: { limit: 1000 },
    });
    return response.data.results.map((p) => p.name);
  },
};
