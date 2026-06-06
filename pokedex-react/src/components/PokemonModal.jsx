import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PokemonModal = ({ show, onHide, pokemon }) => {
  if (!pokemon) return null;

  const getStatName = (statName) => {
    const stats = {
      hp: "HP", attack: "Ataque", defense: "Defesa",
      "special-attack": "Ataque Especial",
      "special-defense": "Defesa Especial",
      speed: "Velocidade"
    };
    return stats[statName] || statName;
  };

  const totalStats = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header style={{ background: "linear-gradient(135deg, #dc0a2d, #b00726)", color: "white" }}>
        <Modal.Title><i className="fas fa-paw"></i> {pokemon.name?.toUpperCase()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h6>Sprites</h6>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {pokemon.sprites?.front_default && <img src={pokemon.sprites.front_default} width="96" alt="frente" />}
            {pokemon.sprites?.back_default && <img src={pokemon.sprites.back_default} width="96" alt="costas" />}
            {pokemon.sprites?.front_shiny && <img src={pokemon.sprites.front_shiny} width="96" alt="shiny" />}
          </div>
        </div>

        <p><strong>ID:</strong> {pokemon.id}</p>
        <p><strong>Tipo(s):</strong> {pokemon.types?.map(t => t.type.name).join(", ")}</p>
        <p><strong>Altura:</strong> {(pokemon.height / 10).toFixed(1)} m | <strong>Peso:</strong> {(pokemon.weight / 10).toFixed(1)} kg</p>

        <h6><i className="fas fa-brain"></i> Habilidades</h6>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "15px" }}>
          {pokemon.abilities?.map((ability, index) => (
            <span key={index} style={{ backgroundColor: "#17a2b8", color: "white", padding: "5px 12px", borderRadius: "20px" }}>
              {ability.ability.name.replace(/-/g, " ")}
              {ability.is_hidden && <span style={{ backgroundColor: "#343a40", marginLeft: "5px", padding: "2px 8px", borderRadius: "15px" }}>Escondida</span>}
            </span>
          ))}
        </div>

        <h6><i className="fas fa-chart-line"></i> Estatísticas Base</h6>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {pokemon.stats?.map((stat, index) => {
              const percent = (stat.base_stat / 255) * 100;
              return (
                <tr key={index}>
                  <td style={{ padding: "8px", width: "120px" }}>{getStatName(stat.stat.name)}</td>
                  <td style={{ padding: "8px", width: "60px", textAlign: "center" }}>{stat.base_stat}</td>
                  <td style={{ padding: "8px" }}>
                    <div style={{ backgroundColor: "#e9ecef", borderRadius: "10px", overflow: "hidden", height: "20px" }}>
                      <div style={{ width: `${percent}%`, backgroundColor: stat.base_stat >= 100 ? "#28a745" : "#ffc107", height: "100%", textAlign: "center", fontSize: "11px" }}>
                        {stat.base_stat}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
              <td style={{ padding: "8px" }}>TOTAL</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{totalStats}</td>
              <td style={{ padding: "8px" }}>
                <div style={{ backgroundColor: "#e9ecef", borderRadius: "10px", overflow: "hidden", height: "20px" }}>
                  <div style={{ width: `${(totalStats / 780) * 100}%`, backgroundColor: "#007bff", height: "100%", textAlign: "center", fontSize: "11px", color: "white" }}>
                    {totalStats}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Fechar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PokemonModal;
