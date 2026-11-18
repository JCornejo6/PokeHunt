import { useState } from 'react';
import './App.css'


function App() {
const [gameStarted,setGameStarted]=useState(false);
const[transitioning,setTransitioning]= useState(false);

{/*controls wheihter Start menu is open */}
const [menuOpen,setMenuOpen] = useState(false);

  function startGame(){
    setTransitioning(true);

    setTimeout(()=>{
      setGameStarted(true);
      setTransitioning(false);
    },1000);
  }

  {/*Start encounter*/}
  function startEncounter(){
    console.log("Starting Wild Encounter!")
  }

  {/*Open/Close start menu*/}
  function toggleMenu(){
    setMenuOpen(!menuOpen);
  }

  {/*Return to title screen*/}
  function returnToStart(){
        setTransitioning(true);

    setTimeout(() => {
      setGameStarted(false);
      setMenuOpen(false);
      setTransitioning(false);
    }, 1000);

  }

  
  return (
    <div className='app'>

       {/* Title SCREEN */}
      {!gameStarted &&(
        <div className='startScreen'> 
        <h1 className='gameTitle'>
          PokeHunt
        </h1>

        <button
        className='startButton'
        onClick={startGame}
        >
          <span className='arrow'>▶</span>
          Start
        </button>

        </div>
      )}

     {/*Game Screen*/}
     {gameStarted &&(
      <div className='gameScreen'> 
      
      {/*Whos that poke?*/}
      <button 
      className='gameControl encounterButton'
      onClick={startEncounter}
      >
        Who's That Pokemon?
      </button>

      {/*Select*/}
      <button className='gameControl selectButton'>
        SELECT
      </button>

      {/*Start */}
      <button 
      className='gameControl gameStartButton'
      onClick={toggleMenu}>
        START
      </button>

      {/*Start Menu*/}
      {menuOpen && (
        <div className="pokemonMenu"> 

        <button>
          POKEDEX
        </button>

         <button>
          Pokemon
        </button>

        <button>
          Bag
        </button>

         <button>
          Trainer
        </button>

        <button>
          Save
        </button>

        <button>
          Options
        </button>

        <button
        className='returnButton'
        onClick={returnToStart}
        >
          Return to Title Screen
        </button>

        </div>
      )}
      </div>

     )}
          
      {/* TRANSITION */}
      <div className={`transition ${
        transitioning ? "transitionActive" : ""
      }`}
      />
      </div>

      );
      }


export default App;
