import { useState } from 'react';
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

  const handleShare = () => {
    shareStatus(guesses, isGameLost, isHardMode);
    showAlert('Game copied to clipboard', 'success');
  };

  const handleConfirmReset = () => {
    onResetStats();
    setIsConfirmingReset(false);
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
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        {!isConfirmingReset ? (
          <button
            onClick={() => setIsConfirmingReset(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e74c3c',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Reset statistics
          </button>
        ) : (
          <div style={{ fontSize: '0.9rem' }}>
            <p style={{ margin: '0 0 0.75rem' }}>
              Reset all statistics? This cannot be undone.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={handleConfirmReset}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#e74c3c',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={() => setIsConfirmingReset(false)}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: '1px solid #888',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
