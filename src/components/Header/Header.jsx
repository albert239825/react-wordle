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

  return (
    <header>
      <div>
        <button onClick={() => setIsInfoModalOpen(true)}>
          <BsInfoCircle size="1.6rem" color="var(--color-icon)" />
        </button>
        <button
          onClick={onTogglePractice}
          title={isPractice ? 'Leave Practice mode' : 'Enter Practice mode'}
        >
          <BsController
            size="1.6rem"
            color={isPractice ? 'var(--color-correct)' : 'var(--color-icon)'}
          />
        </button>
        <button
          onClick={() => setIsArchiveModalOpen(true)}
          title="Puzzle archive"
        >
          <BsCalendarWeek size="1.6rem" color="var(--color-icon)" />
        </button>
      </div>
      <h1>WORDLE</h1>
      <div>
        <button onClick={() => setIsStatsModalOpen(true)}>
          <BsBarChart size="1.6rem" color="var(--color-icon)" />
        </button>
        <button onClick={() => setIsSettingsModalOpen(true)}>
          <BsGear size="1.6rem" color="var(--color-icon)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
