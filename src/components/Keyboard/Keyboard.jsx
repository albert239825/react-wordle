import { useEffect } from 'react';
import classNames from 'classnames';
import { getStatuses } from 'lib/words';
import {
  KEYBOARD_LAYOUTS,
  DEFAULT_KEYBOARD_LAYOUT,
} from 'constants/keyboardLayouts';
import styles from './Keyboard.module.scss';

const Keyboard = ({
  onEnter,
  onDelete,
  onKeyDown,
  guesses,
  solution,
  layout,
}) => {
  const charStatuses = getStatuses(guesses, solution);
  const rows = (
    KEYBOARD_LAYOUTS[layout] || KEYBOARD_LAYOUTS[DEFAULT_KEYBOARD_LAYOUT]
  ).rows;

  useEffect(() => {
    const listener = e => {
      const key = e.key.toUpperCase();
      if (key === 'BACKSPACE') return onDelete();
      if (key === 'ENTER') return onEnter();
      if (key.length === 1 && key >= 'A' && key <= 'Z') onKeyDown(key);
    };

    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  });

  const handleClick = key => {
    if (key === 'ENTER') return onEnter();
    if (key === 'DELETE') return onDelete();

    onKeyDown(key);
  };

  return (
    <div className={styles.keyboard}>
      {rows.map((row, i) => (
        <div className={styles.row} key={i}>
          {i === rows.length - 1 && (
            <Key value="DELETE" onClick={handleClick} status="action" />
          )}
          {row.map(char => (
            <Key
              key={char}
              value={char}
              status={charStatuses[char]}
              onClick={handleClick}
            />
          ))}
          {i === rows.length - 1 && (
            <Key value="ENTER" onClick={handleClick} status="action" />
          )}
        </div>
      ))}
    </div>
  );
};

const Key = ({ value, status, onClick }) => {
  const classes = classNames({
    [styles.key]: true,
    [styles.absent]: status === 'absent',
    [styles.present]: status === 'present',
    [styles.correct]: status === 'correct',
    [styles.action]: status === 'action',
  });

  return (
    <button className={classes} onClick={() => onClick(value)}>
      {value}
    </button>
  );
};

export default Keyboard;
