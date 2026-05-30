export const POKEMON_TYPES = [
  'All',
  'Grass',
  'Fire',
  'Water',
  'Bug',
  'Normal',
  'Poison',
  'Electric',
  'Ground',
  'Fairy',
  'Fighting',
  'Psychic',
  'Rock',
  'Ghost',
  'Ice',
  'Dragon'
];

export function padPokemonCode(id) {
  if (id === null || id === undefined || Number.isNaN(Number(id))) return '—';
  const value = Number(id);
  if (value < 10) return `#00${value}`;
  if (value < 100) return `#0${value}`;
  return `#${value}`;
}

export function getPokemonName(pokemon) {
  return (pokemon?.name || '').trim();
}

export function getPokemonTypes(pokemon) {
  if (!pokemon) return [];

  if (pokemon.type1 || pokemon.type2) {
    return [pokemon.type1, pokemon.type2].filter(Boolean).map((type) => String(type).trim());
  }

  if (typeof pokemon.types === 'string') {
    return pokemon.types
      .split(',')
      .map((type) => type.trim())
      .filter(Boolean);
  }

  return [];
}

export function getPrimaryPokemonType(pokemon) {
  const types = getPokemonTypes(pokemon);
  return (types[0] || 'normal').toLowerCase();
}

export function matchesPokemonSearch(pokemon, query) {
  if (!query || !query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const name = getPokemonName(pokemon).toLowerCase();
  const id = String(pokemon?.id ?? '');
  const code = padPokemonCode(pokemon?.id).toLowerCase();
  const digitsOnly = normalizedQuery.replace(/[^0-9]/g, '');

  return (
    name.includes(normalizedQuery) ||
    id.includes(normalizedQuery) ||
    code.includes(normalizedQuery) ||
    (digitsOnly.length > 0 && id.includes(digitsOnly))
  );
}

export function matchesPokemonType(pokemon, selectedType) {
  if (!selectedType || selectedType === 'All') return true;

  const selected = selectedType.toLowerCase();
  return getPokemonTypes(pokemon).some((type) => type.toLowerCase() === selected);
}

export function filterPokemonList(pokemonList, searchTerm, selectedType = 'All') {
  return (pokemonList || []).filter((pokemon) => {
    return matchesPokemonSearch(pokemon, searchTerm) && matchesPokemonType(pokemon, selectedType);
  });
}
