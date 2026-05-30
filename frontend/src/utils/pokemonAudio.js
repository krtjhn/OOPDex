/**
 * Utility to play Pokémon cries/audio
 */

export const playPokemonCry = (pokemonId, volume = 1.0) => {
  try {
    if (!pokemonId) return;
    
    const audio = new Audio(`/assets/pokemon-audio/${pokemonId}.ogg`);
    audio.volume = Math.min(volume, 1.0); // Clamp volume to max 1.0
    
    audio.play().catch((error) => {
      // Silently fail if audio can't play (autoplay restrictions, etc.)
      console.debug(`Could not play pokemon cry for ID ${pokemonId}:`, error.message);
    });
  } catch (error) {
    // Silently fail
    console.debug(`Error playing pokemon cry:`, error.message);
  }
};
