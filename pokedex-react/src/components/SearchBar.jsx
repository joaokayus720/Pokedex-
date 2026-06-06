import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ onSearch, onClear, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPokemon, setAllPokemon] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const loadPokemonNames = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        setAllPokemon(data.results.map(p => p.name));
      } catch (error) {
        console.error('Erro ao carregar nomes:', error);
      }
    };
    loadPokemonNames();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = allPokemon
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [query, allPokemon]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="search-wrapper" ref={suggestionsRef}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Ex: pikachu, charizard, mewtwo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoComplete="off"
        />
        <div className="input-group-append">
          <button className="btn btn-warning" onClick={handleSearch} disabled={isLoading}>
            <i className="fas fa-search"></i> Buscar
          </button>
          <button className="btn btn-secondary" onClick={handleClear} disabled={isLoading}>
            <i className="fas fa-times"></i> Limpar
          </button>
        </div>
      </div>
      
      {showSuggestions && (
        <div className="suggestions-box">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <i className="fas fa-paw"></i> {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;