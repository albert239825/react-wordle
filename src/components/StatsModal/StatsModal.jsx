import { useRef } from 'react';
import classNames from 'classnames';
import CountDown from 'react-countdown';
import Modal from 'components/Modal';
import styles from './StatsModal.module.scss';
import { shareStatus, tomorrow } from 'lib/words';
import { downloadBackup, parseBackup } from 'lib/statsBackup';

const StatsModal = ({
  isOpen,
  onClose,
  gameStats,
  numberOfGuessesMade,
  isGameWon,
  isGameLost,
  isHardMode,
  guesses,
  showAlert,
  onImportBackup,
}) => {
  const fileInputRef = useRef();

  const handleShare = () => {
    shareStatus(guesses, isGameLost, isHardMode);
    showAlert('Game copied to clipboard', 'success');
  };

  const handleExport = () => {
    downloadBackup();
    showAlert('Stats backup downloaded', 'success');
  };

  const handleImportClick = () => fileInputRef.current.click();

  const handleImportFile = event => {
    const file = event.target.files[0];
    // Reset so selecting the same file again still fires onChange
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = parseBackup(reader.result);
        onImportBackup(data);
        showAlert('Stats restored from backup', 'success');
      } catch (error) {
        showAlert(error.message, 'error');
      }
    };
    reader.onerror = () => showAlert('Could not read the file', 'error');
    reader.readAsText(file);
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
      {(isGameWon || isGameLost) && (
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
      <div className={styles.backup}>
        <h2>Backup</h2>
        <div className={styles.backupButtons}>
          <button onClick={handleExport}>Export</button>
          <button onClick={handleImportClick}>Import</button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className={styles.hiddenInput}
          onChange={handleImportFile}
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
