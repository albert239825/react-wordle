import { useEffect, useState } from 'react';
import classNames from 'classnames';
import CountDown from 'react-countdown';
import Modal from 'components/Modal';
import styles from './StatsModal.module.scss';
import { shareStatus, tomorrow } from 'lib/words';

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
  onResetStats,
}) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsConfirmingReset(false);
  }, [isOpen]);

  const handleShare = () => {
    shareStatus(guesses, isGameLost, isHardMode);
    showAlert('Game copied to clipboard', 'success');
  };

  const handleResetStats = () => {
    onResetStats();
    setIsConfirmingReset(false);
    showAlert('Statistics reset', 'success');
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
      {isConfirmingReset ? (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid var(--color-border, #5d6061)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Reset all statistics? This cannot be undone.
          </p>
          <button
            onClick={handleResetStats}
            style={{
              background: '#d33',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 500,
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
            }}
          >
            Yes, reset
          </button>
          <button
            onClick={() => setIsConfirmingReset(false)}
            style={{
              background: '#5d6061',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 500,
              padding: '0.5rem 1rem',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsConfirmingReset(true)}
          style={{
            marginTop: '1rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            textDecoration: 'underline',
          }}
        >
          Reset statistics
        </button>
      )}
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
