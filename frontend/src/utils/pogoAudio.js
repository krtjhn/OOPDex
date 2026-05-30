export const playPogoSound = (fileName, volume = 0.65) => {
  if (!fileName) return;

  try {
    const audio = new Audio(`/assets/pokemon-audio/${fileName}`);
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.play().catch(() => {});
  } catch {
    // Browser audio permissions can block playback; UI should continue quietly.
  }
};
