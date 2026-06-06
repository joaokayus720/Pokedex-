import React from "react";
import "./PokemonCard.css";

const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onClick, searchTerm = "" }) => {
  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const imageUrl = pokemon.sprites?.other?.["official-artwork"]?.front_default || 
                   pokemon.sprites?.front_default || 
                   "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/default.png";

  return (
    <div className="col-md-4 col-sm-6 pokemon-card">
      <div className="card">
        <div
          className={`favorite-icon ${isFavorite ? "favorited" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pokemon.id);
          }}
        >
          <i className={`${isFavorite ? "fas fa-heart" : "far fa-heart"}`}></i>
        </div>
        
        <img
          src={imageUrl}
          className="card-img-top"
          alt={pokemon.name}
          onClick={onClick}
          onError={(e) => {
            e.target.src = pokemon.sprites?.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/default.png";
          }}
        />
        
        <div className="card-body" onClick={onClick}>
          <h5 className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(pokemon.name, searchTerm) }}></h5>
          
          <p className="card-text"><strong><i className="fas fa-hashtag"></i> ID:</strong> {pokemon.id}</p>
          
          <p className="card-text">
            <strong><i className="fas fa-dragon"></i> Tipo:</strong> {pokemon.types?.map(t => t.type.name).join(", ")}
          </p>
          
          <p className="card-text">
            <strong><i className="fas fa-brain"></i> Habilidades:</strong> {pokemon.abilities?.map(a => a.ability.name.replace(/-/g, " ")).join(", ").substring(0, 30)}...
          </p>
          
          <div className="stats-mini">
            <small>
              <i className="fas fa-heartbeat"></i> HP: {pokemon.stats?.[0]?.base_stat || "N/A"} | 
              <i className="fas fa-fist-raised ms-2"></i> ATK: {pokemon.stats?.[1]?.base_stat || "N/A"} | 
              <i className="fas fa-tachometer-alt ms-2"></i> SPD: {pokemon.stats?.[5]?.base_stat || "N/A"}
            </small>
          </div>
          
          <p className="card-text mt-2">
            <small>
              <i className="fas fa-arrow-up"></i> {(pokemon.height / 10).toFixed(1)} m | 
              <i className="fas fa-weight-hanging ms-2"></i> {(pokemon.weight / 10).toFixed(1)} kg
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;