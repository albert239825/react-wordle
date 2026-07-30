export const MAX_WORD_LENGTH = 5;
export const MAX_CHALLENGES = 6;
export const ALERT_DELAY = 2000;

export const KEYBOARD_LAYOUTS = {
  qwerty: {
    name: 'QWERTY',
    rows: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ],
  },
  azerty: {
    name: 'AZERTY',
    rows: [
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
      ['W', 'X', 'C', 'V', 'B', 'N'],
    ],
  },
  dvorak: {
    name: 'Dvorak',
    rows: [
      ['P', 'Y', 'F', 'G', 'C', 'R', 'L'],
      ['A', 'O', 'E', 'U', 'I', 'D', 'H', 'T', 'N', 'S'],
      ['Q', 'J', 'K', 'X', 'B', 'M', 'W', 'V', 'Z'],
    ],
  },
};

export const DEFAULT_KEYBOARD_LAYOUT = 'qwerty';
