import { useState, useCallback, useRef } from 'react';

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
      const data = await response.json();
      setTotalCount(data.count);
      
      const details = await Promise.all(data.results.map(p => fetch(p.url).then(r => r.json())));
      setPokemons(details);
      setCurrentOffset(offset);
      setCurrentType(null);
    } catch (err) {
      setError('Erro ao carregar Pokémon.');
    }
    setLoading(false);
  }, [limit]);

  const searchPokemon = useCallback(async (name) => {
    console.log('🔍 Buscando:', name);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      
      if (!response.ok) {
        setPokemons([]);
        setError(`"${name}" não foi encontrado!`);
        setLoading(false);
        return;
      }
      
      const pokemon = await response.json();
      console.log('✅ Encontrado:', pokemon.name);
      
      // Atualizar estado UMA vez
      setPokemons([pokemon]);
      setTotalCount(1);
      setCurrentType(null);
      
    } catch (err) {
      console.error('❌ Erro:', err);
      setError('Erro ao buscar Pokémon.');
      setPokemons([]);
    }
    setLoading(false);
  }, []);

  const fetchPokemonsByType = useCallback(async (typeName) => {
    setLoading(true);
    setError(null);
    setCurrentType(typeName);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
      const data = await response.json();
      const urls = data.pokemon.map(p => p.pokemon.url);
      const pokemonsData = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
      setPokemons(pokemonsData);
      setTotalCount(pokemonsData.length);
    } catch (err) {
      setError(`Erro ao carregar tipo ${typeName}`);
    }
    setLoading(false);
  }, []);

  const getFavoritePokemons = useCallback(async (favoriteIds) => {
    if (favoriteIds.size === 0) {
      setPokemons([]);
      return;
    }
    
    setLoading(true);
    try {
      const favs = await Promise.all(
        Array.from(favoriteIds).map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()))
      );
      setPokemons(favs);
      setTotalCount(favs.length);
    } catch (err) {
      setError('Erro ao carregar favoritos');
    }
    setLoading(false);
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