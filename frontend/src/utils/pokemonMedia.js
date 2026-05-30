export const getPokemonGif = (id) => {
  return getPokemonGifPath(id);
};

export const getPokemonSprite = (id) => {
  return getPokemonSpritePath(id);
};

const DEFAULT_ID = 25;

export const getPokemonGifPath = (id) => {
  const normalizedId = Number(id);
  if (!Number.isInteger(normalizedId) || normalizedId < 1 || normalizedId > 151) {
    return `/assets/pokemon-gifs/${DEFAULT_ID}.gif`;
  }

  return `/assets/pokemon-gifs/${normalizedId}.gif`;
};

export const getPokemonSpritePath = (id) => {
  const normalizedId = Number(id);
  if (!Number.isInteger(normalizedId) || normalizedId < 1 || normalizedId > 151) {
    return `/assets/pokemon-3d/${DEFAULT_ID}.png`;
  }

  return `/assets/pokemon-3d/${normalizedId}.png`;
};

export const getPokemonVisual = ({ id, gifUrl } = {}) => {
  // Keep backend-provided GIF if it's already local.
  if (gifUrl && gifUrl.startsWith("/assets/pokemon-gifs/")) {
    return gifUrl;
  }

  return getPokemonGifPath(id);
};
