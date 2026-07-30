// On-screen keyboard layouts. Each layout is a list of rows of letter keys.
// The DELETE and ENTER action keys are added by the Keyboard component.
export const KEYBOARD_LAYOUTS = {
  qwerty: {
    label: 'QWERTY',
    rows: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ],
  },
  azerty: {
    label: 'AZERTY',
    rows: [
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
      ['W', 'X', 'C', 'V', 'B', 'N'],
    ],
  },
  colemak: {
    label: 'Colemak',
    rows: [
      ['Q', 'W', 'F', 'P', 'G', 'J', 'L', 'U', 'Y'],
      ['A', 'R', 'S', 'T', 'D', 'H', 'N', 'E', 'I', 'O'],
      ['Z', 'X', 'C', 'V', 'B', 'K', 'M'],
    ],
  },
};

export const DEFAULT_KEYBOARD_LAYOUT = 'qwerty';
