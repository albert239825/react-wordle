import {
  BsBarChart,
  BsGear,
  BsInfoCircle,
  BsController,
  BsCalendarWeek,
} from 'react-icons/bs';
import { GAME_MODES } from 'constants/settings';
import './Header.module.scss';

const Header = ({
  mode,
  onTogglePractice,
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsSettingsModalOpen,
  setIsArchiveModalOpen,
}) => {
  const isPractice = mode === GAME_MODES.PRACTICE;

  // Drop focus so a subsequent Enter keypress goes to the game, not the button.
  const run = handler => e => {
    e.currentTarget.blur();
    handler();
  };

  return (
    <header>
      <div>
        <button onClick={run(() => setIsInfoModalOpen(true))}>
          <BsInfoCircle size="1.6rem" color="var(--color-icon)" />
        </button>
        <button
          onClick={run(onTogglePractice)}
          title={isPractice ? 'Leave Practice mode' : 'Enter Practice mode'}
        >
          <BsController
            size="1.6rem"
            color={isPractice ? 'var(--color-correct)' : 'var(--color-icon)'}
          />
        </button>
        <button
          onClick={run(() => setIsArchiveModalOpen(true))}
          title="Puzzle archive"
        >
          <BsCalendarWeek size="1.6rem" color="var(--color-icon)" />
        </button>
      </div>
      <h1>WORDLE</h1>
      <div>
        <button onClick={run(() => setIsStatsModalOpen(true))}>
          <BsBarChart size="1.6rem" color="var(--color-icon)" />
        </button>
        <button onClick={run(() => setIsSettingsModalOpen(true))}>
          <BsGear size="1.6rem" color="var(--color-icon)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
