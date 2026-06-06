import { useState, useCallback } from 'react';

export const usePokemon = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentType, setCurrentType] = useState(null);
  const limit = 12;

  const fetchPokemons = useCallback(async (offset) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setTotalCount(data.count);
      
      const detailsPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
      const pokemonsData = await Promise.all(detailsPromises);
      setPokemons(pokemonsData);
      setCurrentOffset(offset);
      setCurrentType(null);
    } catch (err) {
      setError('Erro ao carregar Pokémon. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const searchPokemon = useCallback(async (name) => {
    if (!name || name.trim() === '') {
      setError('Digite o nome de um Pokémon para buscar');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      
      if (response.status === 404) {
        setPokemons([]);
        setError(`"${name}" não foi encontrado!`);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const pokemon = await response.json();
      setPokemons([pokemon]);
      setTotalCount(1);
      setCurrentType(null);
      setError(null);
      
    } catch (err) {
      setError('Erro ao buscar Pokémon. Verifique sua internet.');
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPokemonsByType = useCallback(async (typeName) => {
    setLoading(true);
    setError(null);
    setCurrentType(typeName);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const pokemonUrls = data.pokemon.map(p => p.pokemon.url);
      const pokemonsData = await Promise.all(pokemonUrls.map(url => fetch(url).then(res => res.json())));
      setPokemons(pokemonsData);
      setTotalCount(pokemonsData.length);
    } catch (err) {
      setError(`Erro ao carregar Pokémon do tipo ${typeName}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFavoritePokemons = useCallback(async (favoriteIds) => {
    setLoading(true);
    setError(null);
    setCurrentType(null);
    
    if (favoriteIds.size === 0) {
      setPokemons([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    
    try {
      const promises = Array.from(favoriteIds).map(id => 
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
      );
      const favoritePokemons = await Promise.all(promises);
      setPokemons(favoritePokemons);
      setTotalCount(favoritePokemons.length);
    } catch (err) {
      setError('Erro ao carregar favoritos');
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTypeFilter = useCallback(() => {
    setCurrentType(null);
    fetchPokemons(0);
  }, [fetchPokemons]);

  return {
    pokemons,
    loading,
    error,
    totalCount,
    currentOffset,
    currentType,
    fetchPokemons,
    fetchPokemonsByType,
    searchPokemon,
    getFavoritePokemons,
    clearTypeFilter
  };
};
