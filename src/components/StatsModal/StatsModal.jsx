import { useRef } from 'react';
import classNames from 'classnames';
import CountDown from 'react-countdown';
import Modal from 'components/Modal';
import styles from './StatsModal.module.scss';
import { shareStatus, tomorrow, isValidStats } from 'lib/words';
import { GAME_MODES } from 'constants/settings';

const StatsModal = ({
  isOpen,
  onClose,
  gameStats,
  setStats,
  numberOfGuessesMade,
  isGameWon,
  isGameLost,
  isHardMode,
  guesses,
  showAlert,
  mode,
  solution,
  onNewPractice,
}) => {
  const fileInputRef = useRef();
  const isDaily = mode === GAME_MODES.DAILY;
  const isPractice = mode === GAME_MODES.PRACTICE;
  const isGameOver = isGameWon || isGameLost;

  const handleShare = () => {
    shareStatus(guesses, isGameLost, isHardMode);
    showAlert('Game copied to clipboard', 'success');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(gameStats, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wordle-stats.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showAlert('Statistics exported', 'success');
  };

  const handleImportClick = () => fileInputRef.current.click();

  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        if (!isValidStats(data)) throw new Error('Invalid stats file');
        setStats(data);
        showAlert('Statistics imported', 'success');
      } catch (error) {
        showAlert('Invalid statistics file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Modal title="Statistics" isOpen={isOpen} onClose={onClose}>
      <div className={styles.statsBar}>
        <StatItem label="Played" value={gameStats.totalGames} />
        <StatItem label="Win Rate %" value={gameStats.successRate} />
        <StatItem label="Current Streak" value={gameStats.currentStreak} />
        <StatItem label="Best Streak" value={gameStats.bestStreak} />
      </div>
      <h2>Guess Distribution</h2>
      <div className={styles.winDistribution}>
        {gameStats.winDistribution.map((value, i) => (
          <Progress
            key={i}
            index={i}
            currentDayStatRow={numberOfGuessesMade === i + 1}
            size={90 * (value / Math.max(...gameStats.winDistribution))}
            label={String(value)}
          />
        ))}
      </div>
      {isGameOver && !isDaily && (
        <div className={styles.answer}>
          The word was <strong>{solution.toUpperCase()}</strong>
        </div>
      )}
      {isGameOver && isDaily && (
        <div className={styles.result}>
          <div className={styles.countDown}>
            <h2>Next word in</h2>
            <CountDown
              date={tomorrow}
              daysInHours={true}
              className={styles.time}
            />
          </div>
          <div className={styles.share}>
            <button onClick={handleShare}>Share</button>
          </div>
        </div>
      )}
      {isGameOver && isPractice && (
        <div className={styles.result}>
          <div className={styles.share}>
            <button onClick={onNewPractice}>New Practice Word</button>
          </div>
        </div>
      )}
      <div className={styles.backup}>
        <button onClick={handleExport}>Export Stats</button>
        <button onClick={handleImportClick}>Import Stats</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className={styles.fileInput}
          onChange={handleImport}
        />
      </div>
    </Modal>
  );
};

const StatItem = ({ label, value }) => {
  return (
    <div className={styles.statItem}>
      <h3 className={styles.value}>{value}</h3>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

const Progress = ({ index, label, size, currentDayStatRow }) => {
  const classes = classNames({
    [styles.line]: true,
    [styles.blue]: currentDayStatRow,
    [styles.gray]: !currentDayStatRow,
  });

  return (
    <div className={styles.progress}>
      <div className={styles.index}>{index + 1}</div>
      <div className={styles.row}>
        <div className={classes} style={{ width: `${8 + size}%` }}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
