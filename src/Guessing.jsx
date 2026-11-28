import { useEffect, useRef, useState } from 'react';
import { fetchRandomPokemon, formatPokemonName, isCorrectGuess } from './pokeApi.js';

const MAX_GUESSES = 3;

function Guessing({onCorrectGuess}) {
  const [roundNumber, setRoundNumber] = useState(0);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [guessText, setGuessText] = useState("");
  const [guessResult, setGuessResult] = useState(null); // null | "correct" | "wrong" | "outOfGuesses" | "skipped"
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const guessInputRef = useRef(null);

  // Load a new random pokemon every time the round number changes
  useEffect(function () {
    const abortController = new AbortController();

    fetchRandomPokemon(abortController.signal)
      .then(function (randomPokemon) {
        setCurrentPokemon(randomPokemon);
        setIsLoading(false);
      })
      .catch(function (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setLoadError("Couldn't reach PokeAPI. Try again.");
        setIsLoading(false);
      });

    return function () {
      abortController.abort();
    };
  }, [roundNumber]);

  // Put the cursor back in the textbox once the new pokemon is ready
  useEffect(function () {
    if (!isLoading && guessInputRef.current) {
      guessInputRef.current.focus();
    }
  }, [isLoading]);

  const isRevealed =
    guessResult === "correct" || guessResult === "outOfGuesses" || guessResult === "skipped";
  const guessesLeft = MAX_GUESSES - wrongGuessCount;

  // Clear the old round, then bump the round number so the effect loads a new pokemon
  function startNextRound() {
    setIsLoading(true);
    setLoadError(null);
    setCurrentPokemon(null);
    setGuessText("");
    setGuessResult(null);
    setWrongGuessCount(0);
    setRoundNumber(function (previousRoundNumber) {
      return previousRoundNumber + 1;
    });
  }

  function submitGuess(submitEvent) {
    submitEvent.preventDefault();

    if (isRevealed) {
      startNextRound();
      return;
    }

    if (!currentPokemon || guessText.trim() === "") {
      return;
    }

    if (isCorrectGuess(guessText, currentPokemon)) {
      setGuessResult("correct");

    //adding to pokedex
    onCorrectGuess(currentPokemon);
    return;
    }

    const newWrongGuessCount = wrongGuessCount + 1;
    setWrongGuessCount(newWrongGuessCount);

    if (newWrongGuessCount >= MAX_GUESSES) {
      setGuessResult("outOfGuesses");
    } else {
      setGuessResult("wrong");
      // Highlight the wrong guess so typing the next one replaces it
      guessInputRef.current.select();
    }
  }

  function skipPokemon() {
    setGuessResult("skipped");
  }

  function updateGuessText(changeEvent) {
    setGuessText(changeEvent.target.value);
  }

  const guessWord = guessesLeft === 1 ? "guess" : "guesses";

  let feedbackMessage = "";
  if (guessResult === null && currentPokemon) {
    feedbackMessage = `${guessesLeft} ${guessWord} left`;
  } else if (guessResult === "correct") {
    feedbackMessage = `Correct! It's ${formatPokemonName(currentPokemon.name)}!`;
  } else if (guessResult === "wrong") {
    feedbackMessage = `Not quite... ${guessesLeft} ${guessWord} left!`;
  } else if (guessResult === "outOfGuesses") {
    feedbackMessage = `Out of guesses! It was ${formatPokemonName(currentPokemon.name)}!`;
  } else if (guessResult === "skipped") {
    feedbackMessage = `It was ${formatPokemonName(currentPokemon.name)}!`;
  }

  return (
    <div className='guessingGame'>
      <h1 className='guessingTitle'>Who's That Pokemon?</h1>

      <div className='silhouetteBox'>
        {isLoading && <p className='silhouetteStatus'>Loading...</p>}

        {loadError && (
          <div className='silhouetteStatus'>
            <p>{loadError}</p>
            <button className='guessButton' onClick={startNextRound}>
              Retry
            </button>
          </div>
        )}

        {currentPokemon && (
          <img
            className={`pokemonImage ${isRevealed ? "pokemonRevealed" : "pokemonSilhouette"}`}
            src={currentPokemon.imageUrl}
            alt={isRevealed ? formatPokemonName(currentPokemon.name) : "Pokemon silhouette"}
            draggable={false}
          />
        )}
      </div>

      <form className='guessForm' onSubmit={submitGuess}>
        <input
          ref={guessInputRef}
          className='guessInput'
          type='text'
          value={guessText}
          onChange={updateGuessText}
          placeholder='Enter your guess...'
          disabled={isLoading || loadError !== null}
          readOnly={isRevealed}
          autoComplete='off'
          spellCheck={false}
        />

        <button
          className='guessButton'
          type='submit'
          disabled={isLoading || loadError !== null}
        >
          {isRevealed ? "Next" : "Guess"}
        </button>

        {!isRevealed && (
          <button
            className='guessButton skipButton'
            type='button'
            onClick={skipPokemon}
            disabled={isLoading || loadError !== null}
          >
            Skip
          </button>
        )}
      </form>

      <p className={`guessFeedback ${guessResult ? `feedback-${guessResult}` : ""}`}>
        {feedbackMessage}
      </p>
    </div>
  );
}

export default Guessing;
