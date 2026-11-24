const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const MAX_FETCH_ATTEMPTS = 5;

// Pokemon that have no front_default sprite
const POKEMON_IDS_WITHOUT_SPRITES = new Set([
  10264, // koraidon-limited-build
  10265, // koraidon-sprinting-build
  10266, // koraidon-swimming-build
  10267, // koraidon-gliding-build
  10268, // miraidon-low-power-mode
  10269, // miraidon-drive-mode
  10270, // miraidon-aquatic-mode
  10271, // miraidon-glide-mode
  10301  // zygarde-mega
]);

let cachedPokemonCount = null;

// PokeAPI ids are not continuous (1-1025, then alternate forms start at 10001),
// instead of guessing an id we pick a random position in PokeAPI's full list.
async function getPokemonCount() {
  if (cachedPokemonCount !== null) {
    return cachedPokemonCount;
  }

  const countResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1`);
  if (!countResponse.ok) {
    throw new Error(`PokeAPI returned ${countResponse.status}`);
  }

  const countData = await countResponse.json();
  cachedPokemonCount = countData.count;
  return cachedPokemonCount;
}

// Uses the in-game sprite (sprites.front_default) 
// CSS blacks it into a silhouette
function pickSpriteUrl(pokemonData) {
  return pokemonData.sprites?.front_default || null;
}

// Returns { id, url } for the pokemon at that position in PokeAPI's list.
// The id is read from the url (".../pokemon/10264/"), so no extra request is needed.
async function fetchListEntryAtPosition(listPosition, abortSignal) {
  const listResponse = await fetch(
    `${POKEAPI_BASE_URL}/pokemon?limit=1&offset=${listPosition}`,
    { signal: abortSignal }
  );
  if (!listResponse.ok) {
    throw new Error(`PokeAPI returned ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  const pokemonEntry = listData.results[0];
  const pokemonId = Number(pokemonEntry.url.split("/").filter(Boolean).pop());

  return { id: pokemonId, url: pokemonEntry.url };
}

async function fetchPokemonDetails(pokemonUrl, abortSignal) {
  const pokemonResponse = await fetch(pokemonUrl, { signal: abortSignal });
  if (!pokemonResponse.ok) {
    throw new Error(`PokeAPI returned ${pokemonResponse.status}`);
  }

  const pokemonData = await pokemonResponse.json();

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    speciesName: pokemonData.species.name,
    imageUrl: pickSpriteUrl(pokemonData)
  };
}

// Returns: id, name, speciesName, imageUrl for a random pokemon.
// Ids in POKEMON_IDS_WITHOUT_SPRITES are skipped
// Any other pokemon that turns out to have no sprite is also skipped
export async function fetchRandomPokemon(abortSignal) {
  const pokemonCount = await getPokemonCount();

  for (let attemptNumber = 0; attemptNumber < MAX_FETCH_ATTEMPTS; attemptNumber++) {
    const randomPosition = Math.floor(Math.random() * pokemonCount);
    const listEntry = await fetchListEntryAtPosition(randomPosition, abortSignal);

    if (POKEMON_IDS_WITHOUT_SPRITES.has(listEntry.id)) {
      continue;
    }

    const randomPokemon = await fetchPokemonDetails(listEntry.url, abortSignal);

    if (randomPokemon.imageUrl) {
      return randomPokemon;
    }
  }

  throw new Error("Could not find a pokemon with a sprite");
}

// "Mr. Mime" -> "mrmime", "Flabébé" -> "flabebe", "Nidoran♀" -> "nidoranf"
export function normalizePokemonName(rawName) {
  return rawName
    .toLowerCase()
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Accepts the exact form name ("charizard-mega-x") or the base species ("charizard").
export function isCorrectGuess(guessText, pokemon) {
  const normalizedGuess = normalizePokemonName(guessText);
  if (normalizedGuess === "") {
    return false;
  }

  return (
    normalizedGuess === normalizePokemonName(pokemon.name) ||
    normalizedGuess === normalizePokemonName(pokemon.speciesName)
  );
}

// "mr-mime" -> "Mr Mime"
export function formatPokemonName(pokemonSlug) {
  return pokemonSlug
    .split("-")
    .map(function (namePart) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    })
    .join(" ");
}
