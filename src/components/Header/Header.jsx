import {
  BsArrowRepeat,
  BsBarChart,
  BsGear,
  BsInfoCircle,
} from 'react-icons/bs';
import styles from './Header.module.scss';

const Header = ({
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsSettingsModalOpen,
  isPracticeMode,
  onNewPracticeGame,
}) => {
  return (
    <header>
      <div>
        <button onClick={() => setIsInfoModalOpen(true)}>
          <BsInfoCircle size="1.6rem" color="var(--color-icon)" />
        </button>
      </div>
      <h1>{isPracticeMode ? 'PRACTICE' : 'WORDLE'}</h1>
      <div>
        {isPracticeMode && (
          <button className={styles.newGame} onClick={onNewPracticeGame}>
            <BsArrowRepeat size="1.6rem" color="var(--color-icon)" />
          </button>
        )}
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
