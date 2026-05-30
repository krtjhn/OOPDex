const profImage = '/assets/images/prof.jpg';

const PROFESSOR_OAK_USERNAME = 'oak';
const PROFESSOR_OAK_DISPLAY_NAME = 'Professor Oak';
const PROFESSOR_OAK_DEFAULT_PICTURE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/oak.png';

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

export const isProfessorOakAccount = (user) => {
  if (!user) return false;

  const username = normalizeValue(user.username);

  return username === PROFESSOR_OAK_USERNAME || username === PROFESSOR_OAK_DISPLAY_NAME.toLowerCase();
};

export const getProfessorOakDisplayProfile = (user) => {
  if (!isProfessorOakAccount(user)) {
    return user;
  }

  const profilePictureUrl = user.profilePictureUrl && user.profilePictureUrl !== PROFESSOR_OAK_DEFAULT_PICTURE_URL
    ? user.profilePictureUrl
    : profImage;

  return {
    ...user,
    username: PROFESSOR_OAK_DISPLAY_NAME,
    profilePictureUrl,
  };
};
