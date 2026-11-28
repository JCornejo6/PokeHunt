import { formatPokemonName } from './pokeApi.js';

function Pokedex({ caughtPokemon, onClose }) {
  return (
    <section className="pokedex" aria-label="Pokédex">
      <header className="pokedexHeader">
        <div className="pokedexCamera" aria-hidden="true" />

        <div className="pokedexLights" aria-hidden="true">
          <span />
           <span />
            <span />
            </div>

        <button 
        className = "pokedexClose"
        type = "button"
        onClick={onClose}
        aria-label="Close Pokedex"
        >
          close
        </button>
        </header>

        <div className = "pokedexBody">
        <div className = "pokedexScreen">
        <div className = "pokedexScreenTop">
          <h2>Pokedex</h2>
          <p>Caught: {caughtPokemon.length}</p>
          </div>

          {caughtPokemon.length === 0? (
            <p className="pokedexEmpty">No Pokemon found.
            Guess correctly to add one! </p>
          ) : (
            <div className = "pokemonGrid">
              {caughtPokemon.map((pokemon) => (
                <article className = "pokedexEntry" key = {pokemon.id}>
                  <img
                  src = {pokemon.imageUrl}
                  alt = {formatPokemonName(pokemon.name)}
                  />

                  <span className = "pokedexNumber">
                    #{String(pokemon.id).padStart(3,"0")}
                    </span> 

                    <strong> {formatPokemonName(pokemon.name)} 
                    </strong>
                    </article>
                    ))}
                    </div>
          )}
          </div>
          </div>
          </section>
  );
}

    export default Pokedex;