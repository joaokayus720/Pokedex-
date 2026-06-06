import React from "react";

const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onClick, searchTerm = "" }) => {
  const imageUrl = pokemon.sprites?.other?.["official-artwork"]?.front_default || 
                   pokemon.sprites?.front_default || 
                   "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/default.png";

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

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
        />
        <div className="card-body" onClick={onClick}>
          <h5 className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(pokemon.name, searchTerm) }}></h5>
          <p><strong>ID:</strong> {pokemon.id}</p>
          <p><strong>Tipo:</strong> {pokemon.types?.map(t => t.type.name).join(", ")}</p>
          <p><small>Altura: {(pokemon.height/10).toFixed(1)}m | Peso: {(pokemon.weight/10).toFixed(1)}kg</small></p>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
