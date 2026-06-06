import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'pokedexFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        setFavorites(new Set(arr.map(id => Number(id))));
      } catch(e) {}
    }
  }, []);

  const saveFavorites = (newFavorites) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
  };

  const toggleFavorite = (pokemonId) => {
    const idNum = Number(pokemonId);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(idNum)) {
        newFavorites.delete(idNum);
      } else {
        newFavorites.add(idNum);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (pokemonId) => favorites.has(Number(pokemonId));

  return { favorites, toggleFavorite, isFavorite };
};