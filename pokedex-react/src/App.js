import React, { useState, useEffect } from "react";
import "./App.css";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import SearchBar from "./components/SearchBar";
import TypeFilter from "./components/TypeFilter";
import { usePokemon } from "./hooks/usePokemon";
import { useFavorites } from "./hooks/useFavorites";

function App() {
  const [viewMode, setViewMode] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const { 
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
  } = usePokemon();
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const limit = 12;

  useEffect(() => {
    fetchPokemons(0);
  }, []);

  useEffect(() => {
    if (viewMode === "favorites") {
      getFavoritePokemons(favorites);
    } else if (viewMode === "all" && !currentType) {
      fetchPokemons(0);
    }
  }, [viewMode]);

  // ⚠️ REMOVA ESTE useEffect COMPLETAMENTE ⚠️
  // useEffect(() => {
  //   if (viewMode === "search" && searchTerm) {
  //     searchPokemon(searchTerm);
  //   }
  // }, [searchTerm]);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setViewMode("search");
    clearTypeFilter();
    searchPokemon(query); // ÚNICA chamada da busca
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setViewMode("all");
    clearTypeFilter();
    fetchPokemons(0);
  };

  const handleShowFavorites = () => {
    setViewMode("favorites");
    clearTypeFilter();
  };

  const handleShowAll = () => {
    setViewMode("all");
    clearTypeFilter();
    fetchPokemons(0);
  };

  const handleTypeSelect = async (typeName) => {
    await fetchPokemonsByType(typeName);
    setViewMode("all");
    setSearchTerm("");
  };

  const nextPage = () => {
    if (currentType) return;
    if (currentOffset + limit < totalCount) {
      fetchPokemons(currentOffset + limit);
    }
  };

  const prevPage = () => {
    if (currentType) return;
    if (currentOffset - limit >= 0) {
      fetchPokemons(currentOffset - limit);
    }
  };

  const hasNextPage = !currentType && totalCount && currentOffset + limit < totalCount;
  const hasPrevPage = !currentType && currentOffset > 0;
  const startNumber = currentOffset + 1;
  const endNumber = Math.min(currentOffset + limit, totalCount || 0);

  return (
    <div className="container">
      <h1 className="my-4 text-center">Pokédex Premium</h1>

      <div className="row justify-content-center mb-3">
        <div className="col-md-10">
          <TypeFilter 
            onTypeSelect={handleTypeSelect}
            selectedType={currentType}
            onClear={handleClearSearch}
          />
        </div>
      </div>

      <div className="row justify-content-center mb-3">
        <div className="col-md-8">
          <SearchBar 
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="row justify-content-center mb-3">
        <div className="col-md-8 d-flex justify-content-between flex-wrap">
          <button 
            className={`btn mb-2 ${viewMode === "favorites" ? "btn-danger active" : "btn-danger"}`}
            onClick={handleShowFavorites}
            disabled={loading}
          >
            <i className="fas fa-heart"></i> Favoritos ({favorites.size})
          </button>
          <button 
            className={`btn mb-2 ${viewMode === "all" && !currentType ? "btn-success active" : "btn-success"}`}
            onClick={handleShowAll}
            disabled={loading}
          >
            <i className="fas fa-globe"></i> Todos os Pokémon
          </button>
        </div>
      </div>

      {currentType && !loading && !error && (
        <div className="alert alert-info text-center">
          Tipo: {currentType} | Pokémon: {totalCount}
        </div>
      )}

      {viewMode === "search" && searchTerm && !loading && !error && pokemons.length === 1 && (
        <div className="alert alert-success text-center">
          ✅ Resultado para "{searchTerm}" - 1 Pokémon encontrado
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-warning text-center">{error}</div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary"></div>
          <p>Carregando...</p>
        </div>
      )}

      {viewMode === "all" && !currentType && !loading && !error && totalCount > 0 && (
        <div className="d-flex justify-content-between align-items-center my-3">
          <button className="btn btn-primary" onClick={prevPage} disabled={!hasPrevPage || loading}>
            <i className="fas fa-arrow-left"></i> Anterior
          </button>
          <span className="text-muted">
            Mostrando {startNumber} - {endNumber} de {totalCount} Pokémon
          </span>
          <button className="btn btn-primary" onClick={nextPage} disabled={!hasNextPage || loading}>
            Próxima <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {!loading && !error && pokemons.length > 0 && (
        <div className="row">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isFavorite={isFavorite(pokemon.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => {
                setSelectedPokemon(pokemon);
                setShowModal(true);
              }}
              searchTerm={viewMode === "search" ? searchTerm : ""}
            />
          ))}
        </div>
      )}

      <PokemonModal 
        show={showModal}
        onHide={() => setShowModal(false)}
        pokemon={selectedPokemon}
      />
    </div>
  );
}

export default App;