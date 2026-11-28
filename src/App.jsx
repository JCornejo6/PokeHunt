import { useState } from 'react';
import './App.css';
import Guessing from './Guessing.jsx';
import Pokedex from "./Dex.jsx"

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [saveMessage,setSaveMessage] = useState("");

  /* open pokedex */ 
  const [caughtPokemon, setCaughtPokemon] = useState(()=>{
    try{
      const savedPokemon=localStorage.getItem("pokeHuntSave");
      return savedPokemon ? JSON.parse(savedPokemon) : [];
    } catch{
      return [];
    }
  });
  const [pokedexOpen, setPokedexOpen] = useState(false);

  {/*controls wheihter Start menu is open */}
  const [menuOpen, setMenuOpen] = useState(false);

  function addCaughtPokemon(pokemon) {
    setCaughtPokemon((previous) => {
      if (previous.some((caught) => caught.id === pokemon.id)) {
        return previous;
      }

      return [...previous, pokemon];
    });
  }
//save game
  function saveGame(){
    try{
      localStorage.setItem("pokeHuntSave", JSON.stringify(caughtPokemon));
      setSaveMessage ("Game Saved!")

      setTimeout(() => {
        setSaveMessage("");
      }, 200);
    } catch {
      setSaveMessage("Could not save game.");
    }
  }
    
  

  function checkOpenPokedex() {
    setPokedexOpen(true);
    setMenuOpen(false);
  }

  function startGame() {
    setTransitioning(true);

    setTimeout(() => {
      setGameStarted(true);
      setTransitioning(false);
    }, 1000);
  }

  {/*Open/Close start menu*/}
  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  {/*Return to title screen*/}
  function returnToStart() {
    setTransitioning(true);

    setTimeout(() => {
      setGameStarted(false);
      setMenuOpen(false);
      setTransitioning(false);
      setPokedexOpen(false);
    }, 1000);
  }

  return (
    <div className="app">
      {/* Title SCREEN */}
      {!gameStarted && (
        <div className="startScreen">
          <h1 className="gameTitle">PokeHunt</h1>

          <button className="startButton" onClick={startGame}>
            <span className="arrow">▶</span>
            Start
          </button>
        </div>
      )}

      {/*Game Screen*/}
      {gameStarted && (
        <div className="gameScreen">
          {/*Whos that poke? guessing game*/}
          <Guessing onCorrectGuess={addCaughtPokemon} />

          {/*Select*/}
          <button className="gameControl selectButton">
            SELECT
          </button>

          {/*Start */}
          <button
            className="gameControl gameStartButton"
            onClick={toggleMenu}
          >
            START
          </button>

          {/*Start Menu*/}
          {menuOpen && (
            <div className="pokemonMenu">
              <button onClick={checkOpenPokedex}>
                POKEDEX
              </button>

              
              <button onClick={saveGame}>Save</button>
              <button>Options</button>

              <button
                className="returnButton"
                onClick={returnToStart}
              >
                Return to Title Screen
              </button>
            </div>
          )}

          {/*pokedex*/}
          {pokedexOpen && (
            <Pokedex
              caughtPokemon={caughtPokemon}
              onClose={() => setPokedexOpen(false)}
            />
          )}

          {saveMessage&&(
            <p className = "saveMessage">{saveMessage}</p>

          )}
        </div>
      )}

      {/* TRANSITION */}
      <div
        className={`transition ${
          transitioning ? 'transitionActive' : ''
        }`}
      />
    </div>
  );
}

export default App;