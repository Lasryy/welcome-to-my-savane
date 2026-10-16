const PASSWORD_GROUPS = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%&*+-=?_",
];
const PASSWORD_ALPHABET = PASSWORD_GROUPS.join("");

function randomIndex(length, cryptoSource) {
  const bytes = new Uint8Array(1);
  const ceiling = Math.floor(256 / length) * length;
  do {
    cryptoSource.getRandomValues(bytes);
  } while (bytes[0] >= ceiling);
  return bytes[0] % length;
}

export function generateSecurePassword(previousPassword = "", cryptoSource = globalThis.crypto) {
  if (!cryptoSource?.getRandomValues) {
    throw new Error("Un générateur cryptographique est nécessaire pour créer ce mot de passe.");
  }

  const characters = PASSWORD_GROUPS.map(
    (group) => group[randomIndex(group.length, cryptoSource)],
  );
  while (characters.length < 20) {
    characters.push(PASSWORD_ALPHABET[randomIndex(PASSWORD_ALPHABET.length, cryptoSource)]);
  }
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const otherIndex = randomIndex(index + 1, cryptoSource);
    [characters[index], characters[otherIndex]] = [
      characters[otherIndex],
      characters[index],
    ];
  }

  if (characters.join("") === previousPassword) {
    const differentIndex = characters.findIndex((character) => character !== characters[0]);
    [characters[0], characters[differentIndex]] = [
      characters[differentIndex],
      characters[0],
    ];
  }

  return characters.join("");
}
