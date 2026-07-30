import { useState } from 'react';
import Modal from 'components/Modal';
import { solutionIndex, getDateFromIndex, getIndexFromDate } from 'lib/words';
import styles from './ArchiveModal.module.scss';

const toInputValue = date => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const ArchiveModal = ({ isOpen, onClose, onPlay }) => {
  const minDate = toInputValue(getDateFromIndex(0));
  const maxDate = toInputValue(getDateFromIndex(solutionIndex));
  const [date, setDate] = useState(maxDate);

  const handlePlay = () => {
    const index = getIndexFromDate(date);
    if (index < 0 || index > solutionIndex) return;
    onPlay(index);
  };

  return (
    <Modal title="Puzzle Archive" isOpen={isOpen} onClose={onClose}>
      <p className={styles.desc}>
        Pick a past day to replay its puzzle. Archive games don't affect your
        statistics.
      </p>
      <div className={styles.picker}>
        <input
          className={styles.dateInput}
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={e => setDate(e.target.value)}
        />
        <button className={styles.play} onClick={handlePlay}>
          Play
        </button>
      </div>
    </Modal>
  );
};

export default ArchiveModal;
