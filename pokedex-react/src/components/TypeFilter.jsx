import React, { useState, useEffect } from 'react';

const TypeFilter = ({ onTypeSelect, selectedType, onClear }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
  };

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();
        setTypes(data.results);
      } catch (error) {
        console.error('Erro ao carregar tipos:', error);
      }
      setLoading(false);
    };
    loadTypes();
  }, []);

  return (
    <div style={{ background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h6 style={{ margin: 0, color: '#2c3e50', fontWeight: 'bold' }}>
          <i className="fas fa-filter"></i> Filtrar por Tipo
        </h6>
        {selectedType && (
          <button className="btn btn-sm btn-danger" onClick={onClear}>
            <i className="fas fa-times"></i> Limpar
          </button>
        )}
      </div>
      
      {loading && <div className="text-center"><small>Carregando tipos...</small></div>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '5px' }}>
        <button
          style={{
            border: 'none',
            borderRadius: '20px',
            padding: '6px 14px',
            backgroundColor: '#6c757d',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={onClear}
        >
          <i className="fas fa-globe"></i> Todos
        </button>
        
        {types.map((type) => (
          <button
            key={type.name}
            style={{
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              backgroundColor: typeColors[type.name] || '#A8A878',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: selectedType === type.name ? 1 : 0.7
            }}
            onClick={() => onTypeSelect(type.name)}
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeFilter;